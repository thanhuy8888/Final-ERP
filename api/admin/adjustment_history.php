<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $sql = "
        SELECT 
            ia.*,
            p.name as product_name,
            p.sku as product_sku,
            s.store_name,
            u.full_name as user_name
        FROM inventory_adjustments ia
        JOIN inventory i ON ia.inventory_id = i.inventory_id
        JOIN products p ON i.product_id = p.id
        JOIN stores s ON i.store_id = s.store_id
        JOIN users u ON ia.user_id = u.id
        ORDER BY ia.created_at DESC
        LIMIT 50
    ";

    $stmt = $pdo->query($sql);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($history);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
