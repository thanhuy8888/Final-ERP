<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check admin auth
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    // Pagination defaults
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = 50;
    $offset = ($page - 1) * $limit;

    // Fetch logs with user info
    $stmt = $pdo->prepare("
        SELECT a.*, u.username, u.role
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT :limit OFFSET :offset
    ");
    
    // Bind parameters
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count
    $countStmt = $pdo->query("SELECT COUNT(*) FROM audit_logs");
    $total = $countStmt->fetchColumn();

    echo json_encode([
        'data' => $logs,
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'total_pages' => ceil($total / $limit)
    ]);

} catch (PDOException $e) {
    // If table doesn't exist, return empty
    if (strpos($e->getMessage(), "doesn't exist") !== false) {
        echo json_encode(['data' => [], 'total' => 0]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
