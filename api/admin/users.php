<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check admin auth
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['id'])) {
            // Get specific user
            $stmt = $pdo->prepare("SELECT id, username, email, full_name, phone, role, is_active, created_at FROM users WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($user);
        } else {
            // Get all users
            $stmt = $pdo->query("SELECT id, username, email, full_name, phone, role, is_active, created_at FROM users ORDER BY created_at DESC");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($users);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['id']) && $data['id']) {
            // Update existing user
            if (!empty($data['password'])) {
                // Update with new password
                $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("
                    UPDATE users 
                    SET username = ?, email = ?, password = ?, full_name = ?, phone = ?, role = ?, is_active = ?
                    WHERE id = ?
                ");
                $stmt->execute([
                    $data['username'],
                    $data['email'],
                    $hashed_password,
                    $data['full_name'] ?? null,
                    $data['phone'] ?? null,
                    $data['role'],
                    $data['is_active'] ?? true,
                    $data['id']
                ]);
            } else {
                // Update without password
                $stmt = $pdo->prepare("
                    UPDATE users 
                    SET username = ?, email = ?, full_name = ?, phone = ?, role = ?, is_active = ?
                    WHERE id = ?
                ");
                $stmt->execute([
                    $data['username'],
                    $data['email'],
                    $data['full_name'] ?? null,
                    $data['phone'] ?? null,
                    $data['role'],
                    $data['is_active'] ?? true,
                    $data['id']
                ]);
            }
            
            // Log the action
            logAudit($pdo, $_SESSION['user_id'], 'Update', 'users', $data['id']);
            
            echo json_encode(['success' => true, 'message' => 'Cập nhật người dùng thành công']);
        } else {
            // Create new user
            // Check if username or email exists
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$data['username'], $data['email']]);
            if ($stmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(['error' => 'Tên đăng nhập hoặc Email đã tồn tại']);
                exit;
            }
            
            $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("
                INSERT INTO users (username, email, password, full_name, phone, role, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['username'],
                $data['email'],
                $hashed_password,
                $data['full_name'] ?? null,
                $data['phone'] ?? null,
                $data['role'] ?? 'customer',
                $data['is_active'] ?? true
            ]);
            
            $newUserId = $pdo->lastInsertId();
            logAudit($pdo, $_SESSION['user_id'], 'Create', 'users', $newUserId);
            
            echo json_encode(['success' => true, 'message' => 'Thêm người dùng thành công', 'user_id' => $newUserId]);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Prevent deleting self
        if ($data['id'] == $_SESSION['user_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'Không thể xóa tài khoản của chính bạn']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$data['id']]);
        
        logAudit($pdo, $_SESSION['user_id'], 'Delete', 'users', $data['id']);
        
        echo json_encode(['success' => true, 'message' => 'Xóa người dùng thành công']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// Helper function to log audit
function logAudit($pdo, $userId, $actionType, $entityType, $entityId, $oldValue = null, $newValue = null) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, old_value, new_value, ip_address) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $actionType,
            $entityType,
            $entityId,
            $oldValue ? json_encode($oldValue) : null,
            $newValue ? json_encode($newValue) : null,
            $_SERVER['REMOTE_ADDR'] ?? null
        ]);
    } catch (Exception $e) {
        // Silently fail audit logging to not break main operation
    }
}
?>
