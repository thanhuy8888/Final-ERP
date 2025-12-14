<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-language");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

require_once '../../includes/db.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->transfer_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing transfer ID."]);
    exit();
}

try {
    // Only allow deleting cancelled or pending transfers? 
    // Usually completed transfers should not be deleted for audit reasons.
    // But for this request (cleaning up bad data), we'll allow it.
    
    $stmt = $pdo->prepare("DELETE FROM stock_transfers WHERE id = ?");
    $stmt->execute([$data->transfer_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["message" => "Transfer deleted successfully."]);
    } else {
        http_response_code(404);
        echo json_encode(["message" => "Transfer not found."]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>
