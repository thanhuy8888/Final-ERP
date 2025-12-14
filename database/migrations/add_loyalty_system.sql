-- Loyalty & Membership System Migration
-- Add loyalty features to customers table and create loyalty transactions table

-- Step 1: Add loyalty columns to customers table (safe version)
-- Check and add loyalty_points if not exists
SET @dbname = DATABASE();
SET @tablename = 'customers';
SET @columnname = 'loyalty_points';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE customers ADD COLUMN loyalty_points INT DEFAULT 0 COMMENT "Current loyalty points balance"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add membership_tier if not exists
SET @columnname = 'membership_tier';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE customers ADD COLUMN membership_tier ENUM("bronze", "silver", "gold", "platinum") DEFAULT "bronze" COMMENT "Membership tier based on lifetime spending"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add total_lifetime_spent if not exists
SET @columnname = 'total_lifetime_spent';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE customers ADD COLUMN total_lifetime_spent DECIMAL(15,2) DEFAULT 0 COMMENT "Total amount spent by customer"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Check and add tier_updated_at if not exists
SET @columnname = 'tier_updated_at';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE customers ADD COLUMN tier_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT "Last tier update timestamp"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Step 2: Create loyalty_transactions table for points history
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_id INT DEFAULT NULL,
    points_earned INT DEFAULT 0 COMMENT 'Points earned in this transaction',
    points_redeemed INT DEFAULT 0 COMMENT 'Points redeemed in this transaction',
    transaction_type ENUM('earn', 'redeem', 'expire', 'adjust') NOT NULL COMMENT 'Type of loyalty transaction',
    description VARCHAR(255) DEFAULT NULL COMMENT 'Transaction description',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id),
    INDEX idx_order_id (order_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Update existing customers to have default loyalty values
UPDATE customers 
SET loyalty_points = 0, 
    membership_tier = 'bronze', 
    total_lifetime_spent = 0,
    tier_updated_at = CURRENT_TIMESTAMP
WHERE loyalty_points IS NULL;

-- Step 4: Calculate total_lifetime_spent for existing customers
UPDATE customers c
SET total_lifetime_spent = (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM orders o
    WHERE o.customer_id = c.id AND o.status = 'completed'
);

-- Step 5: Auto-upgrade tiers based on existing spending
UPDATE customers 
SET membership_tier = CASE
    WHEN total_lifetime_spent >= 50000000 THEN 'platinum'
    WHEN total_lifetime_spent >= 20000000 THEN 'gold'
    WHEN total_lifetime_spent >= 5000000 THEN 'silver'
    ELSE 'bronze'
END,
tier_updated_at = CURRENT_TIMESTAMP;

-- Verification queries
SELECT 'Customers table updated' as status, COUNT(*) as customer_count FROM customers;
SELECT 'Loyalty transactions table created' as status, COUNT(*) as transaction_count FROM loyalty_transactions;
SELECT membership_tier, COUNT(*) as count FROM customers GROUP BY membership_tier;
