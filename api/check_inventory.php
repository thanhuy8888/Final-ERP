<?php
require_once __DIR__ . '/../includes/db.php';

echo "=== Checking Database ===\n\n";

// Check products
$stmt = $pdo->query("SELECT COUNT(*) as count FROM products");
$productCount = $stmt->fetch()['count'];
echo "Total Products: $productCount\n";

// Check inventory
$stmt = $pdo->query("SELECT COUNT(*) as count FROM inventory");
$inventoryCount = $stmt->fetch()['count'];
echo "Total Inventory Records: $inventoryCount\n";

// Check stores
$stmt = $pdo->query("SELECT COUNT(*) as count FROM stores");
$storeCount = $stmt->fetch()['count'];
echo "Total Stores: $storeCount\n\n";

// Show sample inventory data
echo "=== Sample Inventory Data ===\n";
$stmt = $pdo->query("
    SELECT i.*, p.name as product_name, p.sku, s.store_name 
    FROM inventory i 
    JOIN products p ON i.product_id = p.id 
    JOIN stores s ON i.store_id = s.store_id 
    LIMIT 5
");
$samples = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($samples as $item) {
    echo "- {$item['product_name']} ({$item['sku']}) at {$item['store_name']}: {$item['quantity_on_hand']} units\n";
}

// If inventory is empty, add sample data
if ($inventoryCount == 0 && $productCount > 0 && $storeCount > 0) {
    echo "\n=== Adding Sample Inventory Data ===\n";
    
    // Get first store
    $stmt = $pdo->query("SELECT store_id FROM stores LIMIT 1");
    $storeId = $stmt->fetch()['store_id'];
    
    // Get all products
    $stmt = $pdo->query("SELECT id FROM products");
    $products = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($products as $productId) {
        $quantity = rand(0, 50);
        $pdo->prepare("INSERT INTO inventory (product_id, store_id, quantity_on_hand) VALUES (?, ?, ?)")
            ->execute([$productId, $storeId, $quantity]);
        echo "Added inventory for product ID $productId: $quantity units\n";
    }
    
    echo "\nInventory data added successfully!\n";
}

echo "\n=== Done ===\n";
?>
