<?php
require_once '../includes/db.php';
$pageTitle = 'Thông tin sản phẩm';
require_once 'includes/header.php';

$id = $_GET['id'] ?? null;
$product = null;

if ($id) {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch();
}

// Fetch categories
$categories = $pdo->query("SELECT * FROM categories")->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'];
    $category_id = $_POST['category_id'];
    $price = $_POST['price'];
    $description = $_POST['description'];
    $image_path = $product['image'] ?? null;

    // Handle Image Upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $target_dir = "../uploads/";
        if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
        }
        $filename = time() . '_' . basename($_FILES['image']['name']);
        $target_file = $target_dir . $filename;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            $image_path = 'uploads/' . $filename; // Relative path for DB
        }
    } elseif (!empty($_POST['image_url'])) {
        $image_path = $_POST['image_url'];
    }

    if ($id) {
        // Update
        $sql = "UPDATE products SET name=?, category_id=?, price=?, description=?, image=? WHERE id=?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$name, $category_id, $price, $description, $image_path, $id]);
    } else {
        // Insert
        $sql = "INSERT INTO products (name, category_id, price, description, image) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$name, $category_id, $price, $description, $image_path]);
    }

    echo "<script>window.location.href='products.php';</script>";
}
?>

<div class="card" style="max-width: 800px; margin: 0 auto;">
    <form action="" method="POST" enctype="multipart/form-data">
        <div class="form-group">
            <label>Tên sản phẩm</label>
            <input type="text" name="name" class="form-control" value="<?php echo htmlspecialchars($product['name'] ?? ''); ?>" required>
        </div>
        
        <div class="form-group">
            <label>Danh mục</label>
            <select name="category_id" class="form-control" required>
                <?php foreach ($categories as $cat): ?>
                    <option value="<?php echo $cat['id']; ?>" <?php echo ($product && $product['category_id'] == $cat['id']) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($cat['name']); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        
        <div class="form-group">
            <label>Giá (VNĐ)</label>
            <input type="number" name="price" class="form-control" value="<?php echo $product['price'] ?? ''; ?>" required>
        </div>
        
        <div class="form-group">
            <label>Mô tả</label>
            <textarea name="description" class="form-control" rows="5"><?php echo htmlspecialchars($product['description'] ?? ''); ?></textarea>
        </div>
        
        <div class="form-group">
            <label>Hình ảnh</label>
            <input type="file" name="image" class="form-control" style="margin-bottom: 10px;">
            <input type="text" name="image_url" class="form-control" placeholder="Hoặc nhập URL hình ảnh" value="<?php echo htmlspecialchars($product['image'] ?? ''); ?>">
            <?php if ($product && $product['image']): ?>
                <div style="margin-top: 10px;">
                    <img src="<?php echo htmlspecialchars($product['image']); ?>" style="height: 100px;">
                </div>
            <?php endif; ?>
        </div>
        
        <button type="submit" class="btn">Lưu sản phẩm</button>
        <a href="products.php" class="btn" style="background: #95a5a6; margin-left: 10px;">Hủy</a>
    </form>
</div>

<?php require_once 'includes/footer.php'; ?>
