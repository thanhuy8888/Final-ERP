<?php
require_once '../includes/api_header.php';
require_once '../includes/db.php';

try {
    // Fetch all products
    $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Add full image path if needed, or just return as is
    // Assuming images are stored in 'uploads/' or 'assets/images/' relative to root
    // Frontend will handle base URL
    
    echo json_encode($products);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
