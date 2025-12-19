<?php
$hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
$password = '123456';
$default = 'password';

echo "Testing hash against '123456': " . (password_verify($password, $hash) ? 'MATCH' : 'FAIL') . "\n";
echo "Testing hash against 'password': " . (password_verify($default, $hash) ? 'MATCH' : 'FAIL') . "\n";

$newHash = password_hash('123456', PASSWORD_DEFAULT);
echo "New hash for '123456': " . $newHash . "\n";
?>
