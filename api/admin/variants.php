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

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // List all variants with product info
        $query = "
            SELECT v.*, p.name as product_name, p.image as product_image 
            FROM product_variants v
            JOIN products p ON v.product_id = p.id
            ORDER BY v.created_at DESC
        ";
        $stmt = $pdo->query($query);
        $variants = $stmt->fetchAll();
        echo json_encode($variants);
    } 
    elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        
        switch ($action) {
            case 'create':
                $stmt = $pdo->prepare("INSERT INTO product_variants (product_id, sku, barcode, size, color, quantity, price_adjustment, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $data['product_id'],
                    $data['sku'],
                    $data['barcode'] ?? null,
                    $data['size'],
                    $data['color'],
                    $data['quantity'] ?? 0,
                    $data['price_adjustment'] ?? 0,
                    'active'
                ]);
                echo json_encode(['success' => true, 'message' => 'Added variant successfully', 'id' => $pdo->lastInsertId()]);
                break;

            case 'update':
                $stmt = $pdo->prepare("UPDATE product_variants SET sku = ?, barcode = ?, size = ?, color = ?, price_adjustment = ? WHERE variant_id = ?");
                $stmt->execute([
                    $data['sku'],
                    $data['barcode'],
                    $data['size'],
                    $data['color'],
                    $data['price_adjustment'],
                    $data['id']
                ]);
                echo json_encode(['success' => true, 'message' => 'Updated variant successfully']);
                break;

            case 'toggle_status':
                $stmt = $pdo->prepare("UPDATE product_variants SET status = ? WHERE variant_id = ?");
                $stmt->execute([$data['status'], $data['id']]);
                echo json_encode(['success' => true, 'message' => 'Status updated']);
                break;

            case 'delete':
                try {
                    $stmt = $pdo->prepare("DELETE FROM product_variants WHERE variant_id = ?");
                    $stmt->execute([$data['id']]);
                    echo json_encode(['success' => true, 'message' => 'Variant deleted']);
                } catch (PDOException $e) {
                    if ($e->getCode() == '23000') {
                        http_response_code(400);
                        echo json_encode(['error' => 'Cannot delete variant: It is associated with existing orders or inventory.']);
                    } else {
                        throw $e;
                    }
                }
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
