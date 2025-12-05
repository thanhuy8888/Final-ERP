<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CANIFA - Thời trang cho mọi người</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="/Final ERP/assets/css/style.css">
</head>
<body>

<header>
    <div class="header-top">
        <div class="container">
            MIỄN PHÍ VẬN CHUYỂN VỚI ĐƠN HÀNG TỪ 499K
        </div>
    </div>
    <div class="container header-main">
        <a href="/Final ERP/index.php" class="logo">CANIFA</a>
        
        <nav class="nav-menu">
            <a href="/Final ERP/index.php">Trang chủ</a>
            <a href="/Final ERP/products.php?cat=Nam">Nam</a>
            <a href="/Final ERP/products.php?cat=Nữ">Nữ</a>
            <a href="/Final ERP/products.php?cat=Bé trai">Bé trai</a>
            <a href="/Final ERP/products.php?cat=Bé gái">Bé gái</a>
        </nav>

        <div class="header-actions">
            <a href="#"><i class="fas fa-search"></i></a>
            <a href="/Final ERP/cart.php"><i class="fas fa-shopping-cart"></i></a>
            <?php if (isset($_SESSION['user_id'])): ?>
                <a href="/Final ERP/logout.php"><i class="fas fa-sign-out-alt"></i></a>
            <?php else: ?>
                <a href="/Final ERP/login.php"><i class="fas fa-user"></i></a>
            <?php endif; ?>
        </div>
    </div>
</header>
