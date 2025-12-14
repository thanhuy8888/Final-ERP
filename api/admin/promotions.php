<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $sql = "SELECT * FROM promotions ORDER BY created_at DESC";
        $stmt = $pdo->query($sql);
        $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decode JSON fields
        foreach ($promotions as &$p) {
            $p['scope_ids'] = json_decode($p['scope_ids'] ?? '[]', true);
            $p['membership_tiers'] = json_decode($p['membership_tiers'] ?? '[]', true);
        }
        
        echo json_encode($promotions);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validation
    if (empty($data['promotion_code']) || empty($data['promotion_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    // Format JSON fields
    $scope_ids = isset($data['scope_ids']) ? json_encode($data['scope_ids']) : NULL;
    $membership_tiers = isset($data['membership_tiers']) ? json_encode($data['membership_tiers']) : NULL;
    
    // Status Logic
    $status = $data['status'] ?? 'draft'; 

    try {
        if (isset($data['promotion_id'])) {
            // Update
            $sql = "UPDATE promotions SET 
                    promotion_code = ?, promotion_name = ?, description = ?, 
                    discount_type = ?, discount_value = ?, buy_x = ?, get_y = ?,
                    min_purchase_amount = ?, max_discount_amount = ?, 
                    start_date = ?, end_date = ?, 
                    status = ?, is_active = ?,
                    scope_type = ?, scope_ids = ?, membership_tiers = ?,
                    usage_limit = ?, priority = ?, stackable = ?
                    WHERE promotion_id = ?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['promotion_code'], $data['promotion_name'], $data['description'] ?? '',
                $data['discount_type'], $data['discount_value'] ?? 0, $data['buy_x'] ?? NULL, $data['get_y'] ?? NULL,
                $data['min_purchase_amount'] ?? 0, $data['max_discount_amount'] ?? NULL,
                $data['start_date'], $data['end_date'],
                $status, $data['is_active'] ?? 1,
                $data['scope_type'] ?? 'all', $scope_ids, $membership_tiers,
                $data['usage_limit'] ?? NULL, $data['priority'] ?? 0, $data['stackable'] ?? 0,
                $data['promotion_id']
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Promotion updated']);
        } else {
            // Create
            $sql = "INSERT INTO promotions (
                    promotion_code, promotion_name, description, 
                    discount_type, discount_value, buy_x, get_y,
                    min_purchase_amount, max_discount_amount, 
                    start_date, end_date, 
                    status, is_active,
                    scope_type, scope_ids, membership_tiers,
                    usage_limit, priority, stackable
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['promotion_code'], $data['promotion_name'], $data['description'] ?? '',
                $data['discount_type'], $data['discount_value'] ?? 0, $data['buy_x'] ?? NULL, $data['get_y'] ?? NULL,
                $data['min_purchase_amount'] ?? 0, $data['max_discount_amount'] ?? NULL,
                $data['start_date'], $data['end_date'],
                $status, $data['is_active'] ?? 1,
                $data['scope_type'] ?? 'all', $scope_ids, $membership_tiers,
                $data['usage_limit'] ?? NULL, $data['priority'] ?? 0, $data['stackable'] ?? 0
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Promotion created']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['promotion_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID']);
        exit;
    }
    
    $stmt = $pdo->prepare("DELETE FROM promotions WHERE promotion_id = ?");
    $stmt->execute([$data['promotion_id']]);
    echo json_encode(['success' => true]);
}
?>
