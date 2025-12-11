<?php
// Enable error reporting for debugging (but catch them to return JSON)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Define absolute path to root
define('ROOT_PATH', dirname(__DIR__));

// Buffer output to prevent accidental whitespaces
ob_start();

try {
    // Include Header
    $headerPath = ROOT_PATH . '/includes/api_header.php';
    if (!file_exists($headerPath)) throw new Exception("Configuration error: api_header.php not found");
    require_once $headerPath;

    // Include DB
    $dbPath = ROOT_PATH . '/includes/db.php';
    if (!file_exists($dbPath)) throw new Exception("Configuration error: db.php not found");
    require_once $dbPath;

    // Get JSON input
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    if (!$data) {
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
    } else {
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
    }

    // Clean Buffer before sending response
    ob_clean();

    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Vui lòng nhập đầy đủ thông tin']);
        exit;
    }

    if (!isset($pdo)) {
        throw new Exception("Database connection failed");
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        // Start session if not started
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
        echo json_encode(['success' => false, 'error' => 'Sai tên đăng nhập hoặc mật khẩu']);
    }

} catch (Exception $e) {
    // Catch all errors
    if (ob_get_length()) ob_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server Error: ' . $e->getMessage()]);
}
?>

