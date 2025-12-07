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
        if (isset($_GET['id'])) {
            // Get specific promotion with linked products
            $stmt = $pdo->prepare("SELECT * FROM promotions WHERE promotion_id = ?");
            $stmt->execute([$_GET['id']]);
            $promotion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($promotion) {
                // Get linked products
                $stmt = $pdo->prepare("
                    SELECT pp.*, p.name as product_name, c.name as category_name
                    FROM promotion_products pp
                    LEFT JOIN products p ON pp.product_id = p.id
                    LEFT JOIN categories c ON pp.category_id = c.id
                    WHERE pp.promotion_id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $promotion['products'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode($promotion);
        } elseif (isset($_GET['active'])) {
            // Get active promotions only
            $stmt = $pdo->query("
                SELECT * FROM promotions 
                WHERE is_active = TRUE AND start_date <= NOW() AND end_date >= NOW()
                ORDER BY end_date ASC
            ");
            $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($promotions);
        } else {
            // Get all promotions
            $stmt = $pdo->query("SELECT * FROM promotions ORDER BY created_at DESC");
            $promotions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($promotions);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['promotion_id']) && $data['promotion_id']) {
            // Update existing promotion
            $stmt = $pdo->prepare("
                UPDATE promotions 
                SET promotion_code = ?, promotion_name = ?, description = ?, 
                    discount_type = ?, discount_value = ?, min_purchase_amount = ?,
                    max_discount_amount = ?, start_date = ?, end_date = ?, 
                    usage_limit = ?, is_active = ?
                WHERE promotion_id = ?
            ");
            $stmt->execute([
                $data['promotion_code'],
                $data['promotion_name'],
                $data['description'] ?? null,
                $data['discount_type'],
                $data['discount_value'],
                $data['min_purchase_amount'] ?? 0,
                $data['max_discount_amount'] ?? null,
                $data['start_date'],
                $data['end_date'],
                $data['usage_limit'] ?? null,
                $data['is_active'] ?? true,
                $data['promotion_id']
            ]);
            echo json_encode(['success' => true, 'message' => 'Cập nhật khuyến mãi thành công']);
        } else {
            // Create new promotion
            $stmt = $pdo->prepare("
                INSERT INTO promotions (promotion_code, promotion_name, description, discount_type, 
                    discount_value, min_purchase_amount, max_discount_amount, start_date, end_date, 
                    usage_limit, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['promotion_code'],
                $data['promotion_name'],
                $data['description'] ?? null,
                $data['discount_type'],
                $data['discount_value'],
                $data['min_purchase_amount'] ?? 0,
                $data['max_discount_amount'] ?? null,
                $data['start_date'],
                $data['end_date'],
                $data['usage_limit'] ?? null,
                $data['is_active'] ?? true
            ]);
            echo json_encode(['success' => true, 'message' => 'Thêm khuyến mãi thành công', 'promotion_id' => $pdo->lastInsertId()]);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("DELETE FROM promotions WHERE promotion_id = ?");
        $stmt->execute([$data['promotion_id']]);
        echo json_encode(['success' => true, 'message' => 'Xóa khuyến mãi thành công']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
