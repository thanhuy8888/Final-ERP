<?php
require_once 'includes/db.php';

// Reset admin password to 'admin'
$newPasswordHash = password_hash('admin', PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'admin'");
    $stmt->execute([$newPasswordHash]);
    
    if ($stmt->rowCount() > 0) {
        echo "Password reset successful for admin user\n";
    } else {
        echo "No admin user found, creating one...\n";
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role) VALUES ('admin', 'admin@example.com', ?, 'admin')");
        $stmt->execute([$newPasswordHash]);
        echo "Admin user created\n";
    }
    
    // Show all users
    $stmt = $pdo->query("SELECT id, username, email, role FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "\nCurrent users:\n";
    print_r($users);
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
