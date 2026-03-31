<?php
require_once '../includes/db.php';

try {
    echo "Starting product seeding...\n";

    // 1. Update existing products with valid Unsplash images
    $updates = [
        1 => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', // T-shirt
        2 => 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800', // Dress
        3 => 'https://images.unsplash.com/photo-1519238806101-3da967812b19?w=800', // Kids shorts
        8 => 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'  // Test product
    ];

    $updateStmt = $pdo->prepare("UPDATE products SET image = ? WHERE id = ?");
    foreach ($updates as $id => $url) {
        $updateStmt->execute([$url, $id]);
        echo "Updated image for product ID $id\n";
    }

    // 2. Insert new diverse products for filter testing
    // Categories: 1=Men, 2=Women, 3=Kids
    $newProducts = [
        [
            'name' => 'Áo Khoác Denim Nam',
            'description' => 'Phong cách mạnh mẽ, bụi bặm',
            'price' => 750000,
            'category_id' => 1,
            'image' => 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800',
            'material' => 'Denim',
            'sku' => 'SKU-NEW-001',
            'barcode' => '893NEW001'
        ],
        [
            'name' => 'Quần Jeans Slim Fit',
            'description' => 'Co giãn thoải mái, tôn dáng',
            'price' => 550000,
            'category_id' => 1,
            'image' => 'https://images.unsplash.com/photo-1542272617-08f08630329e?w=800',
            'material' => 'Jean',
            'sku' => 'SKU-NEW-002',
            'barcode' => '893NEW002'
        ],
        [
            'name' => 'Áo Sơ Mi Linen',
            'description' => 'Thoáng mát cho ngày hè',
            'price' => 450000,
            'category_id' => 1,
            'image' => 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
            'material' => 'Linen',
            'sku' => 'SKU-NEW-003',
            'barcode' => '893NEW003'
        ],
        [
            'name' => 'Đầm Dự Tiệc Sang Trọng',
            'description' => 'Thiết kế tinh tế, quý phái',
            'price' => 1200000,
            'category_id' => 2,
            'image' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
            'material' => 'Silk',
            'sku' => 'SKU-NEW-004',
            'barcode' => '893NEW004'
        ],
        [
            'name' => 'Áo Len Nữ Cổ Lọ',
            'description' => 'Ấm áp, thời trang thu đông',
            'price' => 350000,
            'category_id' => 2,
            'image' => 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
            'material' => 'Wool',
            'sku' => 'SKU-NEW-005',
            'barcode' => '893NEW005'
        ],
        [
            'name' => 'Chân Váy Xếp Ly',
            'description' => 'Năng động, trẻ trung',
            'price' => 280000,
            'category_id' => 2,
            'image' => 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800',
            'material' => 'Polyester',
            'sku' => 'SKU-NEW-006',
            'barcode' => '893NEW006'
        ],
        [
            'name' => 'Áo Khoác Gió Trẻ Em',
            'description' => 'Chống nước, cản gió tốt',
            'price' => 250000,
            'category_id' => 3,
            'image' => 'https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?w=800',
            'material' => 'Nylon',
            'sku' => 'SKU-NEW-007',
            'barcode' => '893NEW007'
        ],
        [
            'name' => 'Bộ Đồ Thể Thao Bé Trai',
            'description' => 'Thoải mái vận động cả ngày',
            'price' => 320000,
            'category_id' => 3,
            'image' => 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800',
            'material' => 'Cotton',
            'sku' => 'SKU-NEW-008',
            'barcode' => '893NEW008'
        ],
        [
            'name' => 'Váy Công Chúa Bé Gái',
            'description' => 'Xinh xắn, đáng yêu',
            'price' => 420000,
            'category_id' => 3,
            'image' => 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800',
            'material' => 'Tulle',
            'sku' => 'SKU-NEW-009',
            'barcode' => '893NEW009'
        ]
    ];

    $insertStmt = $pdo->prepare("
        INSERT INTO products (name, description, price, category_id, image, material, sku, barcode) 
        VALUES (:name, :description, :price, :category_id, :image, :material, :sku, :barcode)
        ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            description = VALUES(description),
            price = VALUES(price),
            image = VALUES(image),
            material = VALUES(material)
    ");

    foreach ($newProducts as $product) {
        $insertStmt->execute($product);
        echo "Inserted/Updated product: " . $product['name'] . "\n";
    }

    echo "Seeding completed successfully!\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
