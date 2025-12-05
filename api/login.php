<?php
require_once '../includes/api_header.php';
require_once '../includes/db.php';


// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    // Fallback to POST if form-data is used
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
} else {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
}

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Vui lòng nhập tên đăng nhập và mật khẩu']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        // Start session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        echo json_encode([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Tên đăng nhập hoặc mật khẩu không đúng']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
