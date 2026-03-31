<?php
require_once '../includes/db.php';

try {
    // 1. Get a Sales User
    $stmt = $pdo->query("SELECT id FROM users WHERE role = 'sale' LIMIT 1");
    $saleUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$saleUser) {
        die("No sales user found. Please create a sales account first.");
    }
    $saleId = $saleUser['id'];

    // 2. Get a Customer (or create one)
    $stmt = $pdo->query("SELECT id FROM customers LIMIT 1");
    $customer = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$customer) {
        // Create dummy customer
        $stmt = $pdo->prepare("INSERT INTO customers (full_name, phone, created_by) VALUES (?, ?, ?)");
        $stmt->execute(['Demo Customer', '0123456789', $saleId]);
        $customerId = $pdo->lastInsertId();
    } else {
        $customerId = $customer['id'];
    }

    $pdo->beginTransaction();

    echo "Generating data for Sale ID: $saleId, Customer ID: $customerId<br>";

    // 3. Generate Monthly Data (Last 6 Months)
    for ($i = 6; $i >= 1; $i--) {
        $monthInfo = date('Y-m', strtotime("-$i months"));
        $ordersCount = rand(5, 10); // 5-10 orders per month
        
        echo "Generating matching orders for $monthInfo... ($ordersCount orders)<br>";

        for ($j = 0; $j < $ordersCount; $j++) {
            // Random day in that month
            $randomDay = rand(1, 28);
            $createdAt = date("$monthInfo-$randomDay H:i:s");
            // Random amount 500k - 2m
            $amount = rand(500, 2000) * 1000;
            
            $stmt = $pdo->prepare("
                INSERT INTO orders (sale_id, customer_id, total_amount, status, created_at)
                VALUES (?, ?, ?, 'completed', ?)
            ");
            $stmt->execute([$saleId, $customerId, $amount, $createdAt]);
        }
    }

    // 4. Generate Weekly Data (Concentrate some in last 8 weeks specific days)
    // This overlaps with above but ensures we have nice curves
    for ($w = 8; $w >= 0; $w--) {
        $ordersCount = rand(3, 7);
        for ($k = 0; $k < $ordersCount; $k++) {
            // Random date in the week $w weeks ago
            $daysAgo = ($w * 7) + rand(0, 6);
            $createdAt = date('Y-m-d H:i:s', strtotime("-$daysAgo days"));
             // Random amount 200k - 1m
             $amount = rand(200, 1000) * 1000;

             $stmt = $pdo->prepare("
                INSERT INTO orders (sale_id, customer_id, total_amount, status, created_at)
                VALUES (?, ?, ?, 'completed', ?)
            ");
            $stmt->execute([$saleId, $customerId, $amount, $createdAt]);
        }
    }

    $pdo->commit();
    echo "Successfully generated dummy sales data!";

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "Error: " . $e->getMessage();
}
?>
