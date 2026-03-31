<?php
require_once __DIR__ . '/../includes/db.php';

try {
    $sql = file_get_contents(__DIR__ . '/../database/migrations/add_product_status_and_audit.sql');
    
    // Split by semicolon, but handle the complex procedure if needed. 
    // Since PDO can handle multiple statements if configured, or we try one by one.
    // However, the PREPARE statement logic in SQL usually requires direct execution or special handling.
    // For simplicity in generic PDO, we might just try running it.
    // But the SET/PREPARE block is best run as a raw query.
    
    $pdo->exec($sql);
    echo "Migration ran successfully.";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage();
}
?>
