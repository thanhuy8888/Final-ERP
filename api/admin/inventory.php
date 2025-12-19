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
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get filter parameters
        $store_id = isset($_GET['store_id']) ? $_GET['store_id'] : null;
        $status_filter = isset($_GET['status']) ? $_GET['status'] : null; // low, out, normal

        // Base query
        $sql = "
            SELECT 
                i.inventory_id,
                i.quantity_on_hand,
                i.last_updated,
                p.id as product_id,
                p.name as product_name,
                p.sku as product_sku,
                p.image as product_image,
                v.variant_id,
                v.size,
                v.color,
                v.variant_sku,
                s.store_id,
                s.store_name
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            LEFT JOIN product_variants v ON i.variant_id = v.variant_id
            JOIN stores s ON i.store_id = s.store_id
            WHERE 1=1
        ";

        $params = [];
        if ($store_id) {
            $sql .= " AND i.store_id = ?";
            $params[] = $store_id;
        }

        $sql .= " ORDER BY i.quantity_on_hand ASC"; // Show lowest stock first

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $inventory_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Process data for Status and AI Recommendations
        $processed_data = [];
        
        foreach ($inventory_items as $item) {
            $qty = (int)$item['quantity_on_hand'];
            
            // 1. Determine Status
            $status = 'normal';
            if ($qty <= 0) {
                $status = 'out_of_stock';
            } elseif ($qty <= 10) {
                $status = 'low_stock';
            }

            // Filter by status if requested
            if ($status_filter && $status_filter !== $status) {
                continue; 
            }

            // 2. Generate AI Recommendation
            $ai_recommendation = null;
            if ($status === 'out_of_stock') {
                $ai_recommendation = [
                    'action' => 'Urgent Replenish',
                    'quantity' => 50, // Simple rule: Target 50
                    'reason' => 'Stock is completely depleted. Potential sales loss.',
                    'priority' => 'critical'
                ];
            } elseif ($status === 'low_stock') {
                $deficit = 20 - $qty; // Target 20 for low stock
                $ai_recommendation = [
                    'action' => 'Restock',
                    'quantity' => max(10, $deficit),
                    'reason' => "Stock ($qty) is below safety threshold (10).",
                    'priority' => 'high'
                ];
            }

            // Format Item Name
            $sku = $item['variant_sku'] ? $item['variant_sku'] : $item['product_sku'];
            $name = $item['product_name'];
            if ($item['size'] || $item['color']) {
                $name .= " (" . trim($item['color'] . ' ' . $item['size']) . ")";
            }

            $processed_data[] = [
                'id' => $item['inventory_id'],
                'product_name' => $name,
                'sku' => $sku,
                'image' => $item['product_image'],
                'store_name' => $item['store_name'],
                'quantity' => $qty,
                'status' => $status,
                'last_updated' => $item['last_updated'],
                'ai_recommendation' => $ai_recommendation
            ];
        }

        echo json_encode($processed_data);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
