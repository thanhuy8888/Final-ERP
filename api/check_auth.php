<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

define('ROOT_PATH', dirname(__DIR__));

ob_start();

try {
    require_once ROOT_PATH . '/includes/api_header.php';
    require_once ROOT_PATH . '/includes/db.php';

    // Check session
    // Session is already started in api_header or manually here if needed.
    // api_header.php generally doesn't start session unless rate limiter does.
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    ob_clean();

    if (isset($_SESSION['user_id'])) {
        // Optional: Refresh user data from DB to ensure role is up to date
        $stmt = $pdo->prepare("SELECT id, username, role, full_name, email FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
             echo json_encode([
                'authenticated' => true,
                'user' => $user
            ]);
        } else {
             // User deleted or invalid
             session_destroy();
             echo json_encode(['authenticated' => false]);
        }
    } else {
        echo json_encode(['authenticated' => false]);
    }

} catch (Exception $e) {
    if (ob_get_length()) ob_clean();
    http_response_code(500);
    echo json_encode(['authenticated' => false, 'error' => $e->getMessage()]);
}
?>

