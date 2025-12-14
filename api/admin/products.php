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

function logAudit($pdo, $entityType, $entityId, $action, $oldValue, $newValue, $userId, $userName) {
    $stmt = $pdo->prepare("INSERT INTO audit_logs (entity_type, entity_id, action, old_value, new_value, user_id, user_name) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $entityType, 
        $entityId, 
        $action, 
        json_encode($oldValue), 
        json_encode($newValue), 
        $userId, 
        $userName
    ]);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['id'])) {
            // Get single product with variants and audit logs
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($product) {
                // Get Variants
                $stmtVar = $pdo->prepare("SELECT * FROM product_variants WHERE product_id = ?");
                $stmtVar->execute([$_GET['id']]);
                $product['variants'] = $stmtVar->fetchAll(PDO::FETCH_ASSOC);

                // Get Audit Logs
                $stmtAudit = $pdo->prepare("SELECT * FROM audit_logs WHERE entity_type = 'product' AND entity_id = ? ORDER BY created_at DESC");
                $stmtAudit->execute([$_GET['id']]);
                $product['audit_logs'] = $stmtAudit->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode($product);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Product not found']);
            }
        } else {
            // Fetch all products with category info and variant count
            $query = "
                SELECT p.*, c.name as category_name, COUNT(v.id) as variant_count 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                LEFT JOIN product_variants v ON p.product_id = v.product_id 
                GROUP BY p.id 
                ORDER BY p.created_at DESC
            ";
            
            // Note: Schema for variants foreign key is likely 'product_id'. 
            // Previous code used 'v.product_id'. 
            // Let's verify grouping. JOIN on product_variants might multiply rows if not careful, but COUNT(v.id) with GROUP BY p.id is correct.
            // Wait, previous code: `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ...`
            
            // Correct Query with LEFT JOIN on variants
            $query = "
                SELECT p.*, c.name as category_name, 
                (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                ORDER BY p.created_at DESC
            ";
            
            $stmt = $pdo->query($query);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($products);
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $userId = $_SESSION['user_id'];
        $userName = $_SESSION['username'] ?? 'Admin'; // Or fetch from DB if needed
        
        $pdo->beginTransaction();

        try {
            if (isset($data['id']) && $data['id']) {
                // UPDATE
                // 1. Fetch old data for audit
                $stmtOld = $pdo->prepare("SELECT * FROM products WHERE id = ?");
                $stmtOld->execute([$data['id']]);
                $oldProduct = $stmtOld->fetch(PDO::FETCH_ASSOC);

                // 2. Perform Update
                // Prioritize Status Toggle if it's a dedicated action
                if (isset($data['action']) && $data['action'] === 'toggle_status') {
                    $newStatus = $data['status'];
                    $stmt = $pdo->prepare("UPDATE products SET status = ? WHERE id = ?");
                    $stmt->execute([$newStatus, $data['id']]);
                    
                    logAudit($pdo, 'product', $data['id'], 'status_change', ['status' => $oldProduct['status']], ['status' => $newStatus], $userId, $userName);
                    $message = 'Cập nhật trạng thái thành công';
                } else {
                    // Full Update
                    $stmt = $pdo->prepare("UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image = ?, sku = ?, barcode = ?, material = ?, status = ? WHERE id = ?");
                    $stmt->execute([
                        $data['name'],
                        $data['description'],
                        $data['price'],
                        $data['category_id'],
                        $data['image'],
                        $data['sku'] ?? null,
                        $data['barcode'] ?? null,
                        $data['material'] ?? null,
                        $data['status'] ?? 'active',
                        $data['id']
                    ]);
                    
                    logAudit($pdo, 'product', $data['id'], 'update', $oldProduct, $data, $userId, $userName);

                    $productId = $data['id'];

                    // Handle Variants: Delete old and insert new (simplified logic)
                    // Note: Ideally we should audit variant changes too, but let's stick to product level for now or simple "Variants Updated"
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
                    $message = 'Cập nhật sản phẩm thành công';
                }

            } else {
                // CREATE
                $stmt = $pdo->prepare("INSERT INTO products (name, description, price, category_id, image, sku, barcode, material, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $data['name'],
                    $data['description'],
                    $data['price'],
                    $data['category_id'],
                    $data['image'],
                    $data['sku'] ?? null,
                    $data['barcode'] ?? null,
                    $data['material'] ?? null,
                    $data['status'] ?? 'active'
                ]);
                $productId = $pdo->lastInsertId();

                logAudit($pdo, 'product', $productId, 'create', null, $data, $userId, $userName);

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
                
                $message = 'Thêm sản phẩm thành công';
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
        $userId = $_SESSION['user_id'];
        $userName = $_SESSION['username'] ?? 'Admin';

        // Fetch for audit
        $stmtOld = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmtOld->execute([$data['id']]);
        $oldProduct = $stmtOld->fetch(PDO::FETCH_ASSOC);

        // Check if product is in any orders (optional but good practice)
        // $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM order_items WHERE product_id = ?");
        
        $pdo->beginTransaction();
        try {
            // 1. Delete associated variants first
            $stmtVar = $pdo->prepare("DELETE FROM product_variants WHERE product_id = ?");
            $stmtVar->execute([$data['id']]);

            // 2. Delete the product
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            // Log delete
            logAudit($pdo, 'product', $data['id'], 'delete', $oldProduct, null, $userId, $userName);
            
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Xóa sản phẩm thành công']);
        } catch (PDOException $e) {
            $pdo->rollBack();
            if ($e->getCode() == '23000') {
                http_response_code(400); // Bad Request
                echo json_encode(['error' => 'Cannot delete product: It is associated with existing orders or other data.']);
            } else {
                throw $e;
            }
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
