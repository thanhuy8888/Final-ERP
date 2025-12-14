<?php
require_once '../includes/api_header.php';
require_once '../includes/db.php';
require_once '../includes/EmailService.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Log helper
function debug_log($message) {
    file_put_contents('checkout_debug.log', date('[Y-m-d H:i:s] ') . $message . "\n", FILE_APPEND);
}

debug_log("Request received. Method: " . $_SERVER['REQUEST_METHOD']);
debug_log("Session ID: " . session_id());
debug_log("Session Data: " . print_r($_SESSION, true));

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_SESSION['user_id'])) {
    debug_log("Error: User not logged in");
    http_response_code(401);
    echo json_encode(['error' => 'Vui lòng đăng nhập để thanh toán']);
    exit;
}

if (empty($_SESSION['cart'])) {
    debug_log("Error: Session cart is empty");
    http_response_code(400);
    echo json_encode(['error' => 'Giỏ hàng trống']);
    exit;
}

// Get language preference from header
$language = isset($_SERVER['HTTP_X_LANGUAGE']) ? $_SERVER['HTTP_X_LANGUAGE'] : 'vi';

try {
    $pdo->beginTransaction();
    debug_log("Transaction started");
    
    debug_log("Checkout started for User ID: " . ($_SESSION['user_id'] ?? 'unknown'));

    // Get JSON input
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);
    debug_log("Input Data: " . print_r($data, true));

    // Validate inputs
    if (!$data) {
        debug_log("Error: Invalid JSON input");
        throw new Exception("Dữ liệu không hợp lệ");
    }

    $fullName = $data['full_name'] ?? '';
    $phone = $data['phone'] ?? '';
    $address = $data['address'] ?? '';
    $city = $data['city'] ?? '';
    $notes = $data['notes'] ?? '';
    $paymentMethod = $data['payment_method'] ?? 'cod';

    // Combine address info
    $shippingAddress = "Người nhận: $fullName, SĐT: $phone. Địa chỉ: $address, $city";

    // Calculate total
    $total_amount = 0;
    $ids = array_keys($_SESSION['cart']);
    if (empty($ids)) {
         debug_log("Error: Empty cart");
         throw new Exception("Giỏ hàng trống");
    }
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
    
    debug_log("Total amount: $total_amount. Preparing to insert order.");

    // Create Order
    try {
        $stmt = $pdo->prepare("
            INSERT INTO orders (user_id, total_amount, status, payment_method, shipping_address, notes) 
            VALUES (?, ?, 'pending', ?, ?, ?)
        ");
        $stmt->execute([$_SESSION['user_id'], $total_amount, $paymentMethod, $shippingAddress, $notes]);
        $order_id = $pdo->lastInsertId();
        debug_log("Order created. ID: $order_id");
    } catch (PDOException $dbError) {
        debug_log("DB Error during Order Insert: " . $dbError->getMessage());
        throw $dbError;
    }
    
    // Create Order Items
    $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
    foreach ($order_items as $item) {
        $stmt->execute([$order_id, $item['product_id'], $item['quantity'], $item['price']]);
    }
    debug_log("Order items inserted.");
    
    $pdo->commit();
    debug_log("Transaction committed.");
    
    // Clear cart
    unset($_SESSION['cart']);
    
    // Send confirmation email (non-blocking, failures are logged)
    try {
        debug_log("Attempting to send email...");
        $emailService = new EmailService($language);
        $emailService->sendOrderConfirmation($order_id, $user['email'], $user['username']);
        debug_log("Email sent request completed (check email logs).");
    } catch (Throwable $e) { // Catch Fatal Errors and Exceptions
        error_log("Email sending failed: " . $e->getMessage());
        debug_log("Email sending failed: " . $e->getMessage());
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Đặt hàng thành công',
        'order_id' => $order_id,
        'email_sent' => true
    ]);
    
} catch (Throwable $e) { // Catch all errors at top level too
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    debug_log("Fatal Error caught: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()]);
}
?>

