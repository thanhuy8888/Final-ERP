<?php
require_once 'includes/db.php';
require_once 'includes/header.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch();

if (!$product) {
    echo "<div class='container'><p>Sản phẩm không tồn tại.</p></div>";
    require_once 'includes/footer.php';
    exit;
}
?>

<div class="container" style="margin-top: 30px;">
    <div style="display: flex; gap: 40px; background: #fff; padding: 30px; border-radius: 8px;">
        <div style="flex: 1;">
            <img src="<?php echo htmlspecialchars($product['image'] ?? 'assets/images/placeholder.jpg'); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>" style="width: 100%; border-radius: 8px;">
        </div>
        <div style="flex: 1;">
            <h1 style="font-size: 28px; margin-bottom: 15px;"><?php echo htmlspecialchars($product['name']); ?></h1>
            <div style="font-size: 24px; color: #d72229; font-weight: bold; margin-bottom: 20px;">
                <?php echo number_format($product['price'], 0, ',', '.'); ?>đ
            </div>
            <div style="margin-bottom: 30px; line-height: 1.8; color: #666;">
                <?php echo nl2br(htmlspecialchars($product['description'])); ?>
            </div>
            
            <form action="cart.php" method="POST">
                <input type="hidden" name="action" value="add">
                <input type="hidden" name="product_id" value="<?php echo $product['id']; ?>">
                <div style="margin-bottom: 20px;">
                    <label style="font-weight: 600; margin-right: 10px;">Số lượng:</label>
                    <input type="number" name="quantity" value="1" min="1" style="width: 60px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <button type="submit" class="btn" style="width: 100%; text-align: center;">THÊM VÀO GIỎ HÀNG</button>
            </form>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
