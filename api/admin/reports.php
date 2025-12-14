<?php
require_once '../../includes/db.php';
require_once '../../includes/api_header.php';

$type = $_GET['type'] ?? '';
$start_date = $_GET['start_date'] ?? date('Y-m-01');
$end_date = $_GET['end_date'] ?? date('Y-m-d');

// Helper to format currency
function formatCurrency($amount) {
    return (float)$amount;
}

try {
    if ($type === 'sales') {
        // --- Sales Reports ---

        // 1. Summary Metrics
        $summarySql = "SELECT 
            SUM(total_amount) as total_revenue, 
            COUNT(id) as total_orders
            FROM orders 
            WHERE created_at BETWEEN :start AND :end AND status != 'cancelled'";
        
        $stmt = $pdo->prepare($summarySql);
        $stmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);

        $totalRevenue = $summary['total_revenue'] ?? 0;
        $totalOrders = $summary['total_orders'] ?? 0;
        $aov = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // 2. Revenue Over Time (Line Chart)
        $chartSql = "SELECT 
            DATE(created_at) as date, 
            SUM(total_amount) as revenue 
            FROM orders 
            WHERE created_at BETWEEN :start AND :end AND status != 'cancelled'
            GROUP BY DATE(created_at) 
            ORDER BY DATE(created_at)";
        
        $stmt = $pdo->prepare($chartSql);
        $stmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $revenueChart = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Orders by Store (Bar Chart)
        $storeSql = "SELECT 
            s.store_name, 
            COUNT(o.id) as order_count 
            FROM orders o
            JOIN stores s ON o.store_id = s.store_id
            WHERE o.created_at BETWEEN :start AND :end AND o.status != 'cancelled'
            GROUP BY s.store_name
            ORDER BY order_count DESC";

        $stmt = $pdo->prepare($storeSql);
        $stmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $storeChart = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Sales AI Insights (Comparison with Previous Period)
        $start = new DateTime($start_date);
        $end = new DateTime($end_date);
        $diff = $start->diff($end);
        $days = $diff->days + 1; // Include start day

        $prevEnd = (clone $start)->modify('-1 day');
        $prevStart = (clone $prevEnd)->modify("-".($days-1)." days");
        
        $prevStartStr = $prevStart->format('Y-m-d 00:00:00');
        $prevEndStr = $prevEnd->format('Y-m-d 23:59:59');

        $prevSummarySql = "SELECT 
            SUM(total_amount) as total_revenue, 
            COUNT(id) as total_orders
            FROM orders 
            WHERE created_at BETWEEN :start AND :end AND status != 'cancelled'";
        
        $prevStmt = $pdo->prepare($prevSummarySql);
        $prevStmt->execute([':start' => $prevStartStr, ':end' => $prevEndStr]);
        $prevSummary = $prevStmt->fetch(PDO::FETCH_ASSOC);

        $prevRevenue = $prevSummary['total_revenue'] ?? 0;
        $prevOrders = $prevSummary['total_orders'] ?? 0;

        // Calculate Growth %
        $revenueGrowth = $prevRevenue > 0 ? (($totalRevenue - $prevRevenue) / $prevRevenue) * 100 : 100;
        $ordersGrowth = $prevOrders > 0 ? (($totalOrders - $prevOrders) / $prevOrders) * 100 : 100;

        // Generate Insights
        $insights = [];
        if ($revenueGrowth < -10) {
            $insights[] = [
                'type' => 'revenue_drop',
                'message' => "Revenue dropped by " . round(abs($revenueGrowth), 1) . "% compared to the previous $days days.",
                'action' => 'Consider Promotion'
            ];
        }
        if ($ordersGrowth < -10) {
            $insights[] = [
                'type' => 'orders_drop',
                'message' => "Order count dropped by " . round(abs($ordersGrowth), 1) . "% compared to the previous period.",
                'action' => 'View Affected Stores'
            ];
        }

        echo json_encode([
            'summary' => [
                'total_revenue' => formatCurrency($totalRevenue),
                'total_orders' => (int)$totalOrders,
                'aov' => formatCurrency($aov),
                'revenue_growth' => round($revenueGrowth, 1),
                'orders_growth' => round($ordersGrowth, 1)
            ],
            'revenue_chart' => $revenueChart,
            'store_chart' => $storeChart,
            'insights' => $insights
        ]);

    } elseif ($type === 'inventory') {
        // --- Inventory Reports ---

        // 1. Inventory Summary (Stock Value, Low Stock, Total Items)
        // Note: Turnover is calculated dynamically based on sales in the period.
        
        $inventorySql = "SELECT 
            SUM(i.quantity_on_hand * p.price) as total_stock_value,
            COUNT(DISTINCT p.id) as total_products,
            SUM(CASE WHEN i.quantity_on_hand <= 10 THEN 1 ELSE 0 END) as low_stock_count,
            SUM(CASE WHEN i.quantity_on_hand = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
            SUM(i.quantity_on_hand) as total_stock_qty
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            WHERE p.is_active = 1";
        
        $invStmt = $pdo->query($inventorySql);
        $invStats = $invStmt->fetch(PDO::FETCH_ASSOC);

        // Sales for Turnover Calculation (Sold Qty in Date Range)
        $salesQtySql = "SELECT SUM(oi.quantity) as sold_qty 
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at BETWEEN :start AND :end 
            AND o.status != 'cancelled'";
        
        $salesStmt = $pdo->prepare($salesQtySql);
        $salesStmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $soldStats = $salesStmt->fetch(PDO::FETCH_ASSOC);

        $soldQty = $soldStats['sold_qty'] ?? 0;
        $totalStock = $invStats['total_stock_qty'] ?? 1; // Avoid division by zero
        $turnoverRate = ($soldQty / $totalStock) * 100;

        // 2. Stock Value by Category (Pie Chart)
        $catSql = "SELECT 
            c.name as category_name, 
            SUM(i.quantity_on_hand * p.price) as stock_value
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            GROUP BY c.name
            ORDER BY stock_value DESC";
        $catStmt = $pdo->query($catSql);
        $categoryChart = $catStmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Inventory Aging (Bar Chart - grouped by last_updated)
        // Buckets: 0-30, 31-60, 61-90, 90+ days
        $agingSql = "SELECT 
            CASE 
                WHEN DATEDIFF(NOW(), i.last_updated) <= 30 THEN '0-30 Days'
                WHEN DATEDIFF(NOW(), i.last_updated) <= 60 THEN '31-60 Days'
                WHEN DATEDIFF(NOW(), i.last_updated) <= 90 THEN '61-90 Days'
                ELSE '90+ Days'
            END as age_group,
            COUNT(i.product_id) as item_count
            FROM inventory i
            GROUP BY age_group
            ORDER BY FIELD(age_group, '0-30 Days', '31-60 Days', '61-90 Days', '90+ Days')";
        $agingStmt = $pdo->query($agingSql);
        $agingChart = $agingStmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Low Stock Drill-down (Top 10)
        $lowStockSql = "SELECT 
            p.name as product_name,
            p.sku,
            s.store_name,
            i.quantity_on_hand,
            i.last_updated
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            JOIN stores s ON i.store_id = s.store_id
            WHERE i.quantity_on_hand <= 10
            ORDER BY i.quantity_on_hand ASC
            LIMIT 10";
        $lowStockStmt = $pdo->query($lowStockSql);
        $lowStockList = $lowStockStmt->fetchAll(PDO::FETCH_ASSOC);

        // 5. AI Insights Logic (Rule-based)
        // Rule A: Stagnant Stock (High Age > 60 days) - Assuming 'last_updated' reflects movement
        $stagnantSql = "SELECT COUNT(*) as count FROM inventory WHERE DATEDIFF(NOW(), last_updated) > 60 AND quantity_on_hand > 0";
        $stagnantStmt = $pdo->query($stagnantSql);
        $stagnantCount = $stagnantStmt->fetchColumn();

        // Rule B: Overstock (Qty > 50 - Alert Threshold)
        $overstockSql = "SELECT COUNT(*) as count FROM inventory WHERE quantity_on_hand > 50";
        $overstockStmt = $pdo->query($overstockSql);
        $overstockCount = $overstockStmt->fetchColumn();

        echo json_encode([
            'summary' => [
                'total_stock_value' => formatCurrency($invStats['total_stock_value'] ?? 0),
                'total_products' => (int)($invStats['total_products'] ?? 0),
                'low_stock_count' => (int)($invStats['low_stock_count'] ?? 0),
                'out_of_stock_count' => (int)($invStats['out_of_stock_count'] ?? 0),
                'turnover_rate' => round($turnoverRate, 2)
            ],
            'insights' => [
                'stagnant_count' => (int)$stagnantCount,
                'overstock_count' => (int)$overstockCount
            ],
            'category_chart' => $categoryChart,
            'aging_chart' => $agingChart,
            'low_stock_list' => $lowStockList
        ]);


    } elseif ($type === 'customers') {
        // --- Customer Analytics ---

        // 1. New vs Returning Customers (based on order count)
        $newCustomersSql = "SELECT COUNT(DISTINCT c.id) as new_customers
            FROM customers c
            WHERE c.created_at BETWEEN :start AND :end";
        
        $newStmt = $pdo->prepare($newCustomersSql);
        $newStmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $newCustomers = $newStmt->fetchColumn();

        // Returning = customers who made orders in period but were created before period
        $returningCustomersSql = "SELECT COUNT(DISTINCT o.customer_id) as returning_customers
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE o.created_at BETWEEN :start AND :end 
            AND c.created_at < :period_start
            AND o.status != 'cancelled'";
        
        $returnStmt = $pdo->prepare($returningCustomersSql);
        $returnStmt->execute([
            ':start' => "$start_date 00:00:00", 
            ':end' => "$end_date 23:59:59",
            ':period_start' => "$start_date 00:00:00"
        ]);
        $returningCustomers = $returnStmt->fetchColumn();

        // 2. Average CLV (Customer Lifetime Value)
        $clvSql = "SELECT AVG(total_lifetime_spent) as avg_clv, 
            SUM(total_lifetime_spent) as total_clv
            FROM customers 
            WHERE total_lifetime_spent > 0";
        $clvStmt = $pdo->query($clvSql);
        $clvData = $clvStmt->fetch(PDO::FETCH_ASSOC);

        // 3. Tier Distribution (Pie Chart)
        $tierSql = "SELECT 
            mt.tier_display as tier_name,
            mt.color_hex,
            COUNT(c.id) as customer_count
            FROM customers c
            LEFT JOIN membership_tiers mt ON c.membership_tier = mt.tier_key
            GROUP BY c.membership_tier, mt.tier_display, mt.color_hex
            ORDER BY mt.min_spent ASC";
        $tierStmt = $pdo->query($tierSql);
        $tierChart = $tierStmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Customer Growth Over Time (Line Chart)
        $growthSql = "SELECT 
            DATE(created_at) as date,
            COUNT(id) as new_customers
            FROM customers
            WHERE created_at BETWEEN :start AND :end
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)";
        $growthStmt = $pdo->prepare($growthSql);
        $growthStmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $growthChart = $growthStmt->fetchAll(PDO::FETCH_ASSOC);

        // 5. Total Active Customers
        $totalCustomersSql = "SELECT COUNT(id) as total FROM customers";
        $totalCustomers = $pdo->query($totalCustomersSql)->fetchColumn();

        echo json_encode([
            'summary' => [
                'new_customers' => (int)$newCustomers,
                'returning_customers' => (int)$returningCustomers,
                'avg_clv' => formatCurrency($clvData['avg_clv'] ?? 0),
                'total_clv' => formatCurrency($clvData['total_clv'] ?? 0),
                'total_customers' => (int)$totalCustomers
            ],
            'tier_chart' => $tierChart,
            'growth_chart' => $growthChart
        ]);


    } elseif ($type === 'promotions') {
        // --- Promotion Analytics ---

        // 1. Total Discount Cost (from orders in period)
        $discountSql = "SELECT SUM(discount_amount) as total_discount
            FROM orders
            WHERE created_at BETWEEN :start AND :end
            AND status != 'cancelled'";
        $discountStmt = $pdo->prepare($discountSql);
        $discountStmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $totalDiscount = $discountStmt->fetchColumn() ?? 0;

        // 2. Orders with promotions vs without
        $withPromoSql = "SELECT COUNT(*) as count FROM orders 
            WHERE created_at BETWEEN :start AND :end 
            AND discount_amount > 0 
            AND status != 'cancelled'";
        $withPromoStmt = $pdo->prepare($withPromoSql);
        $withPromoStmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $ordersWithPromo = $withPromoStmt->fetchColumn();

        $withoutPromoSql = "SELECT COUNT(*) as count FROM orders 
            WHERE created_at BETWEEN :start AND :end 
            AND discount_amount = 0 
            AND status != 'cancelled'";
        $withoutPromoStmt = $pdo->prepare($withoutPromoSql);
        $withoutPromoStmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $ordersWithoutPromo = $withoutPromoStmt->fetchColumn();

        // 3. Revenue Impact (Total revenue from orders with promotions)
        $revenueImpactSql = "SELECT SUM(total_amount) as revenue
            FROM orders
            WHERE created_at BETWEEN :start AND :end
            AND discount_amount > 0
            AND status != 'cancelled'";
        $revenueImpactStmt = $pdo->prepare($revenueImpactSql);
        $revenueImpactStmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $revenueWithPromo = $revenueImpactStmt->fetchColumn() ?? 0;

        // 4. Active Promotions Count
        $activePromoSql = "SELECT COUNT(*) as count FROM promotions 
            WHERE status = 'active' 
            AND start_date <= CURDATE() 
            AND end_date >= CURDATE()";
        $activePromos = $pdo->query($activePromoSql)->fetchColumn();

        // 5. Promotion Usage Chart (Orders with promo over time)
        $usageChartSql = "SELECT 
            DATE(created_at) as date,
            COUNT(*) as orders_with_promo
            FROM orders
            WHERE created_at BETWEEN :start AND :end
            AND discount_amount > 0
            AND status != 'cancelled'
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at)";
        $usageChartStmt = $pdo->prepare($usageChartSql);
        $usageChartStmt->execute([':start' => "$start_date 00:00:00", ':end' => "$end_date 23:59:59"]);
        $usageChart = $usageChartStmt->fetchAll(PDO::FETCH_ASSOC);

        // 6. Top Promotions by Usage (if we had promotion tracking in orders)
        // For now, we'll show active promotions
        $topPromoSql = "SELECT 
            promotion_code,
            promotion_name,
            discount_type,
            discount_value,
            status
            FROM promotions
            WHERE status = 'active'
            ORDER BY created_at DESC
            LIMIT 5";
        $topPromos = $pdo->query($topPromoSql)->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'summary' => [
                'total_discount' => formatCurrency($totalDiscount),
                'orders_with_promo' => (int)$ordersWithPromo,
                'orders_without_promo' => (int)$ordersWithoutPromo,
                'revenue_with_promo' => formatCurrency($revenueWithPromo),
                'active_promotions' => (int)$activePromos
            ],
            'usage_chart' => $usageChart,
            'top_promotions' => $topPromos
        ]);

    } else {
        echo json_encode(['message' => 'Invalid report type or not implemented']);
    }



} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
