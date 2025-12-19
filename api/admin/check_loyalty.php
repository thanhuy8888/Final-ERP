<?php
require_once '../../includes/db.php';
try {
    echo "--- Checking loyalty_logs ---\n";
    $stmt = $pdo->query("DESCRIBE loyalty_logs");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Table does not exist: " . $e->getMessage();
}
?>
