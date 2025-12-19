<?php
require_once '../../includes/db.php';
try {
    echo "--- Checking promotions table ---\n";
    $stmt = $pdo->query("DESCRIBE promotions");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "Table error: " . $e->getMessage();
}
?>
