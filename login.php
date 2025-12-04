<?php
require_once 'includes/db.php';
require_once 'includes/header.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        
        if ($user['role'] === 'admin') {
            header('Location: admin/index.php');
        } else {
            header('Location: index.php');
        }
        exit;
    } else {
        $error = "Tên đăng nhập hoặc mật khẩu không đúng!";
    }
}
?>

<div class="container">
    <div class="form-container">
        <h2 class="section-title" style="font-size: 20px; margin-bottom: 20px;">ĐĂNG NHẬP</h2>
        
        <?php if ($error): ?>
            <div style="color: red; margin-bottom: 15px; text-align: center;"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <form action="login.php" method="POST">
            <div class="form-group">
                <label>Tên đăng nhập</label>
                <input type="text" name="username" class="form-control" required>
            </div>
            <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" name="password" class="form-control" required>
            </div>
            <button type="submit" class="btn" style="width: 100%;">ĐĂNG NHẬP</button>
        </form>
        
        <div style="text-align: center; margin-top: 15px; font-size: 14px;">
            Chưa có tài khoản? <a href="register.php" style="color: #d72229;">Đăng ký ngay</a>
        </div>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
