<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

// Mock Notifications for Demo
$notifications = [];

try {
    // 1. Stock Alerts (Real)
    $stmt = $pdo->query("SELECT name, stock_quantity FROM products WHERE stock_quantity < 10 AND stock_quantity > 0 LIMIT 3");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $notifications[] = [
            'id' => 'stock_' . uniqid(),
            'type' => 'alert',
            'icon' => 'warning',
            'title' => 'Sắp hết hàng',
            'message' => "Sản phẩm '{$row['name']}' chỉ còn {$row['stock_quantity']} chiếc.",
            'time' => 'Vừa xong'
        ];
    }

    // 2. Returning VIP (Mock Logic for "Smart" feel)
    // Find a VIP customer
    $stmt = $pdo->query("
        SELECT c.full_name, SUM(o.total_amount) as spent 
        FROM customers c 
        JOIN orders o ON c.id = o.customer_id 
        GROUP BY c.id 
        HAVING spent > 5000000 
        ORDER BY RAND() LIMIT 1
    ");
    $vip = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($vip) {
        $notifications[] = [
            'id' => 'vip_' . uniqid(),
            'type' => 'opportunity',
            'icon' => 'user',
            'title' => 'Khách VIP quay lại',
            'message' => "Khách hàng VIP {$vip['full_name']} vừa truy cập hệ thống. Hãy tư vấn ngay!",
            'time' => '5 phút trước'
        ];
    }

    // 3. Promo Opportunity (Smart Upsell)
    // Suggest a combo
    $notifications[] = [
        'id' => 'promo_' . uniqid(),
        'type' => 'opportunity',
        'icon' => 'tag',
        'title' => 'Cơ hội chốt đơn',
        'message' => "Combo 'Áo Sơ Mi + Quần Âu' đang có khuyến mãi giảm 15%. Gợi ý cho khách mua Áo Sơ Mi.",
        'time' => '10 phút trước'
    ];

    // 4. KPI Info
    $notifications[] = [
        'id' => 'kpi_' . uniqid(),
        'type' => 'info',
        'icon' => 'chart',
        'title' => 'Khen thưởng',
        'message' => "Bạn đã đạt 85% chỉ tiêu tháng này. Cố lên!",
        'time' => '1 giờ trước'
    ];

} catch (Exception $e) {
    // Fallback
}

echo json_encode($notifications);
?>
