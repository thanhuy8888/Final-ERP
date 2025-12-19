<?php
require_once '../../includes/db.php';

try {
    echo "--- Checking audit_logs table ---\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM audit_logs");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total records: " . $result['total'] . "\n\n";
    
    if ($result['total'] > 0) {
        echo "--- Sample data ---\n";
        $stmt = $pdo->query("SELECT * FROM audit_logs LIMIT 5");
        print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
        echo "No data in audit_logs table. Creating sample data...\n";
        
        // Insert sample audit logs
        $sampleLogs = [
            ['users', 1, 'CREATE', null, 'New user created', 1, 'Admin User'],
            ['products', 5, 'UPDATE', 'price: 100000', 'price: 120000', 1, 'Admin User'],
            ['orders', 10, 'CREATE', null, 'New order placed', 2, 'Sales User'],
            ['inventory', 3, 'UPDATE', 'quantity: 50', 'quantity: 45', 1, 'Admin User'],
            ['customers', 8, 'DELETE', 'status: active', null, 1, 'Admin User']
        ];
        
        $insertStmt = $pdo->prepare("INSERT INTO audit_logs (entity_type, entity_id, action, old_value, new_value, user_id, user_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
        
        foreach ($sampleLogs as $log) {
            $insertStmt->execute($log);
        }
        
        echo "Inserted " . count($sampleLogs) . " sample audit logs.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
