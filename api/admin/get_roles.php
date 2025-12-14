<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../../includes/db.php';

try {
    // Get role statistics
    $sql = "SELECT role, COUNT(*) as user_count 
            FROM users 
            WHERE is_active = 1
            GROUP BY role
            ORDER BY user_count DESC";
    
    $stmt = $pdo->query($sql);
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'roles' => $roles
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
