<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-language");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

require_once '../../includes/db.php';

try {
    $stmt = $pdo->query("SELECT store_id as id, store_name as name, address FROM stores ORDER BY store_name ASC");
    $stores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($stores);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
