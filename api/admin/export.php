<?php
/**
 * Export API - PDF and CSV export for orders and reports
 */
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';
require_once '../../vendor/autoload.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check admin auth
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$type = $_GET['type'] ?? 'orders'; // orders, products, customers
$format = $_GET['format'] ?? 'pdf'; // pdf, csv
$dateFrom = $_GET['from'] ?? date('Y-m-01');
$dateTo = $_GET['to'] ?? date('Y-m-d');

try {
    switch ($type) {
        case 'orders':
            exportOrders($format, $dateFrom, $dateTo);
            break;
        case 'products':
            exportProducts($format);
            break;
        case 'customers':
            exportCustomers($format);
            break;
        default:
            throw new Exception('Invalid export type');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function exportOrders($format, $dateFrom, $dateTo) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT o.id, o.user_id, u.username, o.total_amount, o.status, o.created_at
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE DATE(o.created_at) BETWEEN ? AND ?
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$dateFrom, $dateTo]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($format === 'csv') {
        exportCSV('orders', $orders, ['ID', 'User ID', 'Username', 'Total', 'Status', 'Date']);
    } else {
        exportPDF('orders', $orders, "Báo cáo đơn hàng ($dateFrom - $dateTo)");
    }
}

function exportProducts($format) {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT p.id, p.sku, p.name, c.name as category, p.price, p.material, p.is_active
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id
    ");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($format === 'csv') {
        exportCSV('products', $products, ['ID', 'SKU', 'Name', 'Category', 'Price', 'Material', 'Active']);
    } else {
        exportPDF('products', $products, 'Danh sách sản phẩm');
    }
}

function exportCustomers($format) {
    global $pdo;
    
    $stmt = $pdo->query("
        SELECT u.id, u.username, u.email, u.role, u.created_at,
               COUNT(o.id) as order_count, COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.role = 'customer'
        GROUP BY u.id
        ORDER BY total_spent DESC
    ");
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($format === 'csv') {
        exportCSV('customers', $customers, ['ID', 'Username', 'Email', 'Role', 'Created', 'Orders', 'Total Spent']);
    } else {
        exportPDF('customers', $customers, 'Danh sách khách hàng');
    }
}

function exportCSV($filename, $data, $headers) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '_' . date('Y-m-d') . '.csv"');
    
    $output = fopen('php://output', 'w');
    
    // BOM for UTF-8
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // Headers
    fputcsv($output, $headers);
    
    // Data
    foreach ($data as $row) {
        fputcsv($output, array_values($row));
    }
    
    fclose($output);
    exit;
}

function exportPDF($type, $data, $title) {
    $pdf = new TCPDF('L', 'mm', 'A4', true, 'UTF-8');
    
    $pdf->SetCreator('CANIFA ERP');
    $pdf->SetAuthor('CANIFA');
    $pdf->SetTitle($title);
    
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    
    $pdf->SetMargins(10, 10, 10);
    $pdf->AddPage();
    
    // Title
    $pdf->SetFont('dejavusans', 'B', 16);
    $pdf->Cell(0, 10, $title, 0, 1, 'C');
    $pdf->Ln(5);
    
    // Table
    $pdf->SetFont('dejavusans', '', 9);
    
    if (!empty($data)) {
        $headers = array_keys($data[0]);
        $colWidth = (277 - 20) / count($headers);
        
        // Table headers
        $pdf->SetFillColor(227, 30, 36);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('dejavusans', 'B', 9);
        
        foreach ($headers as $header) {
            $pdf->Cell($colWidth, 8, ucfirst($header), 1, 0, 'C', true);
        }
        $pdf->Ln();
        
        // Table data
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetFont('dejavusans', '', 8);
        $fill = false;
        
        foreach ($data as $row) {
            if ($fill) {
                $pdf->SetFillColor(245, 245, 245);
            } else {
                $pdf->SetFillColor(255, 255, 255);
            }
            
            foreach ($row as $cell) {
                $value = is_numeric($cell) && $cell > 1000 ? number_format($cell, 0, ',', '.') : $cell;
                $pdf->Cell($colWidth, 7, $value, 1, 0, 'L', true);
            }
            $pdf->Ln();
            $fill = !$fill;
        }
    } else {
        $pdf->Cell(0, 10, 'Không có dữ liệu', 0, 1, 'C');
    }
    
    // Footer
    $pdf->Ln(10);
    $pdf->SetFont('dejavusans', 'I', 8);
    $pdf->Cell(0, 5, 'Xuất lúc: ' . date('d/m/Y H:i:s'), 0, 1, 'R');
    
    $pdf->Output($type . '_' . date('Y-m-d') . '.pdf', 'D');
    exit;
}
?>
