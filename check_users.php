<?php
require_once 'includes/db.php';

// Create test user for checkout testing
$username = 'testuser';
$password = password_hash('test123', PASSWORD_DEFAULT);
$email = 'testuser@example.com';

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, 'customer')");
    $stmt->execute([$username, $password, $email]);
    echo "Test user created successfully!\n";
    echo "Username: testuser\n";
    echo "Password: test123\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate') !== false) {
        echo "User already exists\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
