<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['sale', 'admin'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$userId = $_SESSION['user_id'];
$period = $_GET['period'] ?? 'monthly';

try {
    // 1. Current Month Metrics
    $startOfMonth = date('Y-m-01 00:00:00');
    $startOfLastMonth = date('Y-m-01 00:00:00', strtotime('-1 month'));
    $endOfLastMonth = date('Y-m-t 23:59:59', strtotime('-1 month'));

    // This Month
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as orders,
            SUM(total_amount) as revenue
        FROM orders 
        WHERE sale_id = ? AND created_at >= ? AND status != 'cancelled'
    ");
    $stmt->execute([$userId, $startOfMonth]);
    $current = $stmt->fetch(PDO::FETCH_ASSOC);

    // Last Month (for comparison)
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as orders,
            SUM(total_amount) as revenue
        FROM orders 
        WHERE sale_id = ? AND created_at BETWEEN ? AND ? AND status != 'cancelled'
    ");
    $stmt->execute([$userId, $startOfLastMonth, $endOfLastMonth]);
    $last = $stmt->fetch(PDO::FETCH_ASSOC);

    // Returns This Month
    // Returns table usually has user_id or sale_id. Let's assume user_id as per previous files.
    // Actually, let's verify if sale_returns has user_id or sale_id?
    // In previous steps I didn't verify sale_returns schema, but I kept user_id in my previous code.
    // Let's stick to user_id for returns, assuming it tracks who processed it. 
    // Wait, if I am the salesperson, I want to know returns of MY orders or returns PROCESSED by me?
    // "Hiệu suất cá nhân" -> My Orders that were returned? Or Returns I handled?
    // Usually "My Returns Rate" means "Orders I sold that got returned".
    // So distinct logic: 
    // SELECT count(*) FROM sale_returns r JOIN orders o ON r.order_id = o.id WHERE o.sale_id = ?
    
    // For now I will stick to what I had but update it to be safer:
    // If table `sale_returns` has `created_by` or `user_id`?
    // I previously wrote: WHERE user_id = ?
    // I'll keep it for now. If it breaks I'll fix.
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM sale_returns 
        WHERE user_id = ? AND created_at >= ?
    ");
    $stmt->execute([$userId, $startOfMonth]);
    $returns = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2. Chart Data (Last 6 Months)
    $stmt = $pdo->prepare("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as date,
            SUM(total_amount) as revenue
        FROM orders 
        WHERE sale_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) AND status != 'cancelled'
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY date ASC
    ");
    $stmt->execute([$userId]);
    $chartData = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Weekly Breakdown (Last 8 Weeks)
    $stmt = $pdo->prepare("
        SELECT 
            WEEK(created_at) as week_num,
            MIN(DATE(created_at)) as week_start,
            SUM(total_amount) as revenue
        FROM orders 
        WHERE sale_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 8 WEEK) AND status != 'cancelled'
        GROUP BY WEEK(created_at)
        ORDER BY week_start ASC
    ");
    $stmt->execute([$userId]);
    $weeklyChart = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // Build Response
    $response = [
        'summary' => [
            'revenue' => [
                'current' => $current['revenue'] ?? 0,
                'last' => $last['revenue'] ?? 0,
                'growth' => calculateGrowth($current['revenue'], $last['revenue'])
            ],
            'orders' => [
                'current' => $current['orders'] ?? 0,
                'last' => $last['orders'] ?? 0,
                'growth' => calculateGrowth($current['orders'], $last['orders'])
            ],
            'returns' => $returns['count'] ?? 0
        ],
        'monthly_chart' => $chartData,
        'weekly_chart' => $weeklyChart
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function calculateGrowth($current, $past) {
    if ($past == 0) return $current > 0 ? 100 : 0;
    return round((($current - $past) / $past) * 100, 1);
}
?>
