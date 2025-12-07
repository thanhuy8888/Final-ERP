<?php
require_once 'includes/db.php';
function describe($pdo, $table) {
    echo "\nCOLUMNS IN $table TABLE:\n";
    try {
        $stmt = $pdo->query("DESCRIBE $table");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo $row['Field'] . "\n";
        }
    } catch (Exception $e) {
        echo "$table DOES NOT EXIST\n";
    }
}

describe($pdo, 'products');
describe($pdo, 'product_variants');
describe($pdo, 'returns');
?>
