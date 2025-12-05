<?php
require_once '../includes/db.php';
$pageTitle = 'Quản lý đơn hàng';
require_once 'includes/header.php';

// Fetch orders
$sql = "SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC";
$orders = $pdo->query($sql)->fetchAll();
?>

<div class="card">
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Hành động</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($orders as $order): ?>
                <tr>
                    <td>#<?php echo $order['id']; ?></td>
                    <td><?php echo htmlspecialchars($order['username']); ?></td>
                    <td><?php echo number_format($order['total_amount'], 0, ',', '.'); ?>đ</td>
                    <td>
                        <?php
                        $statusColors = [
                            'pending' => '#f1c40f',
                            'processing' => '#3498db',
                            'completed' => '#2ecc71',
                            'cancelled' => '#e74c3c'
                        ];
                        $color = $statusColors[$order['status']] ?? '#95a5a6';
                        ?>
                        <span style="background: <?php echo $color; ?>; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                            <?php echo ucfirst($order['status']); ?>
                        </span>
                    </td>
                    <td><?php echo date('d/m/Y H:i', strtotime($order['created_at'])); ?></td>
                    <td>
                        <a href="order_detail.php?id=<?php echo $order['id']; ?>" class="btn" style="padding: 5px 10px; font-size: 12px;">Chi tiết</a>
                    </td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<?php require_once 'includes/footer.php'; ?>
