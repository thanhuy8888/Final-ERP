<?php
require_once '../includes/db.php';
$stmt = $pdo->query("DESCRIBE stores");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
print_r($columns);
?>
