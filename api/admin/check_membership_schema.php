<?php
require_once '../../includes/db.php';
try {
    $stmt = $pdo->query("DESCRIBE customers");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($cols as $c) {
        if ($c['Field'] == 'membership_tier') print_r($c);
    }
    
    echo "\n--- Checking membership_tiers ---\n";
    $stmt = $pdo->query("DESCRIBE membership_tiers");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}
?>
