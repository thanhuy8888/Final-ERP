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

if (
    !isset($data->from_store_id) || 
    !isset($data->to_store_id) || 
    !isset($data->product_id) || 
    !isset($data->quantity)
) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
    exit();
}

try {
    // Generate Transfer Code
    $date = date('Ymd');
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM stock_transfers WHERE DATE(created_at) = CURDATE()");
    $stmt->execute();
    $count = $stmt->fetchColumn() + 1;
    $transfer_code = "ST-" . $date . "-" . str_pad($count, 3, '0', STR_PAD_LEFT);

    // Get Variant ID if not provided (default null)
    $variant_id = isset($data->variant_id) ? $data->variant_id : null;
    $sku = isset($data->sku) ? $data->sku : 'UNKNOWN';
    $user_id = isset($data->user_id) ? $data->user_id : 1; // Default to admin if removed

    // Check Source Stock (Optional Validation)
    // We could block if quantity > source stock, but for now we allow creating the REQUEST even if low stock.
    // The "Ship" action will strictly check stock.

    $sql = "INSERT INTO stock_transfers 
            (transfer_code, from_store_id, to_store_id, product_id, variant_id, sku, quantity, note, created_by, status)
            VALUES 
            (:code, :from, :to, :pid, :vid, :sku, :qty, :note, :uid, 'pending')";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':code' => $transfer_code,
        ':from' => $data->from_store_id,
        ':to' => $data->to_store_id,
        ':pid' => $data->product_id,
        ':vid' => $variant_id,
        ':sku' => $sku,
        ':qty' => $data->quantity,
        ':note' => isset($data->note) ? $data->note : '',
        ':uid' => $user_id
    ]);

    echo json_encode([
        "message" => "Transfer request created successfully.",
        "transfer_code" => $transfer_code
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>
