<?php
/**
 * Check Authentication Status
 * Returns current user session info
 */
require_once '../includes/api_header.php';
require_once '../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (isset($_SESSION['user_id'])) {
    // Get fresh user data from database
    try {
        $stmt = $pdo->prepare("SELECT id, username, email, role FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo json_encode([
                'authenticated' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            // User not found, destroy session
            session_destroy();
            echo json_encode(['authenticated' => false]);
        }
    } catch (PDOException $e) {
        echo json_encode(['authenticated' => false, 'error' => 'Database error']);
    }
} else {
    echo json_encode(['authenticated' => false]);
}
?>
