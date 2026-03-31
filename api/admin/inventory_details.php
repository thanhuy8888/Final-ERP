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

if (!isset($_GET['inventory_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing inventory_id']);
    exit;
}

$inventory_id = $_GET['inventory_id'];

try {
    // 1. Get Inventory Item Details
    $stmt = $pdo->prepare("
        SELECT i.*, p.name as product_name, p.sku as product_sku, v.variant_sku
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        LEFT JOIN product_variants v ON i.variant_id = v.variant_id
        WHERE i.inventory_id = ?
    ");
    $stmt->execute([$inventory_id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        http_response_code(404);
        echo json_encode(['error' => 'Inventory item not found']);
        exit;
    }

    $product_id = $item['product_id'];
    $variant_id = $item['variant_id'];

    // 2. Fetch Sales History (Last 10 Orders)
    $salesSql = "
        SELECT 
            o.id as order_id, 
            o.created_at, 
            oi.quantity, 
            oi.price,
            u.full_name as customer_name
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE oi.product_id = ?
    ";
    $salesParams = [$product_id];

    if ($variant_id) {
        $salesSql .= " AND oi.variant_id = ?";
        $salesParams[] = $variant_id;
    }

    $salesSql .= " ORDER BY o.created_at DESC LIMIT 10";
    
    $stmtSales = $pdo->prepare($salesSql);
    $stmtSales->execute($salesParams);
    $sales_history = $stmtSales->fetchAll(PDO::FETCH_ASSOC);

    // 3. Fetch Audit Logs (Entity = Product or Inventory)
    // For now, mostly Product level audits, maybe Variant level if implemented
    $auditSql = "
        SELECT * 
        FROM audit_logs 
        WHERE (entity_type = 'product' AND entity_id = ?)
    ";
    $auditParams = [$product_id];
    
    // If you track variant changes separately, add OR condition here
    // $auditSql .= " OR (entity_type = 'variant' AND entity_id = ?)";
    
    $auditSql .= " ORDER BY created_at DESC LIMIT 20";

    $stmtAudit = $pdo->prepare($auditSql);
    $stmtAudit->execute($auditParams);
    $audit_logs = $stmtAudit->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'item' => $item,
        'sales_history' => $sales_history,
        'audit_logs' => $audit_logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
