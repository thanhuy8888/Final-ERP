<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Helper to update inventory
function restockItems($pdo, $storeId, $items) {
    $sql = "UPDATE inventory SET quantity_on_hand = quantity_on_hand + ? WHERE store_id = ? AND product_id = ?";
    $stmt = $pdo->prepare($sql);
    foreach ($items as $item) {
        $stmt->execute([$item['quantity'], $storeId, $item['product_id']]);
        
        // Check if row existed, if not insert? (Optional, but inventory usually exists for sold items)
        if ($stmt->rowCount() == 0) {
            // Insert if not exists (Edge case: store inventory deleted?)
            $ins = $pdo->prepare("INSERT INTO inventory (store_id, product_id, quantity_on_hand) VALUES (?, ?, ?)");
            $ins->execute([$storeId, $item['product_id'], $item['quantity']]);
        }
    }
}

// Helper to deduct loyalty points
function deductLoyaltyPoints($pdo, $orderId, $refundAmount) {
    // 1. Get original points earned for this order? 
    // Simplified: Deduct points equivalent to refund amount (e.g. 1% of value)
    // Or check loyalty_transactions for this order.
    
    // For now, let's look for the original transaction
    $stmt = $pdo->prepare("SELECT * FROM loyalty_transactions WHERE order_id = ? AND transaction_type = 'earn' LIMIT 1");
    $stmt->execute([$orderId]);
    $originalTx = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($originalTx) {
        // Calculate pro-rated points or just deduct based on ratio?
        // Let's assume 1 point per 1000 VND (Example rule). 
        // Better: look at the original order total vs refund total ratio.
        
        $getOrder = $pdo->prepare("SELECT total_amount, customer_id FROM orders WHERE id = ?");
        $getOrder->execute([$orderId]);
        $order = $getOrder->fetch();

        if ($order && $order['total_amount'] > 0) {
            $ratio = $refundAmount / $order['total_amount'];
            $pointsToDeduct = ceil($originalTx['points_earned'] * $ratio);

            if ($pointsToDeduct > 0) {
                // Insert negative transaction
                $ins = $pdo->prepare("INSERT INTO loyalty_transactions (customer_id, order_id, points_earned, transaction_type, description) VALUES (?, ?, ?, 'redeem', ?)");
                $ins->execute([
                    $order['customer_id'], 
                    $orderId, 
                    -$pointsToDeduct, 
                    "Return Refund Adjustment: -" . number_format($refundAmount)
                ]);
            }
        }
    }
}

// Ensure Tables Exist
$pdo->exec("CREATE TABLE IF NOT EXISTS sale_returns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    return_number VARCHAR(50),
    refund_amount DECIMAL(10,2),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$pdo->exec("CREATE TABLE IF NOT EXISTS sale_return_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    return_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL
)");

try {
    if ($method === 'GET') {
        if (isset($_GET['search_order'])) {
            // ... existing search logic ...
            $term = $_GET['search_order'];
            $stmt = $pdo->prepare("
                SELECT o.id, o.total_amount, o.status, u.username, c.full_name, c.phone 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN customers c ON o.customer_id = c.id
                WHERE o.id LIKE ? OR c.phone LIKE ? OR c.full_name LIKE ?
                LIMIT 10
            ");
            $like = "%$term%";
            $stmt->execute([$like, $like, $like]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

        } elseif (isset($_GET['order_details'])) {
            // 1. Get All Items for Order
            $orderId = $_GET['order_details'];
            $stmt = $pdo->prepare("
                SELECT oi.*, p.name as product_name, p.sku, p.image
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ");
            $stmt->execute([$orderId]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 2. Get Previously Returned Quantities
            $stmtRet = $pdo->prepare("
                SELECT sri.product_id, SUM(sri.quantity) as returned_qty
                FROM sale_return_items sri
                JOIN sale_returns sr ON sri.return_id = sr.id
                WHERE sr.order_id = ?
                GROUP BY sri.product_id
            ");
            $stmtRet->execute([$orderId]);
            $returnedMap = [];
            while ($row = $stmtRet->fetch(PDO::FETCH_ASSOC)) {
                $returnedMap[$row['product_id']] = $row['returned_qty'];
            }

            // 3. Merge Logic
            foreach ($items as &$item) {
                if (!$item['product_name']) $item['product_name'] = "Product #{$item['product_id']} (Deleted)";
                $prevReturned = isset($returnedMap[$item['product_id']]) ? $returnedMap[$item['product_id']] : 0;
                $item['returnable_qty'] = max(0, $item['quantity'] - $prevReturned);
            }

            echo json_encode($items);

        } else {
            // List Returns
            $sql = "SELECT r.*, o.id as order_ref, o.store_id, 
                    u.username, u.full_name, u.role 
                    FROM sale_returns r 
                    JOIN orders o ON r.order_id = o.id 
                    JOIN users u ON r.user_id = u.id 
                    ORDER BY r.created_at DESC";
            $stmt = $pdo->query($sql);
            $returns = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format data for frontend
            foreach ($returns as &$ret) {
                $name = $ret['full_name'] ? $ret['full_name'] : $ret['username'];
                $role = ucfirst($ret['role']); // e.g. 'Admin', 'Sale'
                $ret['processed_by_display'] = "[$role] $name";
            }
            
            echo json_encode($returns);
        }
    } elseif ($method === 'POST') {
        // Create Return
        $data = json_decode(file_get_contents("php://input"), true);
        
        $orderId = $data['order_id'];
        $items = $data['items']; // [{product_id, quantity}]
        $reason = $data['reason'];
        
        if (empty($orderId) || empty($items)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing Order ID or Items']);
            exit;
        }

        $pdo->beginTransaction();

        try {
            // 1. Calculate Refund Amount
            $refundTotal = 0;
            $returnItems = [];

            // Get Order & Items prices
            foreach ($items as $item) {
                // Verify price from original order
                $stmt = $pdo->prepare("SELECT price FROM order_items WHERE order_id = ? AND product_id = ?");
                $stmt->execute([$orderId, $item['product_id']]);
                $origItem = $stmt->fetch();
                
                if ($origItem) {
                    $refundTotal += $origItem['price'] * $item['quantity'];
                    $returnItems[] = [
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity']
                    ];
                }
            }

            // 2. Insert Sale Return Record
            $stmt = $pdo->prepare("INSERT INTO sale_returns (order_id, user_id, return_number, refund_amount, reason, status) VALUES (?, ?, ?, ?, ?, 'completed')");
            $returnNumber = 'RET-' . date('Ymd') . '-' . rand(100,999);
            $stmt->execute([$orderId, $_SESSION['user_id'], $returnNumber, $refundTotal, $reason]);
            $returnId = $pdo->lastInsertId();

            // 3. Insert Return Items
            $stmtItem = $pdo->prepare("INSERT INTO sale_return_items (return_id, product_id, quantity) VALUES (?, ?, ?)");
            foreach ($returnItems as $ri) {
                $stmtItem->execute([$returnId, $ri['product_id'], $ri['quantity']]);
            }

            // 4. Update Inventory (Restock)
            // Need Store ID
            $getStore = $pdo->prepare("SELECT store_id, status FROM orders WHERE id = ?");
            $getStore->execute([$orderId]);
            $orderInfo = $getStore->fetch();
            
            if ($orderInfo) {
                restockItems($pdo, $orderInfo['store_id'], $returnItems);
            }

            // 5. Update Loyalty Points (Deduct)
            deductLoyaltyPoints($pdo, $orderId, $refundTotal);

            // 6. Update Order Status if fully returned? (Optional)
            // For now, keep as is or set to 'returned' if supported. 
            // Often orders stay 'completed' but have linked returns.
            
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Return processed successfully', 'return_id' => $returnId]);

        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
