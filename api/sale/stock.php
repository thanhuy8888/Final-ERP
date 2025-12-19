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
               pv.size, pv.color, pv.variant_sku, p.category_id,
               p.id as product_id, i.variant_id
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

    // Filter by specific product/variant for multi-store lookup
    if (isset($_GET['product_id'])) {
        $query .= " AND p.id = ?";
        $params[] = $_GET['product_id'];
    }
    
    // exact variant match (handle NULL for products without variants if needed, 
    // but usually 0 or specific ID is passed)
    if (isset($_GET['variant_id'])) {
        $vid = $_GET['variant_id'];
        if ($vid == 0 || $vid == 'null') {
             $query .= " AND (i.variant_id IS NULL OR i.variant_id = 0)";
        } else {
             $query .= " AND i.variant_id = ?";
             $params[] = $vid;
        }
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
