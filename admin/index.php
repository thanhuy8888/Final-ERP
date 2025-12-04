<?php
require_once '../includes/db.php';
$pageTitle = 'Dashboard';
require_once 'includes/header.php';

// Get stats
$stmt = $pdo->query("SELECT COUNT(*) FROM products");
$product_count = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) FROM orders");
$order_count = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'");
$customer_count = $stmt->fetchColumn();

$stmt = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE status = 'completed'");
$revenue = $stmt->fetchColumn() ?: 0;
?>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
    <div class="card" style="border-left: 4px solid #3498db;">
        <div style="font-size: 14px; color: #666;">SẢN PHẨM</div>
        <div style="font-size: 24px; font-weight: bold; margin-top: 5px;"><?php echo $product_count; ?></div>
    </div>
    <div class="card" style="border-left: 4px solid #2ecc71;">
        <div style="font-size: 14px; color: #666;">ĐƠN HÀNG</div>
        <div style="font-size: 24px; font-weight: bold; margin-top: 5px;"><?php echo $order_count; ?></div>
    </div>
    <div class="card" style="border-left: 4px solid #f1c40f;">
        <div style="font-size: 14px; color: #666;">KHÁCH HÀNG</div>
        <div style="font-size: 24px; font-weight: bold; margin-top: 5px;"><?php echo $customer_count; ?></div>
    </div>
    <div class="card" style="border-left: 4px solid #e74c3c;">
        <div style="font-size: 14px; color: #666;">DOANH THU</div>
        <div style="font-size: 24px; font-weight: bold; margin-top: 5px;"><?php echo number_format($revenue, 0, ',', '.'); ?>đ</div>
    </div>
</div>

<div class="card" style="margin-top: 30px;">
    <h3>Đơn hàng mới nhất</h3>
    <table class="table" style="margin-top: 15px;">
        <thead>
            <tr>
                <th>ID</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
            </tr>
        </thead>
        <tbody>
            <?php
            $stmt = $pdo->query("SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5");
            while ($row = $stmt->fetch()) {
                echo "<tr>";
                echo "<td>#{$row['id']}</td>";
                echo "<td>" . htmlspecialchars($row['username']) . "</td>";
                echo "<td>" . number_format($row['total_amount'], 0, ',', '.') . "đ</td>";
                echo "<td><span style='padding: 3px 8px; border-radius: 4px; font-size: 12px; background: #eee;'>" . ucfirst($row['status']) . "</span></td>";
                echo "<td>" . date('d/m/Y H:i', strtotime($row['created_at'])) . "</td>";
                echo "</tr>";
            }
            ?>
        </tbody>
    </table>
</div>

<?php require_once 'includes/footer.php'; ?>
