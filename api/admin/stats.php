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
$cacheKey = 'admin_stats';
$cachedResult = $cache->get($cacheKey);
if ($cachedResult !== null) {
    header('X-Cache: HIT');
    echo json_encode($cachedResult);
    exit;
}

header('X-Cache: MISS');

try {
    // Basic stats
    $stmt = $pdo->query("SELECT COUNT(*) FROM products");
    $product_count = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM orders");
    $order_count = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'customer'");
    $customer_count = $stmt->fetchColumn();

    $stmt = $pdo->query("SELECT SUM(total_amount) FROM orders WHERE status = 'completed'");
    $revenue = $stmt->fetchColumn() ?: 0;

    // Daily revenue (last 7 days)
    $stmt = $pdo->query("
        SELECT DATE(created_at) as date, SUM(total_amount) as revenue 
        FROM orders 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    ");
    $daily_revenue = $stmt->fetchAll();

    // Order status breakdown
    $stmt = $pdo->query("
        SELECT status, COUNT(*) as count 
        FROM orders 
        GROUP BY status
    ");
    $order_status = $stmt->fetchAll();

    // Top 5 selling products
    $stmt = $pdo->query("
        SELECT p.name, SUM(oi.quantity) as total_sold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status != 'cancelled'
        GROUP BY oi.product_id, p.name
        ORDER BY total_sold DESC
        LIMIT 5
    ");
    $top_products = $stmt->fetchAll();

    // Recent 10 orders
    $stmt = $pdo->query("
        SELECT o.id, o.total_amount, o.status, o.created_at, u.full_name as customer_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 10
    ");
    $recent_orders = $stmt->fetchAll();

    // Monthly revenue (last 6 months)
    $stmt = $pdo->query("
        SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as revenue
        FROM orders
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ");
    $monthly_revenue = $stmt->fetchAll();

    $result = [
        'product_count' => $product_count,
        'order_count' => $order_count,
        'customer_count' => $customer_count,
        'revenue' => $revenue,
        'daily_revenue' => $daily_revenue,
        'order_status' => $order_status,
        'top_products' => $top_products,
        'recent_orders' => $recent_orders,
        'monthly_revenue' => $monthly_revenue
    ];
    
    // Store in cache for 2 minutes (120 seconds)
    $cache->set($cacheKey, $result, 120);
    
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
