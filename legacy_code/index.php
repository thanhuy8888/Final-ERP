<?php
require_once 'includes/db.php';
require_once 'includes/header.php';

// Fetch featured products (latest 4)
$stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC LIMIT 4");
$featured_products = $stmt->fetchAll();
?>

<div class="hero">
    <div class="container">
        <h1>THỜI TRANG CHO MỌI NGƯỜI</h1>
        <p>Khám phá bộ sưu tập mới nhất của chúng tôi với chất liệu cao cấp và thiết kế hiện đại.</p>
        <a href="products.php" class="btn">MUA NGAY</a>
    </div>
</div>

<div class="container">
    <h2 class="section-title">SẢN PHẨM MỚI</h2>
    
    <div class="product-grid">
        <?php foreach ($featured_products as $product): ?>
            <div class="product-card">
                <a href="product_detail.php?id=<?php echo $product['id']; ?>">
                    <img src="<?php echo htmlspecialchars($product['image'] ?? 'assets/images/placeholder.jpg'); ?>" alt="<?php echo htmlspecialchars($product['name']); ?>" class="product-image">
                </a>
                <div class="product-info">
                    <a href="product_detail.php?id=<?php echo $product['id']; ?>" class="product-name"><?php echo htmlspecialchars($product['name']); ?></a>
                    <div class="product-price"><?php echo number_format($product['price'], 0, ',', '.'); ?>đ</div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
