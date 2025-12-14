<?php
require_once __DIR__ . '/../includes/db.php';

try {
    echo "Adding store_id column to users table...\n";
    // Add column if not exists
    $pdo->exec("ALTER TABLE users ADD COLUMN store_id INT DEFAULT 1");
    echo "Column added successfully.\n";

    // Set default store for existing users (e.g. store_id = 1)
    $stmt = $pdo->query("SELECT id FROM stores LIMIT 1");
    $defaultStore = $stmt->fetchColumn() ?: 1;

    $pdo->exec("UPDATE users SET store_id = $defaultStore WHERE store_id IS NULL OR store_id = 0");
    echo "Updated existing users to store_id = $defaultStore.\n";

} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        echo "Column already exists.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
