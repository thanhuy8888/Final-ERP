<?php
require_once '../../includes/db.php';

try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Add parent_id
    try {
        $pdo->exec("ALTER TABLE categories ADD COLUMN parent_id INT DEFAULT NULL AFTER id");
        echo "Column 'parent_id' added successfully.<br>";
        $pdo->exec("ALTER TABLE categories ADD CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL");
        echo "Foreign key 'fk_category_parent' added successfully.<br>";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') { // Duplicate column name
            echo "Column 'parent_id' already exists.<br>";
        } else {
            throw $e;
        }
    }

    // Add status
    try {
        $pdo->exec("ALTER TABLE categories ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' AFTER description");
        echo "Column 'status' added successfully.<br>";
    } catch (PDOException $e) {
        if ($e->getCode() == '42S21') {
            echo "Column 'status' already exists.<br>";
        } else {
            throw $e;
        }
    }

    echo "Database update completed.";

} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}
?>
