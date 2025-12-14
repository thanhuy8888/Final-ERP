<?php
require_once '../../includes/db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS inventory_adjustments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inventory_id INT NOT NULL,
        user_id INT NOT NULL,
        type ENUM('increase', 'decrease') NOT NULL,
        quantity INT NOT NULL,
        reason VARCHAR(50) NOT NULL,
        note TEXT,
        previous_stock INT NOT NULL,
        new_stock INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $pdo->exec($sql);
    echo "Table 'inventory_adjustments' created successfully.";
} catch (PDOException $e) {
    echo "Error creating table: " . $e->getMessage();
}
?>
