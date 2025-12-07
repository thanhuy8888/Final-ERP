-- =====================================================
-- Sales Role Migration Script for Final-ERP
-- Run this SQL in phpMyAdmin or MySQL CLI
-- =====================================================

-- Add 'sale' to the existing role enum if not exists
-- First, check and modify the users table role column
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'customer', 'sale') NOT NULL DEFAULT 'customer';

-- Add sale_id column to orders table to track which salesperson created the order
ALTER TABLE orders 
ADD COLUMN sale_id INT NULL AFTER user_id,
ADD INDEX idx_sale_id (sale_id);

-- Add shipping_address column if not exists
ALTER TABLE orders 
ADD COLUMN shipping_address TEXT NULL AFTER notes;

-- Create customers table for customer management
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    notes TEXT,
    created_by INT NULL COMMENT 'Sale user who created this customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create sales_targets table for tracking sales performance
CREATE TABLE IF NOT EXISTS sales_targets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    target_month DATE NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    achieved_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_sale_month (sale_id, target_month),
    INDEX idx_sale_id (sale_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample: Create a sale user for testing
-- Password: sale123
INSERT INTO users (username, password, email, role) 
SELECT 'saleuser', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'saleuser@example.com', 'sale'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'saleuser');
