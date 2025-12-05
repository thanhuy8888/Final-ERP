<?php
require_once 'includes/db.php';
require_once 'includes/header.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    
    if ($password !== $confirm_password) {
        $error = "Mật khẩu xác nhận không khớp!";
    } else {
        // Check if username or email exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        if ($stmt->rowCount() > 0) {
            $error = "Tên đăng nhập hoặc Email đã tồn tại!";
        } else {
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'customer')");
            if ($stmt->execute([$username, $email, $hashed_password])) {
                $success = "Đăng ký thành công! Vui lòng đăng nhập.";
            } else {
                $error = "Có lỗi xảy ra, vui lòng thử lại.";
            }
        }
    }
}
?>

<div class="container">
    <div class="form-container">
        <h2 class="section-title" style="font-size: 20px; margin-bottom: 20px;">ĐĂNG KÝ</h2>
        
        <?php if ($error): ?>
            <div style="color: red; margin-bottom: 15px; text-align: center;"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <div style="color: green; margin-bottom: 15px; text-align: center;">
                <?php echo $success; ?> <br>
                <a href="login.php" style="color: #d72229;">Đăng nhập ngay</a>
            </div>
        <?php else: ?>
            <form action="register.php" method="POST">
                <div class="form-group">
                    <label>Tên đăng nhập</label>
                    <input type="text" name="username" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Mật khẩu</label>
                    <input type="password" name="password" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Xác nhận mật khẩu</label>
                    <input type="password" name="confirm_password" class="form-control" required>
                </div>
                <button type="submit" class="btn" style="width: 100%;">ĐĂNG KÝ</button>
            </form>
            
            <div style="text-align: center; margin-top: 15px; font-size: 14px;">
                Đã có tài khoản? <a href="login.php" style="color: #d72229;">Đăng nhập</a>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once 'includes/footer.php'; ?>
