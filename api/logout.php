<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

session_destroy();
echo json_encode(['success' => true, 'message' => 'Đăng xuất thành công']);
?>
