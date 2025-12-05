<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set default admin session if not set
if (!isset($_SESSION['username'])) {
    $_SESSION['username'] = 'Admin';
    $_SESSION['user_id'] = 1;
    $_SESSION['role'] = 'admin';
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - CANIFA</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="/Final ERP/assets/css/style.css">
</head>
<body>

<div class="admin-layout">
    <aside class="admin-sidebar">
        <div class="logo">CANIFA ADMIN</div>
        <nav class="admin-menu">
            <a href="/Final ERP/admin/index.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : ''; ?>">
                <i class="fas fa-tachometer-alt"></i> Dashboard
            </a>
            <a href="/Final ERP/admin/products.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'products.php' || basename($_SERVER['PHP_SELF']) == 'product_form.php' ? 'active' : ''; ?>">
                <i class="fas fa-box"></i> Sản phẩm
            </a>
            <a href="/Final ERP/admin/orders.php" class="<?php echo basename($_SERVER['PHP_SELF']) == 'orders.php' ? 'active' : ''; ?>">
                <i class="fas fa-shopping-cart"></i> Đơn hàng
            </a>
            <a href="/Final ERP/logout.php">
                <i class="fas fa-sign-out-alt"></i> Đăng xuất
            </a>
        </nav>
    </aside>
    <main class="admin-content">
        <div class="admin-header">
            <h2><?php echo isset($pageTitle) ? $pageTitle : 'Dashboard'; ?></h2>
            <div class="user-info">
                Xin chào, <?php echo $_SESSION['username'] ?? 'Admin'; ?>
            </div>
        </div>
