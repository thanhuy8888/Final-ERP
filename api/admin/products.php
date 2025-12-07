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
            // Get single product with variants
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($product) {
                // Get Variants
                $stmtVar = $pdo->prepare("SELECT * FROM product_variants WHERE product_id = ?");
                $stmtVar->execute([$_GET['id']]);
                $product['variants'] = $stmtVar->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($product);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
            }
        } else {
            // Fetch all products with category info
            $stmt = $pdo->query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC");
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($products);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $pdo->beginTransaction();

        try {
            if (isset($data['id']) && $data['id']) {
                // Update existing product
                $stmt = $pdo->prepare("UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image = ?, sku = ?, barcode = ?, material = ? WHERE id = ?");
                $stmt->execute([
                    $data['name'],
                    $data['description'],
                    $data['price'],
                    $data['category_id'],
                    $data['image'],
                    $data['sku'] ?? null,
                    $data['barcode'] ?? null,
                    $data['material'] ?? null,
                    $data['id']
                ]);
                $productId = $data['id'];

                // Handle Variants: Delete old and insert new
                if (isset($data['variants']) && is_array($data['variants'])) {
                    $pdo->prepare("DELETE FROM product_variants WHERE product_id = ?")->execute([$productId]);
                    
                    $stmtVar = $pdo->prepare("INSERT INTO product_variants (product_id, size, color, quantity, price_adjustment) VALUES (?, ?, ?, ?, ?)");
                    foreach ($data['variants'] as $variant) {
                        $stmtVar->execute([
                            $productId,
                            $variant['size'],
                            $variant['color'],
                            $variant['quantity'] ?? 0,
                            $variant['price_adjustment'] ?? 0
                        ]);
                    }
                }
                
                $message = 'Cập nhật sản phẩm và biến thể thành công';

            } else {
                // Create new product
                $stmt = $pdo->prepare("INSERT INTO products (name, description, price, category_id, image, sku, barcode, material) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $data['name'],
                    $data['description'],
                    $data['price'],
                    $data['category_id'],
                    $data['image'],
                    $data['sku'] ?? null,
                    $data['barcode'] ?? null,
                    $data['material'] ?? null
                ]);
                $productId = $pdo->lastInsertId();

                // Handle Variants
                if (isset($data['variants']) && is_array($data['variants'])) {
                    $stmtVar = $pdo->prepare("INSERT INTO product_variants (product_id, size, color, quantity, price_adjustment) VALUES (?, ?, ?, ?, ?)");
                    foreach ($data['variants'] as $variant) {
                        $stmtVar->execute([
                            $productId,
                            $variant['size'],
                            $variant['color'],
                            $variant['quantity'] ?? 0,
                            $variant['price_adjustment'] ?? 0
                        ]);
                    }
                }
                
                $message = 'Thêm sản phẩm và biến thể thành công';
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => $message]);

        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true, 'message' => 'Xóa sản phẩm thành công']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
