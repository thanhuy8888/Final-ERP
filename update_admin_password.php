<?php
define('ROOT_PATH', __DIR__);
require_once ROOT_PATH . '/includes/db.php';

$newPassword = '123456';
$hash = password_hash($newPassword, PASSWORD_DEFAULT);

$users = ['admin', 'saleuser', 'customer_test'];

try {
    foreach ($users as $username) {
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
        $stmt->execute([$hash, $username]);
        if ($stmt->rowCount() > 0) {
            echo "Updated password for $username to '$newPassword'\n";
        } else {
            echo "No update needed or user $username not found.\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
