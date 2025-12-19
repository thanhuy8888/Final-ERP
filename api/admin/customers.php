<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

// Check admin/sale auth
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) { 
    // Sales staff can also manage customers
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: List Customers ---
if ($method === 'GET') {
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = ($page - 1) * $limit;

    $search = $_GET['search'] ?? '';
    $tier = $_GET['membership_tier'] ?? '';

    $where = "WHERE 1=1";
    $params = [];

    if ($search) {
        $where .= " AND (full_name LIKE ? OR phone LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    if ($tier) {
        $where .= " AND membership_tier = ?";
        $params[] = $tier;
    }

    // Count Total
    $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM customers $where");
    $stmtCount->execute($params);
    $total = $stmtCount->fetchColumn();

    // Fetch Data
    $sql = "SELECT * FROM customers $where ORDER BY created_at DESC LIMIT $limit OFFSET $offset";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'data' => $customers,
        'total' => $total,
        'page' => $page,
        'last_page' => ceil($total / $limit)
    ]);
}

// --- POST: Create Customer ---
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validation
    if (empty($data['full_name']) || empty($data['phone'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Name and Phone are required']);
        exit;
    }

    // Check Duplicate Phone
    $stmt = $pdo->prepare("SELECT id FROM customers WHERE phone = ?");
    $stmt->execute([$data['phone']]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['message' => 'Phone number already exists']);
        exit;
    }

    try {
        $sql = "INSERT INTO customers (full_name, phone, email, gender, dob, address, membership_tier, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, 'bronze', ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['full_name'],
            $data['phone'],
            $data['email'] ?? null,
            $data['gender'] ?? 'other',
            $data['dob'] ?? null,
            $data['address'] ?? null,
            $_SESSION['user_id']
        ]);
        
        echo json_encode(['message' => 'Customer created successfully', 'id' => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => $e->getMessage()]);
    }
}

// --- PUT: Update Customer ---
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['message' => 'ID required']);
        exit;
    }

    try {
        $sql = "UPDATE customers SET 
                full_name = ?, 
                phone = ?, 
                email = ?, 
                gender = ?, 
                dob = ?, 
                address = ?
                WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['full_name'],
            $data['phone'],
            $data['email'] ?? null,
            $data['gender'] ?? 'other',
            $data['dob'] ?? null,
            $data['address'] ?? null,
            $data['id']
        ]);
        
        echo json_encode(['message' => 'Customer updated successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => $e->getMessage()]);
    }
}
?>
