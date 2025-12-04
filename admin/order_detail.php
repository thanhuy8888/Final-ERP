<?php
require_once '../includes/db.php';
$pageTitle = 'Chi tiết đơn hàng';
require_once 'includes/header.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    echo "<script>window.location.href='orders.php';</script>";
    exit;
}

// Update Status
if (isset($_POST['status'])) {
    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$_POST['status'], $id]);
    echo "<script>alert('Đã cập nhật trạng thái!'); window.location.href='order_detail.php?id=$id';</script>";
}

// Fetch Order Info
$stmt = $pdo->prepare("SELECT o.*, u.username, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?");
$stmt->execute([$id]);
$order = $stmt->fetch();

// Fetch Order Items
$stmt = $pdo->prepare("SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
$stmt->execute([$id]);
$items = $stmt->fetchAll();
?>

<div style="display: flex; gap: 20px;">
    <div style="flex: 2;">
        <div class="card">
            <h3>Sản phẩm</h3>
            <table class="table" style="margin-top: 15px;">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($items as $item): ?>
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <img src="<?php echo htmlspecialchars($item['image'] ?? '../assets/images/placeholder.jpg'); ?>" style="width: 40px; height: 40px; object-fit: cover;">
                                    <?php echo htmlspecialchars($item['name']); ?>
                                </div>
                            </td>
                            <td><?php echo number_format($item['price'], 0, ',', '.'); ?>đ</td>
                            <td><?php echo $item['quantity']; ?></td>
                            <td><?php echo number_format($item['price'] * $item['quantity'], 0, ',', '.'); ?>đ</td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: bold;">Tổng cộng:</td>
                        <td style="font-weight: bold; color: #d72229;"><?php echo number_format($order['total_amount'], 0, ',', '.'); ?>đ</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
    
    <div style="flex: 1;">
        <div class="card">
            <h3>Thông tin khách hàng</h3>
            <p><strong>Tên:</strong> <?php echo htmlspecialchars($order['username']); ?></p>
            <p><strong>Email:</strong> <?php echo htmlspecialchars($order['email']); ?></p>
            <p><strong>Ngày đặt:</strong> <?php echo date('d/m/Y H:i', strtotime($order['created_at'])); ?></p>
            
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
            
            <h3>Cập nhật trạng thái</h3>
            <form method="POST" style="margin-top: 15px;">
                <select name="status" class="form-control" style="margin-bottom: 10px;">
                    <option value="pending" <?php echo $order['status'] == 'pending' ? 'selected' : ''; ?>>Pending</option>
                    <option value="processing" <?php echo $order['status'] == 'processing' ? 'selected' : ''; ?>>Processing</option>
                    <option value="completed" <?php echo $order['status'] == 'completed' ? 'selected' : ''; ?>>Completed</option>
                    <option value="cancelled" <?php echo $order['status'] == 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                </select>
                <button type="submit" class="btn" style="width: 100%;">Cập nhật</button>
            </form>
        </div>
        
        <div style="margin-top: 20px;">
            <a href="orders.php" style="color: #666;">&larr; Quay lại danh sách</a>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
