<?php
require_once '../../includes/db.php';

try {
    echo "--- Seeding Promotions ---\n";
    $pdo->query("TRUNCATE TABLE promotions"); // Clear existing for clean slate

    $promos = [
        [
            'code' => 'WELCOME10',
            'name' => 'Welcome Discount',
            'desc' => '10% off for all new orders',
            'type' => 'Percentage',
            'val' => 10,
            'bx' => NULL, 'gy' => NULL,
            'min' => 0,
            'start' => date('Y-m-d H:i:s'),
            'end' => date('Y-m-d H:i:s', strtotime('+30 days')),
            'status' => 'active',
            'tiers' => '[]'
        ],
        [
            'code' => 'SAVE50K',
            'name' => 'Save 50k on 500k',
            'desc' => 'Get 50,000 VND off orders over 500,000 VND',
            'type' => 'Fixed Amount',
            'val' => 50000,
            'bx' => NULL, 'gy' => NULL,
            'min' => 500000,
            'start' => date('Y-m-d H:i:s'),
            'end' => date('Y-m-d H:i:s', strtotime('+15 days')),
            'status' => 'active',
            'tiers' => '[]'
        ],
        [
            'code' => 'BUY2GET1',
            'name' => 'Buy 2 Get 1 Free',
            'desc' => 'Buy 2 items, get 1 free (Scope: T-Shirts)',
            'type' => 'BuyXGetY',
            'val' => 0,
            'bx' => 2, 'gy' => 1,
            'min' => 0,
            'start' => date('Y-m-d H:i:s'),
            'end' => date('Y-m-d H:i:s', strtotime('+7 days')),
            'status' => 'active',
            'tiers' => '[]'
        ],
        [
            'code' => 'VIPGOLD',
            'name' => 'Gold Members Exclusive',
            'desc' => '15% off for Gold, Platinum & Diamond members',
            'type' => 'Percentage',
            'val' => 15,
            'bx' => NULL, 'gy' => NULL,
            'min' => 0,
            'start' => date('Y-m-d H:i:s'),
            'end' => date('Y-m-d H:i:s', strtotime('+60 days')),
            'status' => 'active',
            'tiers' => '["gold", "platinum", "diamond"]'
        ],
        [
            'code' => 'BF2024',
            'name' => 'Black Friday 2024',
            'desc' => 'Expired campaign',
            'type' => 'Percentage',
            'val' => 50,
            'bx' => NULL, 'gy' => NULL,
            'min' => 0,
            'start' => '2024-11-01 00:00:00',
            'end' => '2024-11-30 23:59:59',
            'status' => 'expired',
            'tiers' => '[]'
        ]
    ];

    $sql = "INSERT INTO promotions (
        promotion_code, promotion_name, description, 
        discount_type, discount_value, buy_x, get_y, 
        min_purchase_amount, start_date, end_date, 
        status, membership_tiers, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);

    foreach ($promos as $p) {
        $stmt->execute([
            $p['code'], $p['name'], $p['desc'],
            $p['type'], $p['val'], $p['bx'], $p['gy'],
            $p['min'], $p['start'], $p['end'],
            $p['status'], $p['tiers'], ($p['status'] === 'active' ? 1 : 0)
        ]);
    }
    
    echo "Seeded " . count($promos) . " promotions successfully.";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
