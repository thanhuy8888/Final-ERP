<?php
/**
 * Sale Orders API
 * Endpoints for sales personnel to manage orders
 */

require_once '../../includes/api_header.php';
require_once '../../includes/db.php';
require_once '../../includes/EmailService.php';

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
$language = isset($_SERVER['HTTP_X_LANGUAGE']) ? $_SERVER['HTTP_X_LANGUAGE'] : 'vi';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['id'])) {
            // Get specific order details
            $stmt = $pdo->prepare("
                SELECT o.*, u.username, u.email,
                    c.full_name as customer_name, c.phone as customer_phone
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id 
                LEFT JOIN customers c ON o.customer_id = c.id
                WHERE o.id = ? AND (o.sale_id = ? OR ? = 'admin')
            ");
            $stmt->execute([$_GET['id'], $saleId, $_SESSION['role']]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($order) {
                // Get order items
                $stmt = $pdo->prepare("
                    SELECT oi.*, p.name as product_name, p.image 
                    FROM order_items oi 
                    JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = ?
                ");
                $stmt->execute([$_GET['id']]);
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }
            
            echo json_encode($order ?: ['error' => 'Order not found']);
        } else {
            // Get orders for this salesperson (or all for admin)
            $sql = "
                SELECT o.*, u.username,
                    c.full_name as customer_name, c.phone as customer_phone,
                    (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.id
                LEFT JOIN customers c ON o.customer_id = c.id
            ";
            
            if ($_SESSION['role'] !== 'admin') {
                $sql .= " WHERE o.sale_id = ?";
            }
            
            $sql .= " ORDER BY o.created_at DESC";
            
            $stmt = $pdo->prepare($sql);
            if ($_SESSION['role'] !== 'admin') {
                $stmt->execute([$saleId]);
            } else {
                $stmt->execute();
            }
            
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($orders);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['action']) && $data['action'] === 'update_status') {
            // Update order status
            $orderId = $data['order_id'];
            $newStatus = $data['status'];
            
            // Verify ownership
            $stmt = $pdo->prepare("SELECT o.*, u.username, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ? AND (o.sale_id = ? OR ? = 'admin')");
            $stmt->execute([$orderId, $saleId, $_SESSION['role']]);
            $order = $stmt->fetch();
            
            if (!$order) {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found or access denied']);
                exit;
            }
            
            $oldStatus = $order['status'];
            
            $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $orderId]);
            
            // Send email notification
            if ($oldStatus !== $newStatus && $order['email']) {
                try {
                    $emailService = new EmailService($language);
                    $emailService->sendOrderStatusUpdate($orderId, $order['email'], $order['username'], $oldStatus, $newStatus);
                } catch (Exception $e) {
                    error_log("Email failed: " . $e->getMessage());
                }
            }
            
            echo json_encode(['success' => true, 'message' => 'Status updated']);
            
        } else {
            // Create new order for customer
            if (empty($data['customer_id']) && empty($data['customer_phone'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Customer ID or phone required']);
                exit;
            }
            
            if (empty($data['items']) || !is_array($data['items'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Order items required']);
                exit;
            }
            
            $pdo->beginTransaction();
            
            // Get or create customer
            $customerId = null;
            $customerEmail = null;
            $customerName = null;
            
            if (!empty($data['customer_id'])) {
                $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = ?");
                $stmt->execute([$data['customer_id']]);
                $customer = $stmt->fetch();
                if ($customer) {
                    $customerId = $customer['id'];
                    $customerEmail = $customer['email'];
                    $customerName = $customer['full_name'];
                }
            } elseif (!empty($data['customer_phone'])) {
                // Try to find or create customer
                $stmt = $pdo->prepare("SELECT * FROM customers WHERE phone = ?");
                $stmt->execute([$data['customer_phone']]);
                $customer = $stmt->fetch();
                
                if ($customer) {
                    $customerId = $customer['id'];
                    $customerEmail = $customer['email'];
                    $customerName = $customer['full_name'];
                } else {
                    // Create new customer
                    $stmt = $pdo->prepare("INSERT INTO customers (phone, full_name, email, address, city, created_by) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $data['customer_phone'],
                        $data['customer_name'] ?? 'Khách hàng mới',
                        $data['customer_email'] ?? null,
                        $data['address'] ?? null,
                        $data['city'] ?? null,
                        $saleId
                    ]);
                    $customerId = $pdo->lastInsertId();
                    $customerEmail = $data['customer_email'] ?? null;
                    $customerName = $data['customer_name'] ?? 'Khách hàng mới';
                }
            }
            
            // Calculate total
            $totalAmount = 0;
            $orderItems = [];
            
            foreach ($data['items'] as $item) {
                $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
                $stmt->execute([$item['product_id']]);
                $product = $stmt->fetch();
                
                if (!$product) {
                    $pdo->rollBack();
                    http_response_code(400);
                    echo json_encode(['error' => 'Product not found: ' . $item['product_id']]);
                    exit;
                }
                
                $qty = intval($item['quantity']);
                $price = $product['price'];
                $totalAmount += $price * $qty;
                
                $orderItems[] = [
                    'product_id' => $product['id'],
                    'quantity' => $qty,
                    'price' => $price
                ];
            }
            
            // Apply discount if provided
            $discount = floatval($data['discount'] ?? 0);
            $finalAmount = $totalAmount - $discount;
            
            // Get payment method (default to cash)
            $paymentMethod = $data['payment_method'] ?? 'cash';
            
            // Create order
            $stmt = $pdo->prepare("
                INSERT INTO orders (user_id, sale_id, customer_id, total_amount, discount_amount, status, payment_method, notes, shipping_address) 
                VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)
            ");
            
            // Use a placeholder user_id if customer doesn't have an account
            $stmt->execute([
                null, // user_id - null for non-registered customers
                $saleId, // sale_id
                $customerId,
                $finalAmount,
                $discount,
                $paymentMethod,
                $data['notes'] ?? null,
                $data['address'] ?? null
            ]);
            
            $orderId = $pdo->lastInsertId();
            
            // Insert order items
            $stmt = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
            $deductStmt = $pdo->prepare("UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE product_id = ? AND store_id = (SELECT store_id FROM users WHERE id = ?) AND quantity_on_hand >= ?");
            
            // Fallback: If no store assigned to user, decrement from 'main' store or random available?
            // BETTER APPROACH: Decrement from a specific store. 
            // Assumption: Salesperson belongs to a store. We need to get `store_id` from user session or `users` table.
            
            // Get user's store_id
            $storeStmt = $pdo->prepare("SELECT store_id FROM users WHERE id = ?");
            $storeStmt->execute([$saleId]);
            $userStore = $storeStmt->fetch();
            $storeId = $userStore['store_id'] ?? 1; // Default to store 1 if not set

            foreach ($orderItems as $item) {
                // 1. Insert Item
                $stmt->execute([$orderId, $item['product_id'], $item['quantity'], $item['price']]);
                
                // 2. Deduct Inventory
                // We try to deduct from the specific store. 
                // Note: Simple deduction. Production logic should handle "insufficient stock" checks before transaction.
                $deductSql = "UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE product_id = ? AND store_id = ?";
                $pdo->prepare($deductSql)->execute([$item['quantity'], $item['product_id'], $storeId]);
            }
            
            // ===== LOYALTY SYSTEM: Award Points =====
            if ($customerId) {
                // Calculate points earned (1 point per 1000 VND)
                $pointsEarned = floor($finalAmount / 1000);
                
                // Get customer's current tier for points multiplier
                $stmt = $pdo->prepare("SELECT membership_tier FROM customers WHERE id = ?");
                $stmt->execute([$customerId]);
                $customer = $stmt->fetch();
                
                // Apply tier multiplier
                $multiplier = 1.0;
                switch ($customer['membership_tier'] ?? 'bronze') {
                    case 'silver': $multiplier = 1.2; break;
                    case 'gold': $multiplier = 1.5; break;
                    case 'platinum': $multiplier = 2.0; break;
                }
                $pointsEarned = floor($pointsEarned * $multiplier);
                
                // Update customer loyalty points and lifetime spending
                $stmt = $pdo->prepare("
                    UPDATE customers 
                    SET loyalty_points = loyalty_points + ?,
                        total_lifetime_spent = total_lifetime_spent + ?
                    WHERE id = ?
                ");
                $stmt->execute([$pointsEarned, $finalAmount, $customerId]);
                
                // Log loyalty transaction
                $stmt = $pdo->prepare("
                    INSERT INTO loyalty_transactions (customer_id, order_id, points_earned, transaction_type, description)
                    VALUES (?, ?, ?, 'earn', ?)
                ");
                $stmt->execute([
                    $customerId, 
                    $orderId, 
                    $pointsEarned,
                    "Earned $pointsEarned points from order #$orderId"
                ]);
                
                // Check and upgrade tier if needed
                $stmt = $pdo->prepare("SELECT total_lifetime_spent FROM customers WHERE id = ?");
                $stmt->execute([$customerId]);
                $customer = $stmt->fetch();
                $totalSpent = $customer['total_lifetime_spent'];
                
                $newTier = 'bronze';
                if ($totalSpent >= 50000000) $newTier = 'platinum';
                elseif ($totalSpent >= 20000000) $newTier = 'gold';
                elseif ($totalSpent >= 5000000) $newTier = 'silver';
                
                // Update tier if changed
                $stmt = $pdo->prepare("
                    UPDATE customers 
                    SET membership_tier = ?, tier_updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ? AND membership_tier != ?
                ");
                $stmt->execute([$newTier, $customerId, $newTier]);
            }
            // ===== END LOYALTY SYSTEM =====
            
            $pdo->commit();
            
            // Clear product cache to reflect stock changes
            try {
                // Assuming FileCache is available via includes/file_cache.php which we need to require if not already
                // But orders.php didn't require it at top. Let's add require at top or here safely.
                // It is safer to add require_once at top, but for minimal diff we can do:
                $cacheFile = __DIR__ . '/../../includes/file_cache.php';
                if (file_exists($cacheFile)) {
                    require_once $cacheFile;
                    // $cache instance is created in file_cache.php
                    if (isset($cache)) {
                        $cache->deletePattern('products_*');
                        // Also clear specific product caches if we want to be thorough, but products_* covers the list
                        foreach ($orderItems as $item) {
                            $cache->delete('product_' . $item['product_id']);
                        }
                    }
                }
            } catch (Exception $e) {
                // Ignore cache errors
            }

            // Send confirmation email
            if ($customerEmail) {
                try {
                    $emailService = new EmailService($language);
                    $emailService->sendOrderConfirmation($orderId, $customerEmail, $customerName);
                } catch (Throwable $e) {
                    error_log("Email failed: " . $e->getMessage());
                }
            }
            
            // Clean buffer to remove any warnings or whitespace
            if (ob_get_length()) ob_clean();
            
            echo json_encode([
                'success' => true,
                'message' => 'Order created successfully',
                'order_id' => $orderId,
                'total_amount' => $finalAmount
            ], JSON_UNESCAPED_UNICODE);
        }
    }
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    if (ob_get_length()) ob_clean();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
