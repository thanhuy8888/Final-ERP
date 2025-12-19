<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-language");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

require_once '../../includes/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->transfer_id) || !isset($data->action) || !isset($data->user_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
    exit();
}

try {
    $pdo->beginTransaction();

    // Get current transfer details
    $stmt = $pdo->prepare("SELECT * FROM stock_transfers WHERE id = ?");
    $stmt->execute([$data->transfer_id]);
    $transfer = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$transfer) {
        throw new Exception("Transfer not found.");
    }

    $current_status = $transfer['status'];
    $action = $data->action; // 'ship', 'receive', 'cancel'

    if ($action === 'ship' && $current_status === 'pending') {
        // PENDING -> IN_TRANSIT
        // 1. Deduct from Source
        // Note: Assuming 'inventory' table uses store_id + product_id/variant_id
        
        // Find source inventory item
        // Logic: Try to find inventory item for this store/product/variant
        // Ideally we select by ID if we stored it, but we stored product/variant/store separately.
        
        // Check Source Stock
        $sqlCheck = "SELECT quantity_on_hand, inventory_id FROM inventory 
                     WHERE store_id = :sid AND product_id = :pid";
        if ($transfer['variant_id']) {
            $sqlCheck .= " AND variant_id = :vid";
        }
        
        $stmtCheck = $pdo->prepare($sqlCheck);
        $params = [':sid' => $transfer['from_store_id'], ':pid' => $transfer['product_id']];
        if ($transfer['variant_id']) $params[':vid'] = $transfer['variant_id'];
        
        $stmtCheck->execute($params);
        $sourceItem = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if (!$sourceItem || $sourceItem['quantity_on_hand'] < $transfer['quantity']) {
            throw new Exception("Insufficient stock at source store (Current: " . ($sourceItem['quantity_on_hand'] ?? 0) . ")");
        }

        // Update Source Stock
        $newQty = $sourceItem['quantity_on_hand'] - $transfer['quantity'];
        $stmtUpd = $pdo->prepare("UPDATE inventory SET quantity_on_hand = ? WHERE inventory_id = ?");
        $stmtUpd->execute([$newQty, $sourceItem['inventory_id']]);

        // Update Transfer Status
        $stmtStatus = $pdo->prepare("UPDATE stock_transfers SET status = 'in_transit', approved_by = ? WHERE id = ?");
        $stmtStatus->execute([$data->user_id, $data->transfer_id]);


    } elseif ($action === 'receive' && $current_status === 'in_transit') {
        // IN_TRANSIT -> COMPLETED
        // 1. Add to Destination
        
        // Find dest inventory item, or create if not exists
         $sqlCheck = "SELECT quantity_on_hand, inventory_id FROM inventory 
                     WHERE store_id = :sid AND product_id = :pid";
        if ($transfer['variant_id']) {
            $sqlCheck .= " AND variant_id = :vid";
        }
        
        $stmtCheck = $pdo->prepare($sqlCheck);
        $params = [':sid' => $transfer['to_store_id'], ':pid' => $transfer['product_id']];
        if ($transfer['variant_id']) $params[':vid'] = $transfer['variant_id'];
        $stmtCheck->execute($params);
        $destItem = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if ($destItem) {
            // Update existing
            $newQty = $destItem['quantity_on_hand'] + $transfer['quantity'];
            $stmtUpd = $pdo->prepare("UPDATE inventory SET quantity_on_hand = ? WHERE inventory_id = ?");
            $stmtUpd->execute([$newQty, $destItem['inventory_id']]);
        } else {
            // Create new inventory record
            $sqlInsert = "INSERT INTO inventory (store_id, product_id, variant_id, quantity_on_hand) VALUES (?, ?, ?, ?)";
            $stmtInsert = $pdo->prepare($sqlInsert);
            $stmtInsert->execute([
                $transfer['to_store_id'], 
                $transfer['product_id'], 
                $transfer['variant_id'], 
                $transfer['quantity']
            ]);
        }

        // Update Transfer Status
        $stmtStatus = $pdo->prepare("UPDATE stock_transfers SET status = 'completed', completed_at = NOW() WHERE id = ?");
        $stmtStatus->execute([$data->transfer_id]);

    } elseif ($action === 'cancel' && $current_status === 'pending') {
        // PENDING -> CANCELLED
        // No stock impact, just status update
        $stmtStatus = $pdo->prepare("UPDATE stock_transfers SET status = 'cancelled' WHERE id = ?");
        $stmtStatus->execute([$data->transfer_id]);

    } else {
        throw new Exception("Invalid status transition.");
    }

    $pdo->commit();
    echo json_encode(["message" => "Transfer updated successfully."]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["message" => $e->getMessage()]);
}
?>
