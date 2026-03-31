<?php
require_once '../../includes/db.php';

try {
    $stmt = $pdo->query("SELECT * FROM customers LIMIT 5");
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Count: " . count($customers) . "\n";
    echo "JSON Error: " . json_last_error_msg() . "\n";
    
    $json = json_encode($customers, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        echo "JSON Encode Failed: " . json_last_error_msg();
        print_r($customers);
    } else {
        echo $json;
    }

} catch (PDOException $e) {
    echo "DB Error: " . $e->getMessage();
}
?>
