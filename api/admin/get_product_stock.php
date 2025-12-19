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

if (!isset($_GET['product_id']) || !isset($_GET['store_ids'])) {
    http_response_code(400);
    echo json_encode(["message" => "Missing parameters"]);
    exit();
}

$product_id = $_GET['product_id'];
$store_ids = explode(',', $_GET['store_ids']);

if (empty($store_ids)) {
    echo json_encode([]);
    exit();
}

try {
    // Prepare placeholders for IN clause
    $placeholders = implode(',', array_fill(0, count($store_ids), '?'));
    
    // Select stock for these stores
    $sql = "SELECT store_id, quantity_on_hand 
            FROM inventory 
            WHERE product_id = ? AND store_id IN ($placeholders)";
            
    $stmt = $pdo->prepare($sql);
    
    // Bind parameters: first product_id, then all store_ids
    $params = array_merge([$product_id], $store_ids);
    $stmt->execute($params);
    
    $stocks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Map to simple object { store_id: qty }
    $result = [];
    foreach ($stocks as $s) {
        $result[$s['store_id']] = (int)$s['quantity_on_hand'];
    }
    
    // Ensure all requested stores return at least 0 if record missing
    foreach ($store_ids as $sid) {
        if (!isset($result[$sid])) {
            $result[$sid] = 0;
        }
    }
    
    echo json_encode($result);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>
