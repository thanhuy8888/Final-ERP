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
        if (isset($_GET['product_id'])) {
            // Get variants for a specific product
            $stmt = $pdo->prepare("SELECT * FROM product_variants WHERE product_id = ? ORDER BY size, color");
            $stmt->execute([$_GET['product_id']]);
            $variants = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($variants);
        } else {
            // Get all variants with product info
            $stmt = $pdo->query("
                SELECT pv.*, p.name as product_name, p.price as base_price 
                FROM product_variants pv 
                JOIN products p ON pv.product_id = p.id 
                ORDER BY p.name, pv.size, pv.color
            ");
            $variants = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($variants);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['variant_id']) && $data['variant_id']) {
            // Update existing variant
            $stmt = $pdo->prepare("
                UPDATE product_variants 
                SET size = ?, color = ?, color_code = ?, price_adjustment = ?, is_active = ?
                WHERE variant_id = ?
            ");
            $stmt->execute([
                $data['size'],
                $data['color'],
                $data['color_code'] ?? null,
                $data['price_adjustment'] ?? 0,
                $data['is_active'] ?? true,
                $data['variant_id']
            ]);
            echo json_encode(['success' => true, 'message' => 'Cập nhật biến thể thành công']);
        } else {
            // Create new variant
            $variant_sku = $data['variant_sku'] ?? ('VAR-' . time() . '-' . rand(1000, 9999));
            $stmt = $pdo->prepare("
                INSERT INTO product_variants (product_id, size, color, color_code, variant_sku, price_adjustment, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['product_id'],
                $data['size'],
                $data['color'],
                $data['color_code'] ?? null,
                $variant_sku,
                $data['price_adjustment'] ?? 0,
                $data['is_active'] ?? true
            ]);
            echo json_encode(['success' => true, 'message' => 'Thêm biến thể thành công', 'variant_id' => $pdo->lastInsertId()]);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("DELETE FROM product_variants WHERE variant_id = ?");
        $stmt->execute([$data['variant_id']]);
        echo json_encode(['success' => true, 'message' => 'Xóa biến thể thành công']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
