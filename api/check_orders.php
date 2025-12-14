<?php
require_once '../includes/db.php';
$stmt = $pdo->query("SELECT id, total_amount, created_at, shipping_address FROM orders ORDER BY id DESC LIMIT 5");
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<pre>" . print_r($orders, true) . "</pre>";
?>
