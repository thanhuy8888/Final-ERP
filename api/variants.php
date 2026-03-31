<?php
require_once '../includes/api_header.php';
require_once '../includes/db.php';

// Get variants for a product
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['product_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID required']);
        exit;
    }
    
    $product_id = $_GET['product_id'];
    
    try {
        $stmt = $pdo->prepare("
            SELECT pv.*, 
                COALESCE((SELECT SUM(quantity_on_hand) FROM inventory WHERE variant_id = pv.variant_id), 0) as stock
            FROM product_variants pv
            WHERE pv.product_id = ? AND pv.is_active = 1
            ORDER BY pv.size, pv.color
        ");
        $stmt->execute([$product_id]);
        $variants = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($variants);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
