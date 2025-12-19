<?php
require_once '../includes/api_header.php';
require_once '../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get specific order
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("
                SELECT o.*, 
                    COALESCE(o.notes, '') as notes,
                    COALESCE(o.payment_method, 'cod') as payment_method
                FROM orders o 
                WHERE o.id = ? AND o.user_id = ?
            ");
            $stmt->execute([$_GET['id'], $user_id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found']);
                exit;
            }
            
            // Get order items with product info
            $stmt = $pdo->prepare("
                SELECT oi.*, p.name as product_name, p.image as product_image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ");
            $stmt->execute([$order['id']]);
            $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($order);
        } else {
            // Get all orders for user
            $stmt = $pdo->prepare("
                SELECT o.*,
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
                FROM orders o 
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC
            ");
            $stmt->execute([$user_id]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($orders);
        }
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
