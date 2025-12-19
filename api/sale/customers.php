<?php
/**
 * Sale Customers API
 * Endpoints for sales personnel to manage customers
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

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['id'])) {
            // Get specific customer
            $stmt = $pdo->prepare("
                SELECT c.*, 
                    (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) as order_count,
                    (SELECT SUM(total_amount) FROM orders WHERE customer_id = c.id) as total_spent,
                    (SELECT COUNT(*) FROM sale_returns r JOIN orders o ON r.order_id = o.id WHERE o.customer_id = c.id) as return_count
                FROM customers c 
                WHERE c.id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $customer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($customer) {
                // Get recent orders with item count
                $stmt = $pdo->prepare("
                    SELECT o.id, o.total_amount, o.status, o.created_at,
                        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
                    FROM orders o
                    WHERE o.customer_id = ? 
                    ORDER BY o.created_at DESC 
                    LIMIT 5
                ");
                $stmt->execute([$_GET['id']]);
                $customer['recent_orders'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Logic for Tags & Recommendations (Demo Rule-based)
                $tags = [];
                if ($customer['return_count'] > 0) $tags[] = 'high_return';
                if ($customer['total_spent'] > 5000000) $tags[] = 'vip';
                if ($customer['total_spent'] > 500000 && $customer['return_count'] == 0) $tags[] = 'potential_upsell';
                if ($customer['order_count'] <= 2) $tags[] = 'new';
                
                $customer['tags'] = $tags;

                // Simple AI Recommendation Mock
                $recommendations = [
                    'potential_upsell' => 'Gợi ý: Khách có tiềm năng mua thêm Phụ kiện (Thắt lưng, Ví).',
                    'high_return' => 'Cảnh báo: Khách hay hoàn hàng. Tư vấn kỹ về Size.',
                    'vip' => 'Gợi ý: Giới thiệu Bộ sưu tập mới nhất (Ưu tiên VIP).',
                    'new' => 'Gợi ý: Xin Feedback đơn đầu tiên & Tặng mã giảm giá 5%.'
                ];

                // Pick recommendation based on priority tag
                $rec = 'Gợi ý: Mời khách tham gia chương trình thành viên.';
                if (in_array('high_return', $tags)) $rec = $recommendations['high_return'];
                else if (in_array('vip', $tags)) $rec = $recommendations['vip'];
                else if (in_array('potential_upsell', $tags)) $rec = $recommendations['potential_upsell'];
                else if (in_array('new', $tags)) $rec = $recommendations['new'];

                $customer['recommendation'] = $rec;
                
                // ===== LOYALTY DATA =====
                $tier = $customer['membership_tier'] ?? 'bronze';
                // Handle empty string from database
                if (empty($tier)) {
                    $tier = 'bronze';
                }
                $points = intval($customer['loyalty_points'] ?? 0);
                $lifetimeSpent = floatval($customer['total_lifetime_spent'] ?? 0);
                
                // Tier benefits
                $tierBenefits = [
                    'bronze' => ['discount' => 0, 'multiplier' => 1.0, 'next_tier' => 'silver', 'next_threshold' => 5000000],
                    'silver' => ['discount' => 5, 'multiplier' => 1.2, 'next_tier' => 'gold', 'next_threshold' => 20000000],
                    'gold' => ['discount' => 10, 'multiplier' => 1.5, 'next_tier' => 'platinum', 'next_threshold' => 50000000],
                    'platinum' => ['discount' => 15, 'multiplier' => 2.0, 'next_tier' => null, 'next_threshold' => null]
                ];
                
                $customer['loyalty'] = [
                    'points' => $points,
                    'points_value' => floor($points / 100) * 10000, // 100 points = 10,000 VND
                    'tier' => $tier,
                    'tier_discount' => $tierBenefits[$tier]['discount'],
                    'tier_multiplier' => $tierBenefits[$tier]['multiplier'],
                    'lifetime_spent' => $lifetimeSpent,
                    'next_tier' => $tierBenefits[$tier]['next_tier'],
                    'next_threshold' => $tierBenefits[$tier]['next_threshold'],
                    'progress_to_next' => $tierBenefits[$tier]['next_threshold'] ? 
                        min(100, ($lifetimeSpent / $tierBenefits[$tier]['next_threshold']) * 100) : 100
                ];
            }
            
            echo json_encode($customer ?: ['error' => 'Customer not found']);
            
        } elseif (isset($_GET['search'])) {
            // Search customers by phone or name
            $search = '%' . $_GET['search'] . '%';
            $stmt = $pdo->prepare("
                SELECT c.*, 
                    (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) as order_count
                FROM customers c 
                WHERE c.phone LIKE ? OR c.full_name LIKE ? OR c.email LIKE ?
                ORDER BY c.full_name
                LIMIT 20
            ");
            $stmt->execute([$search, $search, $search]);
            $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($customers);
            
        } else {
            // Get all customers (or filtered by creator for non-admin)
            $sql = "
                SELECT c.*, 
                    u.username as created_by_name,
                    (SELECT COUNT(*) FROM orders WHERE customer_id = c.id) as order_count,
                    (SELECT SUM(total_amount) FROM orders WHERE customer_id = c.id) as total_spent
                FROM customers c 
                LEFT JOIN users u ON c.created_by = u.id
            ";
            
            if (!$isAdmin && isset($_GET['my_customers'])) {
                $sql .= " WHERE c.created_by = ?";
            }
            
            $sql .= " ORDER BY c.full_name";
            
            $stmt = $pdo->prepare($sql);
            if (!$isAdmin && isset($_GET['my_customers'])) {
                $stmt->execute([$saleId]);
            } else {
                $stmt->execute();
            }
            
            $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($customers);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Create new customer
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['phone'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Phone number required']);
            exit;
        }
        
        if (empty($data['full_name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Full name required']);
            exit;
        }
        
        // Check if phone already exists
        $stmt = $pdo->prepare("SELECT id FROM customers WHERE phone = ?");
        $stmt->execute([$data['phone']]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Phone number already exists']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            INSERT INTO customers (phone, full_name, email, address, city, created_by) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['phone'],
            $data['full_name'],
            $data['email'] ?? null,
            $data['address'] ?? null,
            $data['city'] ?? null,
            $saleId
        ]);
        
        $customerId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Customer created successfully',
            'customer_id' => $customerId
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update customer
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Customer ID required']);
            exit;
        }
        
        // Build update query dynamically
        $updates = [];
        $params = [];
        
        $fields = ['full_name', 'email', 'address', 'city'];
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        if (isset($data['phone'])) {
            // Check if new phone conflicts
            $stmt = $pdo->prepare("SELECT id FROM customers WHERE phone = ? AND id != ?");
            $stmt->execute([$data['phone'], $data['id']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Phone number already exists']);
                exit;
            }
            $updates[] = "phone = ?";
            $params[] = $data['phone'];
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }
        
        $params[] = $data['id'];
        $sql = "UPDATE customers SET " . implode(', ', $updates) . " WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(['success' => true, 'message' => 'Customer updated']);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Delete customer (admin only for safety)
        if (!$isAdmin) {
            http_response_code(403);
            echo json_encode(['error' => 'Admin access required for deletion']);
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (empty($data['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Customer ID required']);
            exit;
        }
        
        // Check for existing orders
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM orders WHERE customer_id = ?");
        $stmt->execute([$data['id']]);
        $result = $stmt->fetch();
        
        if ($result['count'] > 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Cannot delete customer with existing orders']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM customers WHERE id = ?");
        $stmt->execute([$data['id']]);
        
        echo json_encode(['success' => true, 'message' => 'Customer deleted']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
