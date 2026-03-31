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
        // List all categories with parent name and product count
        $query = "
            SELECT c.*, p.name as parent_name, 
            (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            ORDER BY c.created_at DESC
        ";
        $stmt = $pdo->query($query);
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($categories);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        switch ($action) {
            case 'create':
                // Check if name exists
                $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE name = ?");
                $stmtCheck->execute([$data['name']]);
                if ($stmtCheck->fetchColumn() > 0) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Category name already exists']);
                    exit;
                }

                $stmt = $pdo->prepare("INSERT INTO categories (name, description, parent_id, status) VALUES (?, ?, ?, ?)");
                $stmt->execute([
                    $data['name'],
                    $data['description'] ?? null,
                    !empty($data['parent_id']) ? $data['parent_id'] : null,
                    $data['status'] ?? 'active'
                ]);
                echo json_encode(['success' => true, 'message' => 'Category added successfully', 'id' => $pdo->lastInsertId()]);
                break;

            case 'update':
                 // Check if name exists (excluding self)
                 $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE name = ? AND id != ?");
                 $stmtCheck->execute([$data['name'], $data['id']]);
                 if ($stmtCheck->fetchColumn() > 0) {
                     http_response_code(400);
                     echo json_encode(['error' => 'Category name already exists']);
                     exit;
                 }
                
                 // Prevent setting parent to self
                 if (!empty($data['parent_id']) && $data['parent_id'] == $data['id']) {
                     http_response_code(400);
                     echo json_encode(['error' => 'Category cannot be its own parent']);
                     exit;
                 }

                $stmt = $pdo->prepare("UPDATE categories SET name = ?, description = ?, parent_id = ?, status = ? WHERE id = ?");
                $stmt->execute([
                    $data['name'],
                    $data['description'] ?? null,
                    !empty($data['parent_id']) ? $data['parent_id'] : null,
                    $data['status'] ?? 'active',
                    $data['id']
                ]);
                echo json_encode(['success' => true, 'message' => 'Category updated successfully']);
                break;

            case 'toggle_status':
                $stmt = $pdo->prepare("UPDATE categories SET status = ? WHERE id = ?");
                $stmt->execute([$data['status'], $data['id']]);
                echo json_encode(['success' => true, 'message' => 'Status updated']);
                break;

            case 'delete':
                // 1. Check if has products
                $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM products WHERE category_id = ?");
                $stmtCount->execute([$data['id']]);
                if ($stmtCount->fetchColumn() > 0) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Cannot delete category: It contains products. Please move or delete products first.']);
                    exit;
                }

                // 2. Check if has sub-categories
                $stmtChild = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE parent_id = ?");
                $stmtChild->execute([$data['id']]);
                if ($stmtChild->fetchColumn() > 0) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Cannot delete category: It has sub-categories. Please delete them first.']);
                    exit;
                }

                $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
                $stmt->execute([$data['id']]);
                echo json_encode(['success' => true, 'message' => 'Category deleted successfully']);
                break;

            default:
                throw new Exception("Invalid action");
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
