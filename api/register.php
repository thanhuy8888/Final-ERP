require_once '../includes/api_header.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
} else {
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $confirm_password = $data['confirm_password'] ?? '';
}

if (empty($username) || empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Vui lòng điền đầy đủ thông tin']);
    exit;
}

if ($password !== $confirm_password) {
    http_response_code(400);
    echo json_encode(['error' => 'Mật khẩu xác nhận không khớp']);
    exit;
}

try {
    // Check if username or email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Tên đăng nhập hoặc Email đã tồn tại']);
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'customer')");
    
    if ($stmt->execute([$username, $email, $hashed_password])) {
        echo json_encode(['success' => true, 'message' => 'Đăng ký thành công']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Có lỗi xảy ra, vui lòng thử lại']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
