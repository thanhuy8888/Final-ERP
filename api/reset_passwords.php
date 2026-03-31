<?php
/**
 * Script để reset password cho các user về 123456
 * Chạy file này 1 lần để cập nhật password trong database
 */

require_once '../includes/db.php';

// Tạo hash cho password '123456'
$newPassword = '123456';
$hash = password_hash($newPassword, PASSWORD_BCRYPT);

echo "<h2>Password Reset Script</h2>";
echo "<p>New password hash for '123456': <code>$hash</code></p>";

try {
    // Cập nhật password cho tất cả users
    $stmt = $pdo->prepare("
        UPDATE users 
        SET password = ? 
        WHERE username IN ('admin', 'saleuser', 'customer_test', 'huysale', 'tramsale')
    ");
    
    $stmt->execute([$hash]);
    
    $affected = $stmt->rowCount();
    
    echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
    echo "<h3 style='color: #155724; margin: 0;'>✅ Thành công!</h3>";
    echo "<p style='color: #155724;'>Đã cập nhật password cho <strong>$affected</strong> users.</p>";
    echo "</div>";
    
    echo "<h3>Thông tin đăng nhập mới:</h3>";
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
    echo "<tr style='background: #f8f9fa;'>";
    echo "<th>Username</th><th>Password</th><th>Role</th>";
    echo "</tr>";
    
    $users = [
        ['admin', '123456', 'admin'],
        ['saleuser', '123456', 'sale'],
        ['customer_test', '123456', 'customer'],
        ['huysale', '123456', 'sale'],
        ['tramsale', '123456', 'sale']
    ];
    
    foreach ($users as $user) {
        echo "<tr>";
        echo "<td><strong>{$user[0]}</strong></td>";
        echo "<td><code>{$user[1]}</code></td>";
        echo "<td>{$user[2]}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<div style='background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;'>";
    echo "<p style='color: #856404; margin: 0;'><strong>⚠️ Lưu ý:</strong> Sau khi reset thành công, hãy XÓA file này để bảo mật!</p>";
    echo "</div>";
    
} catch (PDOException $e) {
    echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px;'>";
    echo "<h3 style='color: #721c24; margin: 0;'>❌ Lỗi!</h3>";
    echo "<p style='color: #721c24;'>" . $e->getMessage() . "</p>";
    echo "</div>";
}
?>
