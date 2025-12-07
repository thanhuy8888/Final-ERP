<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check auth (Sale or Admin)
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['sale', 'admin'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    $query = "
        SELECT i.quantity_on_hand, s.store_name, p.name as product_name, p.sku, p.image, 
               pv.size, pv.color, pv.variant_sku
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        LEFT JOIN product_variants pv ON i.variant_id = pv.variant_id
        JOIN stores s ON i.store_id = s.store_id
        WHERE 1=1
    ";
    
    $params = [];
    
    if ($search) {
        $query .= " AND (p.name LIKE ? OR p.sku LIKE ? OR pv.variant_sku LIKE ?)";
        $term = "%$search%";
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }
    
    $query .= " ORDER BY p.name, pv.size, pv.color, s.store_name LIMIT 50";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $stock = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($stock);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
