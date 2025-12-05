<?php
require_once '../includes/db.php';
$pageTitle = 'Quản lý sản phẩm';
require_once 'includes/header.php';

// Handle Delete
if (isset($_POST['delete_id'])) {
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$_POST['delete_id']]);
    echo "<script>alert('Đã xóa sản phẩm!'); window.location.href='products.php';</script>";
}

// Fetch products
$stmt = $pdo->query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC");
$products = $stmt->fetchAll();
?>

<div style="margin-bottom: 20px;">
    <a href="product_form.php" class="btn"><i class="fas fa-plus"></i> Thêm sản phẩm mới</a>
</div>

<div class="card">
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($products as $product): ?>
                <tr>
                    <td><?php echo $product['id']; ?></td>
                    <td>
                        <img src="<?php echo htmlspecialchars($product['image'] ?? '../assets/images/placeholder.jpg'); ?>" style="width: 50px; height: 50px; object-fit: cover;">
                    </td>
                    <td><?php echo htmlspecialchars($product['name']); ?></td>
                    <td><?php echo htmlspecialchars($product['category_name']); ?></td>
                    <td><?php echo number_format($product['price'], 0, ',', '.'); ?>đ</td>
                    <td>
                        <a href="product_form.php?id=<?php echo $product['id']; ?>" style="color: #3498db; margin-right: 10px;"><i class="fas fa-edit"></i></a>
                        <form method="POST" style="display: inline;" onsubmit="return confirm('Bạn có chắc muốn xóa?');">
                            <input type="hidden" name="delete_id" value="<?php echo $product['id']; ?>">
                            <button type="submit" style="background: none; border: none; color: #e74c3c; cursor: pointer;"><i class="fas fa-trash"></i></button>
                        </form>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require_once 'includes/footer.php'; ?>
