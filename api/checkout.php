<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Vui lòng đăng nhập để thanh toán']);
    exit;
}

if (empty($_SESSION['cart'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Giỏ hàng trống']);
    exit;
}

try {
    $pdo->beginTransaction();
    
    // Calculate total
    $total_amount = 0;
    $ids = array_keys($_SESSION['cart']);
    $placeholders = str_repeat('?,', count($ids) - 1) . '?';
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $order_items = [];
    foreach ($products as $product) {
        $qty = $_SESSION['cart'][$product['id']];
        $total_amount += $product['price'] * $qty;
        $order_items[] = [
            'product_id' => $product['id'],
            'quantity' => $qty,
            'price' => $product['price']
        ];
    }
    
    // Create Order
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'pending')");
    $stmt->execute([$_SESSION['user_id'], $total_amount]);
    $order_id = $pdo->lastInsertId();
    
    // Create Order Items
    $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($order_items as $item) {
        $stmt->execute([$order_id, $item['product_id'], $item['quantity'], $item['price']]);
    }
    
    $pdo->commit();
    
    // Clear cart
    unset($_SESSION['cart']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Đặt hàng thành công',
        'order_id' => $order_id
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()]);
}
?>
