<?php
require_once __DIR__ . '/../includes/db.php';

echo "=== Seeding Stores and Inventory ===\n";

try {
    $pdo->beginTransaction();

    // 1. Create Stores
    $newStores = [
        'Canifa - Aeon Long Biên', 
        'Canifa - Times City', 
        'Canifa - Royal City',
        'Canifa - Cầu Giấy'
    ];

    $storeIds = [];

    foreach ($newStores as $name) {
        $stmt = $pdo->prepare("SELECT store_id FROM stores WHERE store_name = ?");
        $stmt->execute([$name]);
        $store = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($store) {
            $id = $store['store_id'];
            echo "Store '$name' already exists (ID: $id).\n";
        } else {
            // Generate simple code
            $code = strtoupper(substr(str_replace([' ', '-'], '_', $term = iconv('UTF-8', 'ASCII//TRANSLIT', $name)), 0, 10)) . rand(10,99);
            
            // Or just simple hardcoded mapping since list is small
            if (strpos($name, 'Aeon') !== false) $code = 'CNF_AEON';
            elseif (strpos($name, 'Times') !== false) $code = 'CNF_TIMES';
            elseif (strpos($name, 'Royal') !== false) $code = 'CNF_ROYAL';
            elseif (strpos($name, 'Cầu Giấy') !== false) $code = 'CNF_CG';
            else $code = 'CNF_' . rand(100,999);

            $stmt = $pdo->prepare("INSERT INTO stores (store_name, store_code) VALUES (?, ?)");
            $stmt->execute([$name, $code]);
            $id = $pdo->lastInsertId();
            echo "Created Store '$name' ($code) (ID: $id).\n";
        }
        $storeIds[$id] = $name;
    }

    // 2. Clear existing inventory for these new stores to avoid duplicates/confusion during re-runs
    // (Optional, but good for clean slate testing. We won't delete the main store's data though).
    // Let's just UPSERT or ignore if exists.

    // 3. Populate Inventory
    // Get all products
    $stmt = $pdo->query("SELECT id, name FROM products");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get all variants
    $stmt = $pdo->query("SELECT variant_id, product_id, size, color FROM product_variants");
    $variantsRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group variants by product
    $variantsByProduct = [];
    foreach ($variantsRaw as $v) {
        $variantsByProduct[$v['product_id']][] = $v;
    }

    foreach ($storeIds as $storeId => $storeName) {
        if (strpos($storeName, 'Cửa hàng chính') !== false) continue; // Skip main store if it's in our list (it's likely not)

        echo "Populating inventory for $storeName...\n";
        $count = 0;

        foreach ($products as $p) {
            $pid = $p['id'];
            
            // Check if product has variants
            if (isset($variantsByProduct[$pid]) && count($variantsByProduct[$pid]) > 0) {
                foreach ($variantsByProduct[$pid] as $v) {
                    $qty = rand(0, 20); // Mostly low stock for testing
                    
                    // Force some "Low Stock" scenarios (1-5)
                    if (rand(1, 10) > 7) $qty = rand(1, 5); 
                    
                    // Insert inventory
                    insertInventory($pdo, $pid, $v['variant_id'], $storeId, $qty);
                    $count++;
                }
            } else {
                // Product without variants
                $qty = rand(0, 15);
                insertInventory($pdo, $pid, null, $storeId, $qty);
                $count++;
            }
        }
        echo "  -> Added/Updated $count inventory items.\n";
    }

    $pdo->commit();
    echo "\n=== Seeding Complete Successfully ===\n";

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}

function insertInventory($pdo, $productId, $variantId, $storeId, $qty) {
    // Check if exists
    $sqlCheck = "SELECT inventory_id FROM inventory WHERE store_id = ? AND product_id = ? AND ";
    $params = [$storeId, $productId];
    
    if ($variantId) {
        $sqlCheck .= "variant_id = ?";
        $params[] = $variantId;
    } else {
        $sqlCheck .= "variant_id IS NULL";
    }

    $stmt = $pdo->prepare($sqlCheck);
    $stmt->execute($params);
    $exists = $stmt->fetch();

    if ($exists) {
        // Update
        $sqlUpdate = "UPDATE inventory SET quantity_on_hand = ? WHERE inventory_id = ?";
        $pdo->prepare($sqlUpdate)->execute([$qty, $exists['inventory_id']]);
    } else {
        // Insert
        $sqlInsert = "INSERT INTO inventory (store_id, product_id, variant_id, quantity_on_hand) VALUES (?, ?, ?, ?)";
        $pdo->prepare($sqlInsert)->execute([$storeId, $productId, $variantId, $qty]);
    }
}
?>
