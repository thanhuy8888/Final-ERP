<?php
require_once 'includes/db.php';
require_once 'includes/header.php';

$category_name = $_GET['cat'] ?? null;
$where_clause = "";
$params = [];

if ($category_name) {
    // Get category ID
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE name = ?");
    $stmt->execute([$category_name]);
    $category = $stmt->fetch();
    
    if ($category) {
        $where_clause = "WHERE category_id = ?";
        $params[] = $category['id'];
    }
}

$sql = "SELECT * FROM products $where_clause ORDER BY created_at DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();
?>

<div class="container" style="margin-top: 30px;">
    <h2 class="section-title"><?php echo $category_name ? 'THỜI TRANG ' . strtoupper($category_name) : 'TẤT CẢ SẢN PHẨM'; ?></h2>
    
    <?php if (empty($products)): ?>
        <p style="text-align: center;">Chưa có sản phẩm nào trong danh mục này.</p>
    <?php else: ?>
        <div class="product-grid">
            <?php foreach ($products as $product): ?>
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
    <?php endif; ?>
</div>

<?php require_once 'includes/footer.php'; ?>
