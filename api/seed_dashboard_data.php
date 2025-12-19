<?php
require_once __DIR__ . '/../includes/db.php';

try {
    echo "Starting dashboard data seeding...\n\n";

    // 1. Add inventory data for stock status chart
    echo "=== Adding Inventory Data ===\n";
    
    // Get all products
    $stmt = $pdo->query("SELECT id FROM products WHERE is_active = 1");
    $products = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($products)) {
        echo "No products found. Please run seed_products.php first.\n";
        exit;
    }

    // Get store IDs
    $stmt = $pdo->query("SELECT store_id FROM stores LIMIT 1");
    $store_id = $stmt->fetchColumn();
    
    if (!$store_id) {
        echo "No stores found. Creating default store...\n";
        $pdo->exec("INSERT INTO stores (store_name, address, phone) VALUES ('Cửa hàng chính', 'Hà Nội', '0123456789')");
        $store_id = $pdo->lastInsertId();
    }

    // Clear existing inventory
    $pdo->exec("DELETE FROM inventory");
    
    // Add inventory with varied stock levels
    $inventoryStmt = $pdo->prepare("
        INSERT INTO inventory (product_id, store_id, quantity_on_hand, last_updated)
        VALUES (?, ?, ?, NOW())
    ");

    $stockLevels = [
        'low' => [5, 7, 3, 8, 2],      // Low stock (< 10)
        'normal' => [25, 45, 60, 30, 50], // Normal stock
        'high' => [120, 150, 200, 180, 110] // High stock (> 100)
    ];

    $index = 0;
    foreach ($products as $product_id) {
        // Distribute products across different stock levels
        if ($index < 5) {
            $quantity = $stockLevels['low'][$index % 5];
        } elseif ($index < 10) {
            $quantity = $stockLevels['normal'][$index % 5];
        } else {
            $quantity = $stockLevels['high'][$index % 5];
        }
        
        $inventoryStmt->execute([$product_id, $store_id, $quantity]);
        echo "Added inventory for product $product_id: $quantity units\n";
        $index++;
    }

    // 2. Add cancelled orders for return rate
    echo "\n=== Adding Cancelled Orders ===\n";
    
    // Get a customer user
    $stmt = $pdo->query("SELECT id FROM users WHERE role = 'customer' LIMIT 1");
    $customer_id = $stmt->fetchColumn();
    
    if (!$customer_id) {
        echo "No customers found. Creating test customer...\n";
        $pdo->exec("
            INSERT INTO users (username, password, email, full_name, role) 
            VALUES ('customer1', '\$2y\$10\$abcdefghijklmnopqrstuvwxyz', 'customer@test.com', 'Khách hàng test', 'customer')
        ");
        $customer_id = $pdo->lastInsertId();
    }

    // Create cancelled orders
    $orderStmt = $pdo->prepare("
        INSERT INTO orders (user_id, store_id, total_amount, status, created_at)
        VALUES (?, ?, ?, 'cancelled', ?)
    ");

    $orderItemStmt = $pdo->prepare("
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
    ");

    // Add 3 cancelled orders in the last 7 days
    $cancelledOrders = [
        ['amount' => 450000, 'days_ago' => 2],
        ['amount' => 320000, 'days_ago' => 4],
        ['amount' => 680000, 'days_ago' => 6]
    ];

    foreach ($cancelledOrders as $order) {
        $created_at = date('Y-m-d H:i:s', strtotime("-{$order['days_ago']} days"));
        $orderStmt->execute([$customer_id, $store_id, $order['amount'], $created_at]);
        $order_id = $pdo->lastInsertId();
        
        // Add order items
        $product_id = $products[array_rand($products)];
        $orderItemStmt->execute([$order_id, $product_id, 2, $order['amount'] / 2]);
        
        echo "Created cancelled order #$order_id: " . number_format($order['amount']) . "đ\n";
    }

    // 3. Add more completed orders for better data
    echo "\n=== Adding Completed Orders ===\n";
    
    $completedOrders = [
        ['amount' => 850000, 'days_ago' => 1],
        ['amount' => 1200000, 'days_ago' => 2],
        ['amount' => 650000, 'days_ago' => 3],
        ['amount' => 920000, 'days_ago' => 5],
        ['amount' => 780000, 'days_ago' => 6]
    ];

    $completedOrderStmt = $pdo->prepare("
        INSERT INTO orders (user_id, store_id, total_amount, status, created_at)
        VALUES (?, ?, ?, 'completed', ?)
    ");

    foreach ($completedOrders as $order) {
        $created_at = date('Y-m-d H:i:s', strtotime("-{$order['days_ago']} days"));
        $completedOrderStmt->execute([$customer_id, $store_id, $order['amount'], $created_at]);
        $order_id = $pdo->lastInsertId();
        
        // Add order items
        $product_id = $products[array_rand($products)];
        $orderItemStmt->execute([$order_id, $product_id, 3, $order['amount'] / 3]);
        
        echo "Created completed order #$order_id: " . number_format($order['amount']) . "đ\n";
    }

    // 4. Add pending and processing orders
    echo "\n=== Adding Pending/Processing Orders ===\n";
    
    $pendingOrders = [
        ['amount' => 550000, 'status' => 'pending', 'days_ago' => 0],
        ['amount' => 720000, 'status' => 'pending', 'days_ago' => 1],
        ['amount' => 890000, 'status' => 'processing', 'days_ago' => 1],
        ['amount' => 640000, 'status' => 'processing', 'days_ago' => 2]
    ];

    $mixedOrderStmt = $pdo->prepare("
        INSERT INTO orders (user_id, store_id, total_amount, status, created_at)
        VALUES (?, ?, ?, ?, ?)
    ");

    foreach ($pendingOrders as $order) {
        $created_at = date('Y-m-d H:i:s', strtotime("-{$order['days_ago']} days"));
        $mixedOrderStmt->execute([$customer_id, $store_id, $order['amount'], $order['status'], $created_at]);
        $order_id = $pdo->lastInsertId();
        
        // Add order items
        $product_id = $products[array_rand($products)];
        $orderItemStmt->execute([$order_id, $product_id, 2, $order['amount'] / 2]);
        
        echo "Created {$order['status']} order #$order_id: " . number_format($order['amount']) . "đ\n";
    }

    echo "\n=== Summary ===\n";
    
    // Show inventory stats
    $stmt = $pdo->query("SELECT COUNT(*) FROM inventory WHERE quantity_on_hand < 10");
    $low_stock = $stmt->fetchColumn();
    echo "Low stock items (< 10): $low_stock\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM inventory WHERE quantity_on_hand > 100");
    $high_stock = $stmt->fetchColumn();
    echo "High stock items (> 100): $high_stock\n";
    
    // Show order stats
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM orders GROUP BY status");
    $orderStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "\nOrder status breakdown:\n";
    foreach ($orderStats as $stat) {
        echo "  {$stat['status']}: {$stat['count']}\n";
    }
    
    // Calculate return rate
    $stmt = $pdo->query("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
            ROUND((SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as return_rate
        FROM orders
    ");
    $rateStats = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "\nReturn Rate: {$rateStats['return_rate']}% ({$rateStats['cancelled']}/{$rateStats['total']} orders)\n";
    
    echo "\n✅ Dashboard data seeding completed successfully!\n";

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
