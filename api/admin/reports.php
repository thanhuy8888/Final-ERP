<?php
/**
 * Revenue Reports API
 * Endpoints for generating revenue reports with export functionality
 */

require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check admin auth
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

$action = $_GET['action'] ?? 'summary';
$period = $_GET['period'] ?? 'daily'; // daily, weekly, monthly, yearly
$startDate = $_GET['start_date'] ?? date('Y-m-01'); // Default to this month start
$endDate = $_GET['end_date'] ?? date('Y-m-d'); // Default to today
$format = $_GET['format'] ?? 'json'; // json, csv

try {
    switch ($action) {
        case 'summary':
            $data = getRevenueSummary($pdo, $startDate, $endDate);
            break;
            
        case 'detailed':
            $data = getDetailedReport($pdo, $period, $startDate, $endDate);
            break;
            
        case 'by_product':
            $data = getRevenueByProduct($pdo, $startDate, $endDate);
            break;
            
        case 'by_salesperson':
            $data = getRevenueBySalesperson($pdo, $startDate, $endDate);
            break;
            
        case 'by_status':
            $data = getRevenueByStatus($pdo, $startDate, $endDate);
            break;
            
        case 'trends':
            $data = getRevenueTrends($pdo, $period, 12); // Last 12 periods
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            exit;
    }
    
    if ($format === 'csv') {
        outputCSV($data, $action);
    } else {
        echo json_encode($data);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Get revenue summary for date range
 */
function getRevenueSummary($pdo, $startDate, $endDate) {
    // Total orders and revenue
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COALESCE(AVG(total_amount), 0) as avg_order_value,
            COUNT(DISTINCT user_id) as unique_customers
        FROM orders 
        WHERE DATE(created_at) BETWEEN ? AND ?
        AND status != 'cancelled'
    ");
    $stmt->execute([$startDate, $endDate]);
    $summary = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Comparison with previous period
    $daysDiff = (strtotime($endDate) - strtotime($startDate)) / 86400 + 1;
    $prevStart = date('Y-m-d', strtotime($startDate . " -$daysDiff days"));
    $prevEnd = date('Y-m-d', strtotime($startDate . " -1 day"));
    
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_revenue
        FROM orders 
        WHERE DATE(created_at) BETWEEN ? AND ?
        AND status != 'cancelled'
    ");
    $stmt->execute([$prevStart, $prevEnd]);
    $prevPeriod = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Calculate growth
    $revenueGrowth = $prevPeriod['total_revenue'] > 0 
        ? (($summary['total_revenue'] - $prevPeriod['total_revenue']) / $prevPeriod['total_revenue']) * 100 
        : 0;
    
    $ordersGrowth = $prevPeriod['total_orders'] > 0 
        ? (($summary['total_orders'] - $prevPeriod['total_orders']) / $prevPeriod['total_orders']) * 100 
        : 0;
    
    return [
        'period' => ['start' => $startDate, 'end' => $endDate],
        'current' => $summary,
        'previous' => $prevPeriod,
        'growth' => [
            'revenue_percent' => round($revenueGrowth, 1),
            'orders_percent' => round($ordersGrowth, 1)
        ]
    ];
}

/**
 * Get detailed report grouped by period
 */
function getDetailedReport($pdo, $period, $startDate, $endDate) {
    $groupFormat = match($period) {
        'daily' => '%Y-%m-%d',
        'weekly' => '%Y-%u',
        'monthly' => '%Y-%m',
        'yearly' => '%Y',
        default => '%Y-%m-%d'
    };
    
    $labelFormat = match($period) {
        'daily' => '%d/%m',
        'weekly' => 'Week %u',
        'monthly' => '%m/%Y',
        'yearly' => '%Y',
        default => '%d/%m'
    };
    
    $stmt = $pdo->prepare("
        SELECT 
            DATE_FORMAT(created_at, ?) as period_key,
            DATE_FORMAT(created_at, ?) as period_label,
            COUNT(*) as orders,
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(DISTINCT user_id) as customers
        FROM orders 
        WHERE DATE(created_at) BETWEEN ? AND ?
        AND status != 'cancelled'
        GROUP BY period_key
        ORDER BY period_key
    ");
    $stmt->execute([$groupFormat, $labelFormat, $startDate, $endDate]);
    
    return [
        'period_type' => $period,
        'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ];
}

/**
 * Get revenue by product
 */
function getRevenueByProduct($pdo, $startDate, $endDate) {
    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.name,
            p.image,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.quantity * oi.price) as total_revenue,
            COUNT(DISTINCT o.id) as order_count
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE DATE(o.created_at) BETWEEN ? AND ?
        AND o.status != 'cancelled'
        GROUP BY p.id
        ORDER BY total_revenue DESC
        LIMIT 50
    ");
    $stmt->execute([$startDate, $endDate]);
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get revenue by salesperson
 */
function getRevenueBySalesperson($pdo, $startDate, $endDate) {
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.username,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_revenue,
            COALESCE(AVG(o.total_amount), 0) as avg_order_value
        FROM orders o
        JOIN users u ON o.sale_id = u.id
        WHERE DATE(o.created_at) BETWEEN ? AND ?
        AND o.status != 'cancelled'
        GROUP BY u.id
        ORDER BY total_revenue DESC
    ");
    $stmt->execute([$startDate, $endDate]);
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get revenue by order status
 */
function getRevenueByStatus($pdo, $startDate, $endDate) {
    $stmt = $pdo->prepare("
        SELECT 
            status,
            COUNT(*) as order_count,
            COALESCE(SUM(total_amount), 0) as total_amount
        FROM orders 
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY status
        ORDER BY order_count DESC
    ");
    $stmt->execute([$startDate, $endDate]);
    
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get revenue trends for last N periods
 */
function getRevenueTrends($pdo, $period, $count) {
    $interval = match($period) {
        'daily' => 'DAY',
        'weekly' => 'WEEK',
        'monthly' => 'MONTH',
        'yearly' => 'YEAR',
        default => 'DAY'
    };
    
    $groupFormat = match($period) {
        'daily' => '%Y-%m-%d',
        'weekly' => '%Y-%u',
        'monthly' => '%Y-%m',
        'yearly' => '%Y',
        default => '%Y-%m-%d'
    };
    
    $stmt = $pdo->prepare("
        SELECT 
            DATE_FORMAT(created_at, ?) as period_key,
            COUNT(*) as orders,
            COALESCE(SUM(total_amount), 0) as revenue
        FROM orders 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? $interval)
        AND status != 'cancelled'
        GROUP BY period_key
        ORDER BY period_key
    ");
    $stmt->execute([$groupFormat, $count]);
    
    return [
        'period_type' => $period,
        'count' => $count,
        'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ];
}

/**
 * Output data as CSV for Excel compatibility
 */
function outputCSV($data, $filename) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '_' . date('Y-m-d') . '.csv"');
    
    $output = fopen('php://output', 'w');
    
    // Add BOM for Excel UTF-8 compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // Handle different data structures
    if (isset($data['data'])) {
        $rows = $data['data'];
    } elseif (isset($data['current'])) {
        // Summary format
        $rows = [
            ['Metric', 'Current Period', 'Previous Period', 'Growth %'],
            ['Total Orders', $data['current']['total_orders'], $data['previous']['total_orders'], $data['growth']['orders_percent']],
            ['Total Revenue', $data['current']['total_revenue'], $data['previous']['total_revenue'], $data['growth']['revenue_percent']],
            ['Avg Order Value', $data['current']['avg_order_value'], '-', '-'],
            ['Unique Customers', $data['current']['unique_customers'], '-', '-'],
        ];
        foreach ($rows as $row) {
            fputcsv($output, $row);
        }
        fclose($output);
        exit;
    } else {
        $rows = $data;
    }
    
    if (!empty($rows)) {
        // Write header
        fputcsv($output, array_keys($rows[0]));
        
        // Write data
        foreach ($rows as $row) {
            fputcsv($output, $row);
        }
    }
    
    fclose($output);
    exit;
}
?>
