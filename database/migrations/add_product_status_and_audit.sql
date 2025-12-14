-- Add status column to products table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "products";
SET @columnname = "status";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE products ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active';"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'product', 'order'
    entity_id INT NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'status_change'
    old_value JSON,
    new_value JSON,
    user_id INT,
    user_name VARCHAR(100), -- Store snapshot of username in case user is deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_user (user_id)
);
