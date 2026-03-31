<?php
require_once __DIR__ . '/../includes/db.php';

echo "=== Adding Inventory Data for All Products ===\n\n";

try {
    // Get first store
    $stmt = $pdo->query("SELECT store_id, store_name FROM stores LIMIT 1");
    $store = $stmt->fetch();
    
    if (!$store) {
        echo "Error: No store found in database!\n";
        exit;
    }
    
    echo "Using store: {$store['store_name']} (ID: {$store['store_id']})\n\n";
    
    // Get all products
    $stmt = $pdo->query("SELECT id, name, sku FROM products");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($products) . " products\n\n";
    
    $added = 0;
    $skipped = 0;
    
    foreach ($products as $product) {
        // Check if inventory already exists
        $check = $pdo->prepare("SELECT COUNT(*) FROM inventory WHERE product_id = ? AND store_id = ?");
        $check->execute([$product['id'], $store['store_id']]);
        
        if ($check->fetchColumn() > 0) {
            echo "⏭️  Skipped: {$product['name']} (already exists)\n";
            $skipped++;
            continue;
        }
        
        // Generate random quantity (0-50)
        $quantity = rand(0, 50);
        
        // Insert inventory
        $insert = $pdo->prepare("
            INSERT INTO inventory (product_id, store_id, quantity_on_hand, variant_id) 
            VALUES (?, ?, ?, NULL)
        ");
        $insert->execute([$product['id'], $store['store_id'], $quantity]);
        
        $status = $quantity <= 5 ? '🔴' : ($quantity <= 10 ? '🟡' : '🟢');
        echo "$status Added: {$product['name']} ({$product['sku']}) - $quantity units\n";
        $added++;
    }
    
    echo "\n=== Summary ===\n";
    echo "✅ Added: $added products\n";
    echo "⏭️  Skipped: $skipped products\n";
    echo "\nDone! Refresh the Stock Lookup page to see all products.\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
