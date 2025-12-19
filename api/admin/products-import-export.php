<?php
/**
 * Products Import/Export API
 * CSV/Excel compatible import and export for products
 */

require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check admin auth
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'export':
            exportProducts($pdo);
            break;
            
        case 'import':
            importProducts($pdo);
            break;
            
        case 'template':
            downloadTemplate();
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action. Use: export, import, or template']);
            exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Export all products as CSV
 */
function exportProducts($pdo) {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="products_export_' . date('Y-m-d_His') . '.csv"');
    
    $output = fopen('php://output', 'w');
    
    // Add BOM for Excel UTF-8 compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // Header row
    fputcsv($output, [
        'ID',
        'Name',
        'Description',
        'Price',
        'Material',
        'Image URL',
        'Is Active',
        'Created At'
    ]);
    
    // Get all products
    $stmt = $pdo->query("SELECT id, name, description, price, material, image, is_active, created_at FROM products ORDER BY id");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($output, [
            $row['id'],
            $row['name'],
            $row['description'],
            $row['price'],
            $row['material'] ?? '',
            $row['image'] ?? '',
            $row['is_active'] ? 'Yes' : 'No',
            $row['created_at']
        ]);
    }
    
    fclose($output);
    exit;
}

/**
 * Import products from uploaded CSV
 */
function importProducts($pdo) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'POST method required']);
        exit;
    }
    
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded or upload error']);
        exit;
    }
    
    $file = $_FILES['file']['tmp_name'];
    $mimeType = mime_content_type($file);
    
    // Accept CSV and Excel-saved CSV
    if (!in_array($mimeType, ['text/csv', 'text/plain', 'application/vnd.ms-excel', 'application/octet-stream'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Please upload a CSV file.']);
        exit;
    }
    
    $handle = fopen($file, 'r');
    if (!$handle) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to open uploaded file']);
        exit;
    }
    
    // Skip BOM if present
    $bom = fread($handle, 3);
    if ($bom !== chr(0xEF).chr(0xBB).chr(0xBF)) {
        rewind($handle);
    }
    
    // Read header row
    $header = fgetcsv($handle);
    if (!$header) {
        http_response_code(400);
        echo json_encode(['error' => 'Empty file or invalid CSV format']);
        exit;
    }
    
    // Normalize headers
    $header = array_map(function($h) {
        return strtolower(trim($h));
    }, $header);
    
    // Required columns
    $requiredColumns = ['name', 'price'];
    foreach ($requiredColumns as $col) {
        if (!in_array($col, $header)) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required column: $col"]);
            exit;
        }
    }
    
    // Column indexes
    $idIndex = array_search('id', $header);
    $nameIndex = array_search('name', $header);
    $descIndex = array_search('description', $header);
    $priceIndex = array_search('price', $header);
    $materialIndex = array_search('material', $header);
    $imageIndex = array_search('image url', $header);
    if ($imageIndex === false) $imageIndex = array_search('image', $header);
    
    $results = [
        'created' => 0,
        'updated' => 0,
        'skipped' => 0,
        'errors' => []
    ];
    
    $pdo->beginTransaction();
    
    $lineNumber = 1;
    while (($row = fgetcsv($handle)) !== false) {
        $lineNumber++;
        
        try {
            $name = trim($row[$nameIndex] ?? '');
            $price = floatval(str_replace([',', ' '], '', $row[$priceIndex] ?? 0));
            $description = trim($row[$descIndex] ?? '');
            $material = $materialIndex !== false ? trim($row[$materialIndex] ?? '') : '';
            $image = trim($row[$imageIndex] ?? '');
            $id = $idIndex !== false ? intval($row[$idIndex]) : 0;
            
            // Validate
            if (empty($name)) {
                $results['errors'][] = "Line $lineNumber: Name is required";
                $results['skipped']++;
                continue;
            }
            
            if ($price <= 0) {
                $results['errors'][] = "Line $lineNumber: Invalid price";
                $results['skipped']++;
                continue;
            }
            
            if ($id > 0) {
                // Check if product exists
                $stmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
                $stmt->execute([$id]);
                
                if ($stmt->fetch()) {
                    // Update existing
                    $stmt = $pdo->prepare("UPDATE products SET name = ?, description = ?, price = ?, material = ?, image = ? WHERE id = ?");
                    $stmt->execute([$name, $description, $price, $material ?: null, $image ?: null, $id]);
                    $results['updated']++;
                } else {
                    // ID provided but doesn't exist - create new
                    $stmt = $pdo->prepare("INSERT INTO products (name, description, price, material, image) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$name, $description, $price, $material ?: null, $image ?: null]);
                    $results['created']++;
                }
            } else {
                // Create new product
                $stmt = $pdo->prepare("INSERT INTO products (name, description, price, material, image) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$name, $description, $price, $material ?: null, $image ?: null]);
                $results['created']++;
            }
            
        } catch (PDOException $e) {
            $results['errors'][] = "Line $lineNumber: " . $e->getMessage();
            $results['skipped']++;
        }
    }
    
    $pdo->commit();
    fclose($handle);
    
    echo json_encode([
        'success' => true,
        'message' => "Import completed: {$results['created']} created, {$results['updated']} updated, {$results['skipped']} skipped",
        'details' => $results
    ]);
}

/**
 * Download CSV template
 */
function downloadTemplate() {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="products_template.csv"');
    
    $output = fopen('php://output', 'w');
    
    // Add BOM for Excel UTF-8 compatibility
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    // Header row
    fputcsv($output, [
        'ID',
        'Name',
        'Description',
        'Price',
        'Material',
        'Image URL'
    ]);
    
    // Example rows
    fputcsv($output, ['', 'Áo Thun Nam', 'Áo thun cotton cao cấp', '299000', 'Cotton', '']);
    fputcsv($output, ['', 'Váy Nữ', 'Váy dự tiệc thanh lịch', '599000', 'Silk', '']);
    
    fclose($output);
    exit;
}
?>
