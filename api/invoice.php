<?php
require_once '../includes/api_header.php';
require_once '../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$order_id = isset($_GET['order_id']) ? intval($_GET['order_id']) : 0;
$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'] ?? 'customer';

if (!$order_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID required']);
    exit;
}

try {
    // Get order details
    $sql = "SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?";
    
    // If not admin, only allow viewing own orders
    if ($role !== 'admin') {
        $sql .= " AND o.user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$order_id, $user_id]);
    } else {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$order_id]);
    }
    
    $order = $stmt->fetch();
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit;
    }

    // Get order items
    $stmt = $pdo->prepare("
        SELECT oi.*, p.name as product_name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
    ");
    $stmt->execute([$order_id]);
    $items = $stmt->fetchAll();

    // Format order date
    $orderDate = new DateTime($order['created_at']);
    $formattedDate = $orderDate->format('d/m/Y H:i');

    // Return HTML invoice that can be printed as PDF
    header('Content-Type: text/html; charset=utf-8');
    
    echo '<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hóa đơn #' . $order_id . ' - CANIFA</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 14px;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #E31E24;
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #E31E24;
            letter-spacing: 2px;
        }
        
        .logo-subtitle {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        
        .invoice-info {
            text-align: right;
        }
        
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #1a1a2e;
            margin-bottom: 8px;
        }
        
        .invoice-number {
            font-size: 16px;
            color: #E31E24;
            margin-bottom: 4px;
        }
        
        .invoice-date {
            color: #666;
        }
        
        .details-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 40px;
        }
        
        .details-box {
            width: 48%;
        }
        
        .details-box h3 {
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 12px;
            letter-spacing: 1px;
        }
        
        .details-box p {
            margin-bottom: 6px;
            line-height: 1.5;
        }
        
        .details-box strong {
            color: #1a1a2e;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        .items-table th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            border-bottom: 2px solid #ddd;
        }
        
        .items-table td {
            padding: 16px 12px;
            border-bottom: 1px solid #eee;
        }
        
        .items-table .product-name {
            font-weight: 500;
            color: #1a1a2e;
        }
        
        .items-table .product-variant {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        
        .items-table .text-right {
            text-align: right;
        }
        
        .items-table .text-center {
            text-align: center;
        }
        
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
        }
        
        .totals-box {
            width: 300px;
        }
        
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        
        .totals-row.total {
            border-top: 2px solid #333;
            padding-top: 12px;
            margin-top: 8px;
            font-size: 18px;
            font-weight: bold;
            color: #E31E24;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status-pending { background: #fff3cd; color: #856404; }
        .status-processing { background: #cce5ff; color: #004085; }
        .status-completed { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        
        .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 13px;
        }
        
        .footer p {
            margin-bottom: 5px;
        }
        
        .print-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #E31E24;
            color: white;
            border: none;
            padding: 16px 32px;
            font-size: 16px;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(227, 30, 36, 0.4);
            transition: all 0.3s;
        }
        
        .print-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 30px rgba(227, 30, 36, 0.5);
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .invoice-container {
                box-shadow: none;
                padding: 20px;
            }
            .print-btn {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="brand">
                <div class="logo">CANIFA</div>
                <div class="logo-subtitle">Thời trang cho gia đình Việt</div>
            </div>
            <div class="invoice-info">
                <div class="invoice-title">HÓA ĐƠN</div>
                <div class="invoice-number">#' . str_pad($order_id, 6, '0', STR_PAD_LEFT) . '</div>
                <div class="invoice-date">' . $formattedDate . '</div>
            </div>
        </div>
        
        <div class="details-section">
            <div class="details-box">
                <h3>Thông tin khách hàng</h3>
                <p><strong>' . htmlspecialchars($order['customer_name'] ?? 'N/A') . '</strong></p>
                <p>' . htmlspecialchars($order['customer_email'] ?? '') . '</p>
                <p>' . htmlspecialchars($order['customer_phone'] ?? '') . '</p>
            </div>
            <div class="details-box">
                <h3>Địa chỉ giao hàng</h3>
                <p>' . nl2br(htmlspecialchars($order['shipping_address'] ?? 'N/A')) . '</p>
                <p style="margin-top: 12px;">
                    <strong>Trạng thái:</strong>
                    <span class="status-badge status-' . $order['status'] . '">' . ucfirst($order['status']) . '</span>
                </p>
            </div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 50%">Sản phẩm</th>
                    <th class="text-center">Đơn giá</th>
                    <th class="text-center">SL</th>
                    <th class="text-right">Thành tiền</th>
                </tr>
            </thead>
            <tbody>';
    
    $subtotal = 0;
    foreach ($items as $item) {
        $lineTotal = $item['price'] * $item['quantity'];
        $subtotal += $lineTotal;
        
        echo '
                <tr>
                    <td>
                        <div class="product-name">' . htmlspecialchars($item['product_name']) . '</div>';
        
        if (!empty($item['size']) || !empty($item['color'])) {
            echo '<div class="product-variant">';
            if (!empty($item['size'])) echo 'Size: ' . htmlspecialchars($item['size']);
            if (!empty($item['size']) && !empty($item['color'])) echo ' | ';
            if (!empty($item['color'])) echo 'Màu: ' . htmlspecialchars($item['color']);
            echo '</div>';
        }
        
        echo '
                    </td>
                    <td class="text-center">' . number_format($item['price'], 0, ',', '.') . 'đ</td>
                    <td class="text-center">' . $item['quantity'] . '</td>
                    <td class="text-right">' . number_format($lineTotal, 0, ',', '.') . 'đ</td>
                </tr>';
    }
    
    $discount = isset($order['discount_amount']) ? floatval($order['discount_amount']) : 0;
    $total = floatval($order['total_amount']);
    
    echo '
            </tbody>
        </table>
        
        <div class="totals-section">
            <div class="totals-box">
                <div class="totals-row">
                    <span>Tạm tính:</span>
                    <span>' . number_format($subtotal, 0, ',', '.') . 'đ</span>
                </div>';
    
    if ($discount > 0) {
        echo '
                <div class="totals-row">
                    <span>Giảm giá:</span>
                    <span style="color: #e74c3c;">-' . number_format($discount, 0, ',', '.') . 'đ</span>
                </div>';
    }
    
    echo '
                <div class="totals-row">
                    <span>Phí vận chuyển:</span>
                    <span>Miễn phí</span>
                </div>
                <div class="totals-row total">
                    <span>Tổng cộng:</span>
                    <span>' . number_format($total, 0, ',', '.') . 'đ</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>CANIFA - Thời trang cho gia đình Việt</strong></p>
            <p>Hotline: 1800 6061 (miễn phí) | Email: support@canifa.com</p>
            <p>Cảm ơn quý khách đã tin tưởng và ủng hộ!</p>
        </div>
    </div>
    
    <button class="print-btn" onclick="window.print()">🖨️ In hóa đơn</button>
</body>
</html>';

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
