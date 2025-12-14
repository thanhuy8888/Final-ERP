<?php
require_once '../includes/db.php';

try {
    // Add columns if they don't exist
    $columns = [
        "ADD COLUMN shipping_address TEXT NULL",
        "ADD COLUMN notes TEXT NULL",
        "ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cod'"
    ];

    foreach ($columns as $sql) {
        try {
            $pdo->exec("ALTER TABLE orders $sql");
            echo "Executed: $sql <br>";
        } catch (PDOException $e) {
            // Ignore error if column already exists (SQLSTATE 42S21)
            echo "Skipped (likely exists): $sql - " . $e->getMessage() . "<br>";
        }
    }
    echo "Schema update completed.";
} catch (Exception $e) {
    echo "Fatal Error: " . $e->getMessage();
}
?>
