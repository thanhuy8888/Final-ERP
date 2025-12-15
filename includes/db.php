<?php
// Database Configuration for Final ERP System
// Educational Project - XAMPP Default Settings

$host = 'localhost';           // Database host (XAMPP default)
$dbname = 'final_erp';         // Database name (must match imported SQL)
$username = 'root';            // XAMPP default username
$password = '';                // XAMPP default password (empty)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>
