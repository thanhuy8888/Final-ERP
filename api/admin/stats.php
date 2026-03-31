<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';
require_once '../../includes/file_cache.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check admin auth
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Try cache first (2 minute TTL for dashboard stats)
// TEMPORARILY DISABLED FOR DEBUGGING
/*
$cacheKey = 'admin_stats_v2';
$cachedResult = $cache->get($cacheKey);
if ($cachedResult !== null) {
    header('X-Cache: HIT');
    echo json_encode($cachedResult);
    exit;
}
*/

header('X-Cache: MISS');

try {
    // Date Filter Logic
    $range = $_GET['range'] ?? '7days';
    $startDate = 'DATE_SUB(CURDATE(), INTERVAL 7 DAY)'; // Default
    
    if ($range === 'today') {
        $startDate = 'CURDATE()';
    } elseif ($range === '30days') {
        $startDate = 'DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    }

    // Basic stats (ALL TIME - Assets)
    $stmt = $pdo->query("SELECT COUNT(*) FROM products");
    $product_count = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'");
    $customer_count = $stmt->fetchColumn();

    // Inventory Alert (Low Stock < 10)
    // Inventory Alert (Any store item < 10)
    $stmt = $pdo->query("
        SELECT COUNT(*) 
        FROM inventory 
        WHERE quantity_on_hand < 10
    ");
    $inventory_alert_count = $stmt->fetchColumn() ?: 0;

    // High Stock (Stock > 100 - Example Threshold)
    $stmt = $pdo->query("
        SELECT COUNT(*) as high_stock_count
        FROM (
            SELECT p.id
            FROM products p
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE p.is_active = 1
            GROUP BY p.id
            HAVING COALESCE(SUM(i.quantity_on_hand), 0) > 100
        ) AS high_stock_products
    ");
    $high_stock_count = $stmt->fetchColumn() ?: 0;

    // --- FILTERED METRICS ---

    // Total Orders in Range
    $stmt = $pdo->query("SELECT COUNT(*) FROM orders WHERE created_at >= $startDate");
    $order_count = $stmt->fetchColumn();

    // Total Revenue in Range
    $stmt = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE status = 'completed' AND created_at >= $startDate");
    $revenue = $stmt->fetchColumn() ?: 0;

    // Average Order Value (AOV) in Range
    $stmt = $pdo->query("
        SELECT 
            CASE 
                WHEN COUNT(*) > 0 THEN SUM(total_amount) / COUNT(*)
                ELSE 0 
            END as aov
        FROM orders 
        WHERE status != 'cancelled' AND created_at >= $startDate
    ");
    $avg_order_value = $stmt->fetchColumn() ?: 0;

    // Return Rate in Range
    $stmt = $pdo->query("
        SELECT 
            CASE 
                WHEN COUNT(*) > 0 THEN (SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*)) * 100
                ELSE 0 
            END as return_rate
        FROM orders
        WHERE created_at >= $startDate
    ");
    $return_rate = $stmt->fetchColumn() ?: 0;

    // Daily revenue (Chart) - WITH ORDER COUNT
    $stmt = $pdo->query("
        SELECT 
            DATE(created_at) as date, 
            SUM(total_amount) as revenue,
            COUNT(*) as order_count
        FROM orders 
        WHERE status = 'completed' AND created_at >= $startDate
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $daily_revenue = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Order status breakdown
    $stmt = $pdo->query("
        SELECT status, COUNT(*) as count 
        FROM orders 
        WHERE created_at >= $startDate
        GROUP BY status
    ");
    $order_status = $stmt->fetchAll();

    // Top 5 selling products
    $stmt = $pdo->query("
        SELECT p.name, SUM(oi.quantity) as total_sold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status != 'cancelled' AND o.created_at >= $startDate
        GROUP BY oi.product_id, p.name
        ORDER BY total_sold DESC
        LIMIT 5
    ");
    $top_products = $stmt->fetchAll();

    // Recent 10 orders (Always latest, but maybe filtered? Let's keep recent global or filtered? Filtered makes sense for context)
    $stmt = $pdo->query("
        SELECT o.id, o.total_amount, o.status, o.created_at, u.full_name as customer_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.created_at >= $startDate
        ORDER BY o.created_at DESC
        LIMIT 10
    ");
    $recent_orders = $stmt->fetchAll();

    // Monthly revenue (Keep as 6 months fixed trend, unrelated to short filter? Or strict? Usually trends show broader context.)
    // Let's keep monthly revenue as 6 months context regardless of filter to show "Trend".
    $stmt = $pdo->query("
        SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as revenue
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ");
    $monthly_revenue = $stmt->fetchAll();

    // Low stock alert (Snapshot - always same)
    $stmt = $pdo->query("
        SELECT 
            p.name, 
            SUM(i.quantity_on_hand) as stock_quantity,
            c.name as category 
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE p.is_active = 1
        GROUP BY p.id, p.name, c.name
        HAVING SUM(i.quantity_on_hand) < 10
        ORDER BY stock_quantity ASC 
        LIMIT 5
    ");
    $low_stock = $stmt->fetchAll();

    // Revenue by Category (Filtered)
    $stmt = $pdo->query("
        SELECT c.name as category, SUM(oi.quantity * oi.price) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE o.status != 'cancelled' AND o.created_at >= $startDate
        GROUP BY c.id, c.name
    ");
    $revenue_by_category = $stmt->fetchAll();

    // Revenue by Store (Filtered)
    $stmt = $pdo->query("
        SELECT 
            s.store_name,
            COALESCE(SUM(o.total_amount), 0) as revenue
        FROM stores s
        LEFT JOIN orders o ON s.store_id = o.store_id AND o.status = 'completed' AND o.created_at >= $startDate
        GROUP BY s.store_id, s.store_name
        ORDER BY revenue DESC
    ");
    $revenue_by_store = $stmt->fetchAll();

    $result = [
        'product_count' => intval($product_count),
        'customer_count' => intval($customer_count),
        'order_count' => intval($order_count),
        'revenue' => floatval($revenue),
        'avg_order_value' => round(floatval($avg_order_value), 2),
        'return_rate' => round(floatval($return_rate), 2),
        'inventory_alert_count' => intval($inventory_alert_count),
        'high_stock_count' => intval($high_stock_count),
        'daily_revenue' => $daily_revenue,
        'order_status' => $order_status,
        'revenue_by_category' => $revenue_by_category,
        'top_products' => $top_products,
        'low_stock_items' => $low_stock,
        'recent_orders' => $recent_orders,
        'monthly_revenue' => $monthly_revenue,
        'revenue_by_store' => $revenue_by_store
    ];
    
    // Store in cache for 2 minutes (120 seconds)
    // $cache->set($cacheKey, $result, 120);
    
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
