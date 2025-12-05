<?php
require_once 'includes/db.php';
require_once 'includes/header.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

if (empty($_SESSION['cart'])) {
    header('Location: cart.php');
    exit;
}

$success_msg = '';
$error_msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
        $success_msg = "Đặt hàng thành công! Mã đơn hàng của bạn là #" . $order_id;
        
    } catch (Exception $e) {
        $pdo->rollBack();
        $error_msg = "Có lỗi xảy ra: " . $e->getMessage();
    }
}
?>

<div class="container" style="margin-top: 30px;">
    <h2 class="section-title">THANH TOÁN</h2>
    
    <?php if ($success_msg): ?>
        <div style="text-align: center; padding: 50px; background: #fff; border-radius: 8px;">
            <i class="fas fa-check-circle" style="font-size: 50px; color: #2ecc71; margin-bottom: 20px;"></i>
            <p style="font-size: 18px;"><?php echo $success_msg; ?></p>
            <a href="index.php" class="btn" style="margin-top: 20px;">VỀ TRANG CHỦ</a>
        </div>
    <?php else: ?>
        <div class="form-container">
            <?php if ($error_msg): ?>
                <div style="color: red; margin-bottom: 15px;"><?php echo $error_msg; ?></div>
            <?php endif; ?>
            
            <p style="margin-bottom: 20px;">Xác nhận đặt hàng với các sản phẩm trong giỏ?</p>
            
            <form action="checkout.php" method="POST">
                <div class="form-group">
                    <label>Họ tên người nhận</label>
                    <input type="text" class="form-control" value="<?php echo $_SESSION['username']; ?>" readonly>
                </div>
                <!-- Add more fields like address, phone here if needed -->
                
                <button type="submit" class="btn" style="width: 100%;">ĐẶT HÀNG NGAY</button>
            </form>
        </div>
    <?php endif; ?>
</div>

<?php require_once 'includes/footer.php'; ?>
