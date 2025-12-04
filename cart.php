<?php
require_once 'includes/db.php';
require_once 'includes/header.php';

// Handle Cart Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add') {
        $product_id = $_POST['product_id'];
        $quantity = (int)$_POST['quantity'];
        
        if (!isset($_SESSION['cart'])) {
            $_SESSION['cart'] = [];
        }
        
        if (isset($_SESSION['cart'][$product_id])) {
            $_SESSION['cart'][$product_id] += $quantity;
        } else {
            $_SESSION['cart'][$product_id] = $quantity;
        }
    } elseif ($action === 'update') {
        $product_id = $_POST['product_id'];
        $quantity = (int)$_POST['quantity'];
        if ($quantity > 0) {
            $_SESSION['cart'][$product_id] = $quantity;
        } else {
            unset($_SESSION['cart'][$product_id]);
        }
    } elseif ($action === 'remove') {
        $product_id = $_POST['product_id'];
        unset($_SESSION['cart'][$product_id]);
    }
}

// Fetch Cart Details
$cart_items = [];
$total_price = 0;

if (!empty($_SESSION['cart'])) {
    $ids = array_keys($_SESSION['cart']);
    $placeholders = str_repeat('?,', count($ids) - 1) . '?';
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($products as $product) {
        $product['quantity'] = $_SESSION['cart'][$product['id']];
        $product['subtotal'] = $product['price'] * $product['quantity'];
        $total_price += $product['subtotal'];
        $cart_items[] = $product;
    }
}
?>

<div class="container" style="margin-top: 30px;">
    <h2 class="section-title">GIỎ HÀNG CỦA BẠN</h2>
    
    <?php if (empty($cart_items)): ?>
        <div style="text-align: center; padding: 50px; background: #fff; border-radius: 8px;">
            <p>Giỏ hàng của bạn đang trống.</p>
            <a href="products.php" class="btn" style="margin-top: 20px;">TIẾP TỤC MUA SẮM</a>
        </div>
    <?php else: ?>
        <div style="background: #fff; padding: 20px; border-radius: 8px;">
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 100px;">Sản phẩm</th>
                        <th>Tên</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($cart_items as $item): ?>
                        <tr>
                            <td><img src="<?php echo htmlspecialchars($item['image'] ?? 'assets/images/placeholder.jpg'); ?>" style="width: 60px;"></td>
                            <td><?php echo htmlspecialchars($item['name']); ?></td>
                            <td><?php echo number_format($item['price'], 0, ',', '.'); ?>đ</td>
                            <td>
                                <form action="cart.php" method="POST" style="display: inline;">
                                    <input type="hidden" name="action" value="update">
                                    <input type="hidden" name="product_id" value="<?php echo $item['id']; ?>">
                                    <input type="number" name="quantity" value="<?php echo $item['quantity']; ?>" min="1" style="width: 50px; padding: 5px;" onchange="this.form.submit()">
                                </form>
                            </td>
                            <td><?php echo number_format($item['subtotal'], 0, ',', '.'); ?>đ</td>
                            <td>
                                <form action="cart.php" method="POST" style="display: inline;">
                                    <input type="hidden" name="action" value="remove">
                                    <input type="hidden" name="product_id" value="<?php echo $item['id']; ?>">
                                    <button type="submit" style="background: none; border: none; color: #999; cursor: pointer;"><i class="fas fa-trash"></i></button>
                                </form>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            
            <div style="margin-top: 30px; text-align: right;">
                <div style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">
                    Tổng tiền: <span style="color: #d72229;"><?php echo number_format($total_price, 0, ',', '.'); ?>đ</span>
                </div>
                <a href="checkout.php" class="btn">TIẾN HÀNH THANH TOÁN</a>
            </div>
        </div>
    <?php endif; ?>
</div>

<?php require_once 'includes/footer.php'; ?>
