<?php
require_once '../../includes/db.php';

try {
    $pdo->beginTransaction();

    // 1. Get all active stores (excluding store 4 which already has data, if we want to preserve it, or just ignore duplicates)
    $stmt = $pdo->query("SELECT store_id, store_name FROM stores WHERE is_active = 1");
    $stores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Get all products and variants
    // Products without variants
    $stmt = $pdo->query("SELECT id as product_id, sku FROM products");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get variants
    $stmt = $pdo->query("SELECT product_id, variant_id, variant_sku FROM product_variants");
    $variants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $inserted = 0;

    foreach ($stores as $store) {
        $store_id = $store['store_id'];
        
        // Skip store 4 if you don't want to mess with it, or just let ON DUPLICATE KEY handling take care of it?
        // User said "only store 4 has stock", so let's skip 4 to be safe or just add to others.
        if ($store_id == 4) continue; 

        // Insert for simple products (if logic supports products without variants having inventory directly)
        // Check if our inventory logic puts stock on parent product or only variants.
        // Usually if a product has variants, stock is on variants. If not, on product.
        // For simplicity of this seed, I'll just add stock for ALL products and ALL variants found.
        
        foreach ($products as $p) {
            // Check if this product has variants. If so, usually we don't hold stock on the parent.
            // But let's just insert 100 for everything for testing.
            
            // Upsert
            $sql = "INSERT INTO inventory (store_id, product_id, variant_id, quantity_on_hand, last_updated) 
                    VALUES (:sid, :pid, NULL, 100, NOW())
                    ON DUPLICATE KEY UPDATE quantity_on_hand = quantity_on_hand"; 
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':sid' => $store_id,
                ':pid' => $p['product_id']
            ]);
            $inserted++;
        }

        foreach ($variants as $v) {
            $sql = "INSERT INTO inventory (store_id, product_id, variant_id, quantity_on_hand, last_updated) 
                    VALUES (:sid, :pid, :vid, 100, NOW())
                    ON DUPLICATE KEY UPDATE quantity_on_hand = quantity_on_hand";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':sid' => $store_id,
                ':pid' => $v['product_id'],
                ':vid' => $v['variant_id']
            ]);
            $inserted++;
        }
    }

    $pdo->commit();
    echo "Successfully seeded inventory! Added/Checked $inserted records for " . count($stores) . " stores.";

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo "Error: " . $e->getMessage();
}
?>
