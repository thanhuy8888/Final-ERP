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
                    (SELECT SUM(total_amount) FROM orders WHERE customer_id = c.id) as total_spent
                FROM customers c 
                WHERE c.id = ?
            ");
            $stmt->execute([$_GET['id']]);
            $customer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($customer) {
                // Get recent orders
                $stmt = $pdo->prepare("
                    SELECT id, total_amount, status, created_at 
                    FROM orders 
                    WHERE customer_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT 5
                ");
                $stmt->execute([$_GET['id']]);
                $customer['recent_orders'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
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
            INSERT INTO customers (phone, full_name, email, address, city, notes, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['phone'],
            $data['full_name'],
            $data['email'] ?? null,
            $data['address'] ?? null,
            $data['city'] ?? null,
            $data['notes'] ?? null,
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
        
        $fields = ['full_name', 'email', 'address', 'city', 'notes'];
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
