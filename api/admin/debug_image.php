<?php
require_once '../../includes/db.php';
$stmt = $pdo->query("SELECT id, name, image FROM products LIMIT 5");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($products, JSON_PRETTY_PRINT);
?>
