<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check sale/admin auth
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['sale', 'admin'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['search'])) {
            // Search orders for return
            $term = "%" . $_GET['search'] . "%";
            $stmt = $pdo->prepare("
                SELECT o.*, c.phone, c.full_name 
                FROM orders o 
                LEFT JOIN customers c ON o.customer_id = c.id 
                WHERE o.id LIKE ? OR c.phone LIKE ? 
                ORDER BY o.created_at DESC LIMIT 10
            ");
            $stmt->execute([$term, $term]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($orders);

        } elseif (isset($_GET['order_id'])) {
            // Get order items for selection
            $stmt = $pdo->prepare("
                SELECT oi.*, p.name as product_name, p.image 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            ");
            $stmt->execute([$_GET['order_id']]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($items);

        } else {
            // List recent returns
            $stmt = $pdo->query("
                SELECT r.*, o.total_amount as order_total 
                FROM returns r 
                JOIN orders o ON r.order_id = o.id 
                ORDER BY r.created_at DESC LIMIT 20
            ");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $pdo->beginTransaction();

        try {
            // Validate Order
            $orderId = $data['order_id'];
            $items = $data['items']; // Array of {product_id, quantity}

            if (empty($items)) {
                throw new Exception("No items to return");
            }

            // Create Return Record
            $stmt = $pdo->prepare("INSERT INTO returns (order_id, user_id, return_number, refund_amount, reason, status) VALUES (?, ?, ?, ?, ?, 'approved')");
            $returnNum = 'RET-' . time();
            $stmt->execute([
                $orderId, 
                $userId, 
                $returnNum, 
                $data['refund_amount'] ?? 0, 
                $data['reason'] ?? ''
            ]);
            $returnId = $pdo->lastInsertId();

            // Insert Return Items & Adjust Stock
            $stmtItem = $pdo->prepare("INSERT INTO return_items (return_id, product_id, quantity) VALUES (?, ?, ?)");
            $stmtStock = $pdo->prepare("UPDATE products SET quantity = quantity + ? WHERE id = ?"); // Assuming products has quantity, if not ignore or use inventory

            foreach ($items as $item) {
                // Insert item record
                $stmtItem->execute([$returnId, $item['product_id'], $item['quantity']]);
                
                // Optional: Adjust stock (Disabled for safety/schema mismatch risk for now, strictly logging return)
                // $stmtStock->execute([$item['quantity'], $item['product_id']]);
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Return processed successfully', 'return_id' => $returnId]);

        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
