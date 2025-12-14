-- Add barcode and status to product_variants
SET @dbname = DATABASE();
SET @tablename = "product_variants";
SET @columnname = "barcode";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE product_variants ADD COLUMN barcode VARCHAR(50) NULL UNIQUE"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

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
  "ALTER TABLE product_variants ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Ensure sku is unique if not already (Optional, might fail if duplicates exist, so we skip strictly enforcing unique for now to avoid migration break, but we add index)
-- CREATE INDEX IF NOT EXISTS idx_variant_sku ON product_variants(sku);
