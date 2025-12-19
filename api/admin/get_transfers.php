<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-language");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json; charset=UTF-8");

require_once '../../includes/db.php';

try {
    // Basic query - Join with Products and Users for readable names
    // Note: Since we don't have a rigid 'stores' table description, I will fetch IDs. 
    // Ideally we join stores table. Assuming 'stores' table exists or we just return IDs for frontend mapping.
    // Let's assume we join products.
    
    $sql = "SELECT 
                st.*,
                p.name as product_name,
                p.image,
                u.username as created_by_name,
                s1.store_name as from_store_name,
                s2.store_name as to_store_name
            FROM stock_transfers st
            JOIN products p ON st.product_id = p.id
            JOIN users u ON st.created_by = u.id
            LEFT JOIN stores s1 ON st.from_store_id = s1.store_id
            LEFT JOIN stores s2 ON st.to_store_id = s2.store_id
            ORDER BY st.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $transfers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($transfers);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error: " . $e->getMessage()]);
}
?>
