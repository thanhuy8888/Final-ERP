<?php
/**
 * Sale Stats API
 * Endpoints for sales personnel performance statistics
 */

require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check sale or admin auth
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['sale', 'admin'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized - Sales access required']);
    exit;
}

$saleId = $_SESSION['user_id'];
$isAdmin = $_SESSION['role'] === 'admin';

// For admin viewing another salesperson's stats
if ($isAdmin && isset($_GET['sale_id'])) {
    $saleId = intval($_GET['sale_id']);
}

try {
    $stats = [];
    
    // Date ranges
    $today = date('Y-m-d');
    $startOfWeek = date('Y-m-d', strtotime('monday this week'));
    $startOfMonth = date('Y-m-01');
    $startOfYear = date('Y-01-01');
    
    // 1. Total orders and revenue (all time)
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COALESCE(AVG(total_amount), 0) as avg_order_value
        FROM orders 
        WHERE sale_id = ?
    ");
    $stmt->execute([$saleId]);
    $allTime = $stmt->fetch(PDO::FETCH_ASSOC);
    $stats['all_time'] = $allTime;
    
    // 2. Today's stats
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as orders,
            COALESCE(SUM(total_amount), 0) as revenue
        FROM orders 
        WHERE sale_id = ? AND DATE(created_at) = ?
    ");
    $stmt->execute([$saleId, $today]);
    $stats['today'] = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 3. This week's stats
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as orders,
            COALESCE(SUM(total_amount), 0) as revenue
        FROM orders 
        WHERE sale_id = ? AND DATE(created_at) >= ?
    ");
    $stmt->execute([$saleId, $startOfWeek]);
    $stats['this_week'] = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 4. This month's stats
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as orders,
            COALESCE(SUM(total_amount), 0) as revenue
        FROM orders 
        WHERE sale_id = ? AND DATE(created_at) >= ?
    ");
    $stmt->execute([$saleId, $startOfMonth]);
    $stats['this_month'] = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 5. Orders by status
    $stmt = $pdo->prepare("
        SELECT 
            status,
            COUNT(*) as count,
            COALESCE(SUM(total_amount), 0) as revenue
        FROM orders 
        WHERE sale_id = ?
        GROUP BY status
    ");
    $stmt->execute([$saleId]);
    $stats['by_status'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 6. Daily revenue for last 7 days (for chart)
    $stmt = $pdo->prepare("
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as orders,
            COALESCE(SUM(total_amount), 0) as revenue
        FROM orders 
        WHERE sale_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
    ");
    $stmt->execute([$saleId]);
    $stats['daily_last_7_days'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 7. Monthly revenue for last 6 months (for chart)
    $stmt = $pdo->prepare("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as orders,
            COALESCE(SUM(total_amount), 0) as revenue
        FROM orders 
        WHERE sale_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
    ");
    $stmt->execute([$saleId]);
    $stats['monthly_last_6_months'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 8. Top products sold
    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.name,
            p.image,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.quantity * oi.price) as total_revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.sale_id = ?
        GROUP BY p.id
        ORDER BY total_quantity DESC
        LIMIT 5
    ");
    $stmt->execute([$saleId]);
    $stats['top_products'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 9. Customer stats
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total_customers
        FROM customers 
        WHERE created_by = ?
    ");
    $stmt->execute([$saleId]);
    $stats['customers'] = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // 10. Recent orders
    $stmt = $pdo->prepare("
        SELECT 
            o.id, 
            o.total_amount, 
            o.status, 
            o.created_at,
            c.full_name as customer_name
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        WHERE o.sale_id = ?
        ORDER BY o.created_at DESC
        LIMIT 5
    ");
    $stmt->execute([$saleId]);
    $stats['recent_orders'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 11. Sales target (if exists)
    $stmt = $pdo->prepare("
        SELECT * FROM sales_targets 
        WHERE sale_id = ? AND target_month = DATE_FORMAT(NOW(), '%Y-%m-01')
    ");
    $stmt->execute([$saleId]);
    $target = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($target) {
        $target['progress_percent'] = $target['target_amount'] > 0 
            ? round(($stats['this_month']['revenue'] / $target['target_amount']) * 100, 1)
            : 0;
        $stats['target'] = $target;
    }
    
    echo json_encode($stats);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
