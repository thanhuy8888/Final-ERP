<?php
/**
 * Sale Orders API
 * Endpoints for sales personnel to manage orders
 */

require_once '../../includes/api_header.php';
require_once '../../includes/db.php';
require_once '../../includes/EmailService.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check sale or admin auth
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['sale', 'admin'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized - Sales access required']);
    exit;
}

$saleId = $_SESSION['user_id'];
$language = isset($_SERVER['HTTP_X_LANGUAGE']) ? $_SERVER['HTTP_X_LANGUAGE'] : 'vi';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['id'])) {
            // Get specific order details
            $stmt = $pdo->prepare("
                SELECT o.*, u.username, u.email,
                    c.full_name as customer_name, c.phone as customer_phone
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                LEFT JOIN customers c ON o.customer_id = c.id
                WHERE o.id = ? AND (o.sale_id = ? OR ? = 'admin')
            ");
            $stmt->execute([$_GET['id'], $saleId, $_SESSION['role']]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($order) {
                // Get order items
                $stmt = $pdo->prepare("
                    SELECT oi.*, p.name as product_name, p.image 
                    FROM order_items oi 
                    JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode($order ?: ['error' => 'Order not found']);
        } else {
            // Get orders for this salesperson (or all for admin)
            $sql = "
                SELECT o.*, u.username,
                    c.full_name as customer_name, c.phone as customer_phone,
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN customers c ON o.customer_id = c.id
            ";
            
            if ($_SESSION['role'] !== 'admin') {
                $sql .= " WHERE o.sale_id = ?";
            }
            
            $sql .= " ORDER BY o.created_at DESC";
            
            $stmt = $pdo->prepare($sql);
            if ($_SESSION['role'] !== 'admin') {
                $stmt->execute([$saleId]);
            } else {
                $stmt->execute();
            }
            
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($orders);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['action']) && $data['action'] === 'update_status') {
            // Update order status
            $orderId = $data['order_id'];
            $newStatus = $data['status'];
            
            // Verify ownership
            $stmt = $pdo->prepare("SELECT o.*, u.username, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ? AND (o.sale_id = ? OR ? = 'admin')");
            $stmt->execute([$orderId, $saleId, $_SESSION['role']]);
            $order = $stmt->fetch();
            
            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found or access denied']);
                exit;
            }
            
            $oldStatus = $order['status'];
            
            $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $orderId]);
            
            // Send email notification
            if ($oldStatus !== $newStatus && $order['email']) {
                try {
                    $emailService = new EmailService($language);
                    $emailService->sendOrderStatusUpdate($orderId, $order['email'], $order['username'], $oldStatus, $newStatus);
                } catch (Exception $e) {
                    error_log("Email failed: " . $e->getMessage());
                }
            }
            
            echo json_encode(['success' => true, 'message' => 'Status updated']);
            
        } else {
            // Create new order for customer
            if (empty($data['customer_id']) && empty($data['customer_phone'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Customer ID or phone required']);
                exit;
            }
            
            if (empty($data['items']) || !is_array($data['items'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Order items required']);
                exit;
            }
            
            $pdo->beginTransaction();
            
            // Get or create customer
            $customerId = null;
            $customerEmail = null;
            $customerName = null;
            
            if (!empty($data['customer_id'])) {
                $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
                $stmt->execute([$data['customer_id']]);
                $customer = $stmt->fetch();
                if ($customer) {
                    $customerId = $customer['id'];
                    $customerEmail = $customer['email'];
                    $customerName = $customer['full_name'];
                }
            } elseif (!empty($data['customer_phone'])) {
                // Try to find or create customer
                $stmt = $pdo->prepare("SELECT * FROM customers WHERE phone = ?");
                $stmt->execute([$data['customer_phone']]);
                $customer = $stmt->fetch();
                
                if ($customer) {
                    $customerId = $customer['id'];
                    $customerEmail = $customer['email'];
                    $customerName = $customer['full_name'];
                } else {
                    // Create new customer
                    $stmt = $pdo->prepare("INSERT INTO customers (phone, full_name, email, address, city, created_by) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $data['customer_phone'],
                        $data['customer_name'] ?? 'Khách hàng mới',
                        $data['customer_email'] ?? null,
                        $data['address'] ?? null,
                        $data['city'] ?? null,
                        $saleId
                    ]);
                    $customerId = $pdo->lastInsertId();
                    $customerEmail = $data['customer_email'] ?? null;
                    $customerName = $data['customer_name'] ?? 'Khách hàng mới';
                }
            }
            
            // Calculate total
            $totalAmount = 0;
            $orderItems = [];
            
            foreach ($data['items'] as $item) {
                $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
                $stmt->execute([$item['product_id']]);
                $product = $stmt->fetch();
                
                if (!$product) {
                    $pdo->rollBack();
                    http_response_code(400);
                    echo json_encode(['error' => 'Product not found: ' . $item['product_id']]);
                    exit;
                }
                
                $qty = intval($item['quantity']);
                $price = $product['price'];
                $totalAmount += $price * $qty;
                
                $orderItems[] = [
                    'product_id' => $product['id'],
                    'quantity' => $qty,
                    'price' => $price
                ];
            }
            
            // Apply discount if provided
            $discount = floatval($data['discount'] ?? 0);
            $finalAmount = $totalAmount - $discount;
            
            // Create order
            $stmt = $pdo->prepare("
                INSERT INTO orders (user_id, sale_id, customer_id, total_amount, discount_amount, status, notes, shipping_address) 
                VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?)
            ");
            
            // Use a placeholder user_id if customer doesn't have an account
            $stmt->execute([
                null, // user_id - null for non-registered customers
                $saleId, // sale_id
                $customerId,
                $finalAmount,
                $discount,
                $data['notes'] ?? null,
                $data['address'] ?? null
            ]);
            
            $orderId = $pdo->lastInsertId();
            
            // Create order items
            $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
            foreach ($orderItems as $item) {
                $stmt->execute([$orderId, $item['product_id'], $item['quantity'], $item['price']]);
            }
            
            $pdo->commit();
            
            // Send confirmation email
            if ($customerEmail) {
                try {
                    $emailService = new EmailService($language);
                    $emailService->sendOrderConfirmation($orderId, $customerEmail, $customerName);
                } catch (Exception $e) {
                    error_log("Email failed: " . $e->getMessage());
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Order created successfully',
                'order_id' => $orderId,
                'total_amount' => $finalAmount
            ]);
        }
    }
} catch (PDOException $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
