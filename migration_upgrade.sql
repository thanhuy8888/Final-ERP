-- =====================================================
-- FINAL_ERP Migration Script
-- Add erpiiiii.sql features to existing final_erp database
-- Preserves existing data and customer-facing functionality
-- =====================================================

USE `final_erp`;

-- =====================================================
-- 1. Upgrade USERS table - Add missing columns for ERP
-- =====================================================
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `full_name` VARCHAR(100) DEFAULT NULL AFTER `password`,
ADD COLUMN IF NOT EXISTS `phone` VARCHAR(20) DEFAULT NULL AFTER `full_name`,
ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN NOT NULL DEFAULT TRUE AFTER `role`,
ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Update role enum to include 'sales'
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin', 'customer', 'sales') DEFAULT 'customer';

-- =====================================================
-- 2. CUSTOMER Table (for loyalty program)
-- =====================================================
CREATE TABLE IF NOT EXISTS `customers` (
    `customer_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT DEFAULT NULL,
    `phone_number` VARCHAR(20) NOT NULL UNIQUE,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100),
    `membership_tier` ENUM('Silver', 'Gold', 'Diamond') NOT NULL DEFAULT 'Silver',
    `total_points` INT NOT NULL DEFAULT 0,
    `registered_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_phone` (`phone_number`),
    INDEX `idx_membership` (`membership_tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 3. STORE Table (for multi-store)
-- =====================================================
CREATE TABLE IF NOT EXISTS `stores` (
    `store_id` INT AUTO_INCREMENT PRIMARY KEY,
    `store_code` VARCHAR(20) NOT NULL UNIQUE,
    `store_name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20),
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_store_code` (`store_code`),
    INDEX `idx_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default store
INSERT INTO `stores` (`store_code`, `store_name`, `address`, `city`) VALUES
('STORE001', 'Canifa - Cửa hàng chính', '123 Đường Nguyễn Huệ, Quận 1', 'Hồ Chí Minh')
ON DUPLICATE KEY UPDATE `store_name` = VALUES(`store_name`);

-- =====================================================
-- 4. Upgrade PRODUCTS table - Add SKU, Barcode, Material
-- =====================================================
ALTER TABLE `products`
ADD COLUMN IF NOT EXISTS `sku` VARCHAR(50) DEFAULT NULL AFTER `id`,
ADD COLUMN IF NOT EXISTS `barcode` VARCHAR(50) DEFAULT NULL AFTER `sku`,
ADD COLUMN IF NOT EXISTS `material` VARCHAR(100) DEFAULT NULL AFTER `description`,
ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`,
ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Generate SKU for existing products
UPDATE `products` SET `sku` = CONCAT('SKU-', LPAD(id, 6, '0')) WHERE `sku` IS NULL;
UPDATE `products` SET `barcode` = CONCAT('8938500', LPAD(id, 6, '0')) WHERE `barcode` IS NULL;

-- Add unique indexes
-- ALTER TABLE `products` ADD UNIQUE INDEX `idx_sku` (`sku`);
-- ALTER TABLE `products` ADD UNIQUE INDEX `idx_barcode` (`barcode`);

-- =====================================================
-- 5. PRODUCT_VARIANT Table (Size/Color)
-- =====================================================
CREATE TABLE IF NOT EXISTS `product_variants` (
    `variant_id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `size` VARCHAR(10) NOT NULL COMMENT 'S, M, L, XL, XXL',
    `color` VARCHAR(50) NOT NULL,
    `color_code` VARCHAR(7) DEFAULT NULL COMMENT 'Hex color code',
    `variant_sku` VARCHAR(50) NOT NULL UNIQUE,
    `price_adjustment` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    INDEX `idx_product_id` (`product_id`),
    INDEX `idx_size_color` (`size`, `color`),
    UNIQUE KEY `uk_product_size_color` (`product_id`, `size`, `color`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 6. INVENTORY Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `inventory` (
    `inventory_id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `variant_id` INT DEFAULT NULL,
    `store_id` INT NOT NULL DEFAULT 1,
    `quantity_on_hand` INT NOT NULL DEFAULT 0,
    `reserved_quantity` INT NOT NULL DEFAULT 0,
    `low_stock_threshold` INT NOT NULL DEFAULT 10,
    `last_updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`variant_id`) ON DELETE CASCADE,
    FOREIGN KEY (`store_id`) REFERENCES `stores`(`store_id`) ON DELETE RESTRICT,
    INDEX `idx_product_id` (`product_id`),
    INDEX `idx_variant_id` (`variant_id`),
    INDEX `idx_store_id` (`store_id`),
    UNIQUE KEY `uk_product_variant_store` (`product_id`, `variant_id`, `store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 7. STOCK_ADJUSTMENT Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `stock_adjustments` (
    `adjustment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `inventory_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `adjustment_type` ENUM('Initial', 'Addition', 'Deduction', 'Transfer', 'Sale', 'Return') NOT NULL,
    `quantity_change` INT NOT NULL,
    `reason` VARCHAR(255),
    `reference_number` VARCHAR(50),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`inventory_id`) ON DELETE RESTRICT,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idx_inventory_id` (`inventory_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 8. PROMOTIONS Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `promotions` (
    `promotion_id` INT AUTO_INCREMENT PRIMARY KEY,
    `promotion_code` VARCHAR(50) NOT NULL UNIQUE,
    `promotion_name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `discount_type` ENUM('Percentage', 'Fixed Amount') NOT NULL,
    `discount_value` DECIMAL(10, 2) NOT NULL,
    `min_purchase_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `max_discount_amount` DECIMAL(10, 2) DEFAULT NULL,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `usage_limit` INT DEFAULT NULL,
    `usage_count` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_promotion_code` (`promotion_code`),
    INDEX `idx_dates` (`start_date`, `end_date`),
    INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 9. PROMOTION_PRODUCTS Table (link promotions to products/categories)
-- =====================================================
CREATE TABLE IF NOT EXISTS `promotion_products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `promotion_id` INT NOT NULL,
    `product_id` INT DEFAULT NULL,
    `category_id` INT DEFAULT NULL,
    `apply_to` ENUM('Product', 'Category', 'All') NOT NULL DEFAULT 'Product',
    FOREIGN KEY (`promotion_id`) REFERENCES `promotions`(`promotion_id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
    INDEX `idx_promotion_id` (`promotion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 10. Upgrade ORDERS table
-- =====================================================
ALTER TABLE `orders`
ADD COLUMN IF NOT EXISTS `store_id` INT DEFAULT 1 AFTER `user_id`,
ADD COLUMN IF NOT EXISTS `customer_id` INT DEFAULT NULL AFTER `store_id`,
ADD COLUMN IF NOT EXISTS `promotion_id` INT DEFAULT NULL AFTER `customer_id`,
ADD COLUMN IF NOT EXISTS `subtotal` DECIMAL(10, 2) DEFAULT 0.00 AFTER `promotion_id`,
ADD COLUMN IF NOT EXISTS `discount_amount` DECIMAL(10, 2) DEFAULT 0.00 AFTER `subtotal`,
ADD COLUMN IF NOT EXISTS `tax_amount` DECIMAL(10, 2) DEFAULT 0.00 AFTER `discount_amount`,
ADD COLUMN IF NOT EXISTS `payment_method` ENUM('Cash', 'Card', 'QR', 'Transfer') DEFAULT 'Cash' AFTER `status`,
ADD COLUMN IF NOT EXISTS `notes` TEXT AFTER `payment_method`;

-- =====================================================
-- 11. Upgrade ORDER_ITEMS table
-- =====================================================
ALTER TABLE `order_items`
ADD COLUMN IF NOT EXISTS `variant_id` INT DEFAULT NULL AFTER `product_id`,
ADD COLUMN IF NOT EXISTS `discount_amount` DECIMAL(10, 2) DEFAULT 0.00 AFTER `price`;

-- =====================================================
-- 12. RETURNS Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `returns` (
    `return_id` INT AUTO_INCREMENT PRIMARY KEY,
    `return_number` VARCHAR(50) NOT NULL UNIQUE,
    `order_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `return_type` ENUM('Return', 'Exchange') NOT NULL,
    `refund_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `reason` TEXT,
    `status` ENUM('Pending', 'Approved', 'Rejected', 'Completed') NOT NULL DEFAULT 'Pending',
    `return_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `processed_at` DATETIME DEFAULT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 13. RETURN_ITEMS Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `return_items` (
    `return_item_id` INT AUTO_INCREMENT PRIMARY KEY,
    `return_id` INT NOT NULL,
    `order_item_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `refund_amount` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`return_id`) REFERENCES `returns`(`return_id`) ON DELETE CASCADE,
    FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON DELETE RESTRICT,
    INDEX `idx_return_id` (`return_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 14. LOYALTY_POINTS Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `loyalty_points` (
    `point_id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_id` INT NOT NULL,
    `order_id` INT DEFAULT NULL,
    `points_earned` INT NOT NULL DEFAULT 0,
    `points_used` INT NOT NULL DEFAULT 0,
    `points_balance` INT NOT NULL,
    `transaction_type` ENUM('Earn', 'Redeem', 'Adjustment', 'Expired') NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE CASCADE,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL,
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 15. AUDIT_LOG Table
-- =====================================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `log_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `action_type` ENUM('Create', 'Update', 'Delete', 'Login', 'Logout', 'Price Change', 'Stock Adjustment') NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` INT NOT NULL,
    `old_value` TEXT,
    `new_value` TEXT,
    `ip_address` VARCHAR(45),
    `user_agent` VARCHAR(255),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_action_type` (`action_type`),
    INDEX `idx_entity` (`entity_type`, `entity_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 16. Insert sample variants for existing products
-- =====================================================
INSERT IGNORE INTO `product_variants` (`product_id`, `size`, `color`, `color_code`, `variant_sku`) 
SELECT 
    p.id,
    s.size,
    c.color,
    c.color_code,
    CONCAT(COALESCE(p.sku, CONCAT('SKU-', LPAD(p.id, 6, '0'))), '-', s.size, '-', SUBSTRING(c.color, 1, 3))
FROM `products` p
CROSS JOIN (SELECT 'S' as size UNION SELECT 'M' UNION SELECT 'L' UNION SELECT 'XL') s
CROSS JOIN (SELECT 'Đen' as color, '#000000' as color_code UNION SELECT 'Trắng', '#FFFFFF' UNION SELECT 'Xám', '#808080') c
WHERE NOT EXISTS (
    SELECT 1 FROM `product_variants` pv 
    WHERE pv.product_id = p.id AND pv.size = s.size AND pv.color = c.color
);

-- =====================================================
-- 17. Initialize inventory for existing products
-- =====================================================
INSERT IGNORE INTO `inventory` (`product_id`, `variant_id`, `store_id`, `quantity_on_hand`)
SELECT 
    pv.product_id,
    pv.variant_id,
    1,
    FLOOR(RAND() * 50) + 10
FROM `product_variants` pv
WHERE NOT EXISTS (
    SELECT 1 FROM `inventory` i 
    WHERE i.product_id = pv.product_id AND i.variant_id = pv.variant_id
);

-- =====================================================
-- 18. Insert sample promotions
-- =====================================================
INSERT INTO `promotions` (`promotion_code`, `promotion_name`, `description`, `discount_type`, `discount_value`, `min_purchase_amount`, `start_date`, `end_date`, `is_active`) VALUES
('WELCOME10', 'Giảm 10% cho khách mới', 'Áp dụng cho đơn hàng đầu tiên', 'Percentage', 10.00, 0.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
('SALE50K', 'Giảm 50.000đ', 'Áp dụng cho đơn từ 500.000đ', 'Fixed Amount', 50000.00, 500000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
('NEWYEAR25', 'Năm mới giảm 25%', 'Chương trình khuyến mãi năm mới', 'Percentage', 25.00, 300000.00, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), TRUE)
ON DUPLICATE KEY UPDATE `promotion_name` = VALUES(`promotion_name`);

-- =====================================================
-- Done! Database upgraded successfully
-- =====================================================
