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
        if (isset($_GET['product_id'])) {
            // Get inventory for specific product
            $stmt = $pdo->prepare("
                SELECT i.*, p.name as product_name, pv.size, pv.color, s.store_name
                FROM inventory i
                JOIN products p ON i.product_id = p.id
                LEFT JOIN product_variants pv ON i.variant_id = pv.variant_id
                JOIN stores s ON i.store_id = s.store_id
                WHERE i.product_id = ?
                ORDER BY pv.size, pv.color
            ");
            $stmt->execute([$_GET['product_id']]);
        } elseif (isset($_GET['low_stock'])) {
            // Get low stock alerts
            $stmt = $pdo->query("
                SELECT i.*, p.name as product_name, pv.size, pv.color, s.store_name
                FROM inventory i
                JOIN products p ON i.product_id = p.id
                LEFT JOIN product_variants pv ON i.variant_id = pv.variant_id
                JOIN stores s ON i.store_id = s.store_id
                WHERE i.quantity_on_hand <= i.low_stock_threshold
                ORDER BY i.quantity_on_hand ASC
            ");
        } else {
            // Get all inventory
            $stmt = $pdo->query("
                SELECT i.*, p.name as product_name, pv.size, pv.color, s.store_name
                FROM inventory i
                JOIN products p ON i.product_id = p.id
                LEFT JOIN product_variants pv ON i.variant_id = pv.variant_id
                JOIN stores s ON i.store_id = s.store_id
                ORDER BY p.name, pv.size, pv.color
            ");
        }
        $inventory = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($inventory);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['action']) && $data['action'] === 'adjust') {
            // Stock adjustment
            $pdo->beginTransaction();
            
            // Update inventory
            $stmt = $pdo->prepare("
                UPDATE inventory 
                SET quantity_on_hand = quantity_on_hand + ? 
                WHERE inventory_id = ?
            ");
            $stmt->execute([$data['quantity_change'], $data['inventory_id']]);
            
            // Log the adjustment
            $stmt = $pdo->prepare("
                INSERT INTO stock_adjustments (inventory_id, user_id, adjustment_type, quantity_change, reason) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['inventory_id'],
                $_SESSION['user_id'],
                $data['adjustment_type'] ?? 'Addition',
                $data['quantity_change'],
                $data['reason'] ?? null
            ]);
            
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Điều chỉnh tồn kho thành công']);
        } else {
            // Create or update inventory record
            if (isset($data['inventory_id']) && $data['inventory_id']) {
                $stmt = $pdo->prepare("
                    UPDATE inventory 
                    SET quantity_on_hand = ?, low_stock_threshold = ?
                    WHERE inventory_id = ?
                ");
                $stmt->execute([
                    $data['quantity_on_hand'],
                    $data['low_stock_threshold'] ?? 10,
                    $data['inventory_id']
                ]);
            } else {
                $stmt = $pdo->prepare("
                    INSERT INTO inventory (product_id, variant_id, store_id, quantity_on_hand, low_stock_threshold) 
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE quantity_on_hand = VALUES(quantity_on_hand)
                ");
                $stmt->execute([
                    $data['product_id'],
                    $data['variant_id'] ?? null,
                    $data['store_id'] ?? 1,
                    $data['quantity_on_hand'] ?? 0,
                    $data['low_stock_threshold'] ?? 10
                ]);
            }
            echo json_encode(['success' => true, 'message' => 'Cập nhật tồn kho thành công']);
        }
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
