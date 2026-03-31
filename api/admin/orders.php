<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';
require_once '../../includes/EmailService.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check admin auth
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Get language preference from header
$language = isset($_SERVER['HTTP_X_LANGUAGE']) ? $_SERVER['HTTP_X_LANGUAGE'] : 'vi';

try {


    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['id'])) {
            // Get specific order details
            $stmt = $pdo->prepare("
                SELECT o.*, 
                COALESCE(c.full_name, 
                    CASE 
                        WHEN u.username IN ('customer_test', 'saleuser', 'huysale', 'tramsale') THEN 'Walk-in Customer' 
                        ELSE u.username 
                    END
                ) as customer_name, 
                COALESCE(c.email, u.email) as customer_email,
                s.store_name,
                COALESCE(u.full_name, u.username) as staff_name
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                LEFT JOIN customers c ON o.customer_id = c.id
                LEFT JOIN stores s ON o.store_id = s.store_id
                WHERE o.id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($order) {
                // Get order items
                $stmt = $pdo->prepare("SELECT oi.*, p.name as product_name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
                $stmt->execute([$_GET['id']]);
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode($order);
        } else {
            // Build Query
            $sql = "SELECT o.*, 
                    COALESCE(c.full_name, 
                        CASE 
                            WHEN u.username IN ('customer_test', 'saleuser', 'huysale', 'tramsale') THEN 'Walk-in Customer' 
                            ELSE u.username 
                        END
                    ) as customer_name,
                    COALESCE(c.email, u.email) as customer_email,
                    s.store_name,
                    COALESCE(u.full_name, u.username) as staff_name
                    FROM orders o 
                    LEFT JOIN users u ON o.user_id = u.id 
                    LEFT JOIN customers c ON o.customer_id = c.id
                    LEFT JOIN stores s ON o.store_id = s.store_id
                    WHERE 1=1";
            
            $params = [];

            // Search (ID or Customer Name or Phone?)
            if (isset($_GET['search']) && !empty($_GET['search'])) {
                $search = "%" . $_GET['search'] . "%";
                $sql .= " AND (o.id LIKE ? OR c.full_name LIKE ? OR u.username LIKE ?)";
                $params[] = $search;
                $params[] = $search;
                $params[] = $search;
            }

            // Store Filter
            if (isset($_GET['store_id']) && !empty($_GET['store_id'])) {
                $sql .= " AND o.store_id = ?";
                $params[] = $_GET['store_id'];
            }

            // Status Filter
            if (isset($_GET['status']) && !empty($_GET['status']) && $_GET['status'] !== 'all') {
                $sql .= " AND o.status = ?";
                $params[] = $_GET['status'];
            }
            
            // Payment Status Filter
            if (isset($_GET['payment_status']) && !empty($_GET['payment_status']) && $_GET['payment_status'] !== 'all') {
                $sql .= " AND o.payment_status = ?";
                $params[] = $_GET['payment_status'];
            }

            // Date Range
            if (isset($_GET['date_start']) && !empty($_GET['date_start'])) {
                $sql .= " AND DATE(o.created_at) >= ?";
                $params[] = $_GET['date_start'];
            }
            if (isset($_GET['date_end']) && !empty($_GET['date_end'])) {
                $sql .= " AND DATE(o.created_at) <= ?";
                $params[] = $_GET['date_end'];
            }

            $sql .= " ORDER BY o.created_at DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($orders);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Update order status
        $data = json_decode(file_get_contents("php://input"), true);
        $newStatus = $data['status'];
        $orderId = $data['id'];
        
        // Get current order info with user details
        $stmt = $pdo->prepare("SELECT o.*, u.username, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$order) {
            http_response_code(404);
            echo json_encode(['error' => 'Order not found']);
            exit;
        }
        
        $oldStatus = $order['status'];
        
        // Update status
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$newStatus, $orderId]);
        
        // Send email notification if status changed
        if ($oldStatus !== $newStatus) {
            try {
                $emailService = new EmailService($language);
                $emailService->sendOrderStatusUpdate(
                    $orderId, 
                    $order['email'], 
                    $order['username'], 
                    $oldStatus, 
                    $newStatus
                );
            } catch (Exception $emailError) {
                error_log("Status update email failed: " . $emailError->getMessage());
            }
        }
        
        echo json_encode([
            'success' => true, 
            'message' => 'Cập nhật trạng thái thành công',
            'email_sent' => ($oldStatus !== $newStatus)
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

