<?php
ini_set('display_errors', 0); // Disable display to prevent HTML in JSON
ini_set('log_errors', 1);
ini_set('error_log', '../../logs/php_error.log');

require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

try {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        throw new Exception("Unauthorized access");
    }

    $user_id = $_SESSION['user_id'];
    $input = file_get_contents("php://input");
    $data = json_decode($input);

    if (!$data) {
        throw new Exception("Invalid JSON input: " . json_last_error_msg());
    }

    if (
        !isset($data->inventory_id) ||
        !isset($data->type) ||
        !isset($data->quantity) ||
        !isset($data->reason)
    ) {
        throw new Exception("Missing required fields (inventory_id, type, quantity, reason)");
    }

    $pdo->beginTransaction();

    // 1. Get current stock
    $stmt = $pdo->prepare("
        SELECT i.quantity_on_hand as quantity, i.inventory_id 
        FROM inventory i 
        WHERE i.inventory_id = ? FOR UPDATE
    ");
    $stmt->execute([$data->inventory_id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        throw new Exception("Inventory item #{$data->inventory_id} not found.");
    }

    $current_qty = (int)$item['quantity'];
    $adjust_qty = (int)$data->quantity;

    if ($data->type === 'increase') {
        $new_qty = $current_qty + $adjust_qty;
    } else {
        $new_qty = $current_qty - $adjust_qty;
        if ($new_qty < 0) {
            throw new Exception("Insufficient stock ($current_qty) for deduction ($adjust_qty).");
        }
    }

    // 2. Update Inventory
    $updateStmt = $pdo->prepare("UPDATE inventory SET quantity_on_hand = ? WHERE inventory_id = ?");
    $updateStmt->execute([$new_qty, $data->inventory_id]);

    // 3. Insert Adjustment Log
    $logStmt = $pdo->prepare("
        INSERT INTO inventory_adjustments 
        (inventory_id, user_id, type, quantity, reason, note, previous_stock, new_stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $logStmt->execute([
        $data->inventory_id,
        $user_id,
        $data->type,
        $adjust_qty,
        $data->reason,
        $data->note ?? '',
        $current_qty,
        $new_qty
    ]);

    // 4. Audit Log (Simplified)
    // Check if audit_logs table exists and has compatible columns
    // We'll wrap this in a try-catch or just try standard insertion
    $auditStmt = $pdo->prepare("
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
        VALUES (?, ?, 'inventory', ?, ?, ?)
    ");
    
    $action = $data->type === 'increase' ? 'STOCK_INCREASE' : 'STOCK_DECREASE';
    $auditStmt->execute([
        $user_id,
        $action,
        $data->inventory_id,
        (string)$current_qty,
        (string)$new_qty
    ]);

    $pdo->commit();

    echo json_encode([
        "message" => "Stock adjusted successfully.",
        "new_stock" => $new_qty
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "message" => "Server Error: " . $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
    error_log("Adjustment Error: " . $e->getMessage());
} catch (Error $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        "message" => "Critical Error: " . $e->getMessage()
    ]);
    error_log("Adjustment Critical Error: " . $e->getMessage());
}
?>
