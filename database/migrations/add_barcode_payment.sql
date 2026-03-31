-- Add barcode and payment method support
-- Run this in phpMyAdmin SQL tab

-- Step 1: Add barcode column to products table
ALTER TABLE products 
ADD COLUMN barcode VARCHAR(50) UNIQUE AFTER id;

-- Add index for fast barcode lookup
CREATE INDEX idx_barcode ON products(barcode);

-- Step 2: Add payment_method column to orders table
ALTER TABLE orders 
ADD COLUMN payment_method ENUM('cash', 'card', 'qr') DEFAULT 'cash' AFTER status;

-- Step 3: Generate sample barcodes for existing products (optional)
UPDATE products 
SET barcode = CONCAT('BC', LPAD(id, 8, '0'))
WHERE barcode IS NULL;

-- Verify changes
SHOW COLUMNS FROM products LIKE 'barcode';
SHOW COLUMNS FROM orders LIKE 'payment_method';

-- Check sample data
SELECT id, name, barcode, stock FROM products LIMIT 5;
SELECT id, customer_id, total_amount, payment_method FROM orders LIMIT 5;
