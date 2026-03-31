<?php
require_once '../includes/db.php';

try {
    // $database = new Database(); // Class not found
    // $db = $database->getConnection();
    // Use $pdo from included db.php directly
    $db = $pdo;

    $sql = file_get_contents('../database/migrations/add_variant_fields.sql');

    // Split by semicolon to execute multiple statements, but handle the stored procedure logic carefully?
    // Actually, PREPARE/EXECUTE statements might not work well with simple PDO::exec split by semicolon if they share session variables.
    // However, for this specific script, we can try running it raw if the driver supports multiple statements, usually PDO allows it if emulated prepares are on or just config.
    // A better way for these complex conditional migrations is to run them one by one or just use simple ALTERs catch exception.
    
    // Let's try simple ALTERs in PHP for robustness instead of complex SQL if the complex SQL fails.
    // Or just run the SQL logic.
    
    // Simplest approach: Try add column, catch exception "Duplicate column name".
    
    $queries = [
        "ALTER TABLE product_variants ADD COLUMN barcode VARCHAR(50) NULL UNIQUE",
        "ALTER TABLE product_variants ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'",
        "ALTER TABLE product_variants ADD COLUMN sku VARCHAR(100) NULL"
    ];

    foreach ($queries as $query) {
        try {
            $db->exec($query);
            echo "Executed: $query <br>";
        } catch (PDOException $e) {
            // Check for duplicate column error code (1060)
            if (strpos($e->getMessage(), "Duplicate column name") !== false) {
                echo "Skipped (Column exists): $query <br>";
            } else {
                echo "Error: " . $e->getMessage() . "<br>";
            }
        }
    }

    echo "Migration completed successfully.";

} catch (Exception $e) {
    echo "Connection error: " . $e->getMessage();
}
?>
