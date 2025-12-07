<?php
require_once '../includes/api_header.php';
require_once '../includes/db.php';

// Validate and apply promotion code
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['code']) || !isset($data['subtotal'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Mã giảm giá và tổng tiền là bắt buộc']);
        exit;
    }
    
    $code = strtoupper(trim($data['code']));
    $subtotal = floatval($data['subtotal']);
    
    try {
        // Find active promotion
        $stmt = $pdo->prepare("
            SELECT * FROM promotions 
            WHERE promotion_code = ? 
            AND is_active = 1 
            AND start_date <= NOW() 
            AND end_date >= NOW()
            AND (usage_limit IS NULL OR times_used < usage_limit)
        ");
        $stmt->execute([$code]);
        $promo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$promo) {
            http_response_code(400);
            echo json_encode(['error' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn']);
            exit;
        }
        
        // Check minimum purchase
        if ($subtotal < $promo['min_purchase_amount']) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Đơn hàng tối thiểu ' . number_format($promo['min_purchase_amount']) . 'đ để sử dụng mã này'
            ]);
            exit;
        }
        
        // Calculate discount
        $discount = 0;
        if ($promo['discount_type'] === 'Percentage') {
            $discount = $subtotal * ($promo['discount_value'] / 100);
            if ($promo['max_discount_amount'] && $discount > $promo['max_discount_amount']) {
                $discount = $promo['max_discount_amount'];
            }
        } else {
            $discount = $promo['discount_value'];
        }
        
        // Make sure discount doesn't exceed subtotal
        if ($discount > $subtotal) {
            $discount = $subtotal;
        }
        
        echo json_encode([
            'success' => true,
            'promotion_id' => $promo['promotion_id'],
            'promotion_name' => $promo['promotion_name'],
            'discount_type' => $promo['discount_type'],
            'discount_value' => $promo['discount_value'],
            'discount_amount' => round($discount),
            'new_total' => round($subtotal - $discount)
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
