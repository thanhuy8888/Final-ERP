-- =====================================================
-- CANIFA Fashion System - Consolidated Database Script
-- =====================================================

DROP DATABASE IF EXISTS final_erp;
CREATE DATABASE final_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE final_erp;

-- =====================================================
-- 1. USERS Table
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role ENUM('admin', 'customer', 'sale') NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- 2. CUSTOMERS Table
-- =====================================================
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    membership_tier ENUM('Silver', 'Gold', 'Diamond') NOT NULL DEFAULT 'Silver',
    total_points INT NOT NULL DEFAULT 0,
    created_by INT NULL COMMENT 'Sale user who created this customer',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_phone (phone),
    INDEX idx_membership (membership_tier)
) ENGINE=InnoDB;

-- =====================================================
-- 3. STORES Table
-- =====================================================
CREATE TABLE stores (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    store_code VARCHAR(20) NOT NULL UNIQUE,
    store_name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_store_code (store_code),
    INDEX idx_city (city)
) ENGINE=InnoDB;

-- =====================================================
-- 4. CATEGORIES Table
-- =====================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 5. PRODUCTS Table
-- =====================================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE,
    barcode VARCHAR(50) UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    image VARCHAR(255),
    material VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_sku (sku),
    INDEX idx_barcode (barcode),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- 6. PRODUCT_VARIANTS Table
-- =====================================================
CREATE TABLE product_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size VARCHAR(10) NOT NULL,
    color VARCHAR(50) NOT NULL,
    color_code VARCHAR(7),
    variant_sku VARCHAR(50) UNIQUE,
    quantity INT NOT NULL DEFAULT 0, -- Legacy simple stock
    price_adjustment DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uk_product_size_color (product_id, size, color)
) ENGINE=InnoDB;

-- =====================================================
-- 7. INVENTORY Table (Advanced Stock)
-- =====================================================
CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    variant_id INT DEFAULT NULL,
    store_id INT NOT NULL DEFAULT 1,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE RESTRICT,
    UNIQUE KEY uk_product_variant_store (product_id, variant_id, store_id)
) ENGINE=InnoDB;

-- =====================================================
-- 8. ORDERS Table
-- =====================================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL COMMENT 'Registered user (if any)',
    sale_id INT DEFAULT NULL COMMENT 'Salesperson who created order',
    customer_id INT DEFAULT NULL COMMENT 'CRM Customer ID',
    store_id INT DEFAULT 1,
    total_amount DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    payment_method ENUM('cod', 'cash', 'card', 'qr', 'transfer') NOT NULL DEFAULT 'cod',
    shipping_address TEXT,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (sale_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (store_id) REFERENCES stores(store_id),
    INDEX idx_status (status),
    INDEX idx_sale_id (sale_id)
) ENGINE=InnoDB;

-- =====================================================
-- 9. ORDER_ITEMS Table
-- =====================================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT DEFAULT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================
-- 10. RETURNS Table
-- =====================================================
CREATE TABLE returns (
    return_id INT AUTO_INCREMENT PRIMARY KEY,
    return_number VARCHAR(50) NOT NULL UNIQUE,
    order_id INT NOT NULL,
    user_id INT DEFAULT NULL COMMENT 'Admin/Sale processing return',
    reason TEXT,
    refund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    items JSON, -- Store returned items snapshot
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- 11. PROMOTIONS Table
-- =====================================================
CREATE TABLE promotions (
    promotion_id INT AUTO_INCREMENT PRIMARY KEY,
    promotion_code VARCHAR(50) NOT NULL UNIQUE,
    promotion_name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type ENUM('Percentage', 'Fixed Amount') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 12. DATA SEEDING
-- =====================================================

-- Categories
INSERT INTO categories (id, name) VALUES (1, 'Men'), (2, 'Women'), (3, 'Kids');

-- Store
INSERT INTO stores (store_code, store_name, address, city) VALUES 
('STORE001', 'Canifa - Cửa hàng chính', '123 Đường Nguyễn Huệ, Quận 1', 'Hồ Chí Minh');

-- Users (Password: 123456 / Password123)
-- Admin
INSERT INTO users (username, password, email, role) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'admin');

-- Sales
INSERT INTO users (username, password, email, role) VALUES 
('saleuser', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sale@example.com', 'sale');

-- Customer
INSERT INTO users (username, password, email, role) VALUES 
('customer_test', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer@example.com', 'customer');

-- Products
INSERT INTO products (category_id, name, description, price, image, material, sku, barcode) VALUES
(1, 'Áo Thun Nam Cotton', 'Basic cotton t-shirt', 199000, 'uploads/product_shirt_1.png', 'Cotton', 'SKU-001', '893001'),
(2, 'Váy Nữ Mùa Hè', 'Summer dress', 450000, 'uploads/product_dress_1.png', 'Silk', 'SKU-002', '893002'),
(3, 'Quần Short Bé Trai', 'Cool shorts', 150000, 'uploads/product_kids_1.png', 'Denim', 'SKU-003', '893003');

-- Inventory for Product 8 (ID 8 might need to be specific if tests rely on it. Let's make sure ID 8 exists by inserting enough or forcing ID)
-- Inserting dummy products to reach ID 8 if auto-increment starts at 1
INSERT INTO products (id, category_id, name, description, price, image) VALUES
(8, 1, 'Test Product ID 8', 'For Automated Testing', 100000, 'uploads/test_product.png')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Variants & Inventory for Product 8
INSERT INTO product_variants (product_id, size, color, quantity) VALUES (8, 'L', 'Blue', 100);
INSERT INTO inventory (product_id, store_id, quantity_on_hand) VALUES (8, 1, 50);
