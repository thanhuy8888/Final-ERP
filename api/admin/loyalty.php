<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: List Logs ---
if ($method === 'GET') {
    // Optional filter by customer_id
    $customerId = $_GET['customer_id'] ?? null;
    $limit = $_GET['limit'] ?? 50;
    
    $sql = "SELECT l.*, c.full_name, c.email, u.username as staff_name 
            FROM loyalty_logs l
            JOIN customers c ON l.customer_id = c.id
            LEFT JOIN users u ON l.created_by = u.id
            WHERE 1=1";
            
    if ($customerId) {
        $sql .= " AND l.customer_id = :cid";
    }
    
    $sql .= " ORDER BY l.created_at DESC LIMIT :limit";
    
    $stmt = $pdo->prepare($sql);
    if ($customerId) $stmt->bindValue(':cid', $customerId);
    $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
    $stmt->execute();
    
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// --- POST: Adjust Points ---
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $customerId = $data['customer_id'] ?? null;
    $points = (int)($data['points'] ?? 0);
    $reason = $data['reason'] ?? 'Manual Adjustment';
    
    if (!$customerId || $points === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid parameters']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. Update Customer Points
        // Note: 'total_points' usually tracks lifetime, 'loyalty_points' tracks current balance.
        // We should update 'loyalty_points' (balance) AND 'total_points' (if positive earn).
        // For manual adjustment, let's assume we update Balance.
        // If points > 0, it's an 'earn' or 'adjust' add.
        // If points < 0, it's 'redeem' or 'adjust' subtract.
        
        $type = 'adjust';
        if ($points > 0) {
             // For simplicity, treat as adjustment.
        } else {
             // Check balance? Maybe for now allow negative balance if admin forces it?
             // Better to check.
        }

        $stmt = $pdo->prepare("UPDATE customers SET loyalty_points = loyalty_points + :p WHERE id = :id");
        $stmt->execute([':p' => $points, ':id' => $customerId]);

        // 2. Insert Log
        $stmtLog = $pdo->prepare("INSERT INTO loyalty_logs (customer_id, points, type, reference_type, reason, created_by) VALUES (?, ?, ?, 'manual', ?, ?)");
        $stmtLog->execute([$customerId, $points, 'adjust', $reason, $_SESSION['user_id']]);

        $pdo->commit();
        echo json_encode(['message' => 'Points adjusted successfully']);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
