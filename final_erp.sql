-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 14, 2025 lúc 10:43 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Create database if not exists
--
CREATE DATABASE IF NOT EXISTS `final_erp` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

--
-- Use the database
--
USE `final_erp`;

--
-- Cơ sở dữ liệu: `final_erp`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `old_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_value`)),
  `new_value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_value`)),
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `entity_type`, `entity_id`, `action`, `old_value`, `new_value`, `user_id`, `user_name`, `created_at`) VALUES
(1, 'product', 18, 'create', 'null', '{\"name\":\"\\u00c1o s\\u01a1 mi unisex ng\\u01b0\\u1eddi l\\u1edbn hi\\u0300nh in Demon Slayer\",\"sku\":\"5TH25W003-SA952\",\"barcode\":\"893NEW010\",\"material\":\"Cotton\",\"description\":\"\\u00c1o s\\u01a1 mi unisex ng\\u01b0\\u1eddi l\\u1edbn hi\\u0300nh in Demon Slayer. Phom \\u00e1o relax th\\u1eddi trang, c\\u1ed5 b\\u1ebb ve hi\\u1ec7n \\u0111\\u1ea1i. M\\u00f9a s\\u1eafc trung t\\u00ednh ph\\u00f9 h\\u1ee3p c\\u1ea3 nam v\\u00e0 n\\u1eef. Ch\\u1ea5t li\\u1ec7u d\\u1ec7t thoi ki\\u1ec3u gi\\u00f3 Nylon pha m\\u1ec1m m\\u1ea1i, \\u0111\\u1ed9c \\u0111\\u00e1o.\",\"price\":\"599000\",\"category_id\":\"1\",\"image\":\"https:\\/\\/2885371169.e.cdneverest.net\\/catalog\\/product\\/5\\/t\\/5th25w003-sa952-m-2.webp\",\"id\":null,\"variants\":[]}', 1, 'admin', '2025-12-14 14:27:14'),
(2, 'product', 15, 'delete', '{\"id\":15,\"sku\":\"SKU-NEW-007\",\"barcode\":\"893NEW007\",\"name\":\"\\u00c1o Kho\\u00e1c Gi\\u00f3 Tr\\u1ebb Em\",\"description\":\"Ch\\u1ed1ng n\\u01b0\\u1edbc, c\\u1ea3n gi\\u00f3 t\\u1ed1t\",\"price\":\"250000.00\",\"category_id\":3,\"image\":\"https:\\/\\/yame.vn\\/cdn\\/shop\\/files\\/ao-khoac-non-branded-04-den-1174884707.jpg?v=1760780113&width=823\",\"material\":\"Nylon\",\"is_active\":1,\"created_at\":\"2025-12-12 21:52:08\",\"updated_at\":\"2025-12-13 21:25:27\",\"status\":\"active\"}', 'null', 1, 'admin', '2025-12-14 14:54:16'),
(3, 'product', 18, 'delete', '{\"id\":18,\"sku\":\"5TH25W003-SA952\",\"barcode\":\"893NEW010\",\"name\":\"\\u00c1o s\\u01a1 mi unisex ng\\u01b0\\u1eddi l\\u1edbn hi\\u0300nh in Demon Slayer\",\"description\":\"\\u00c1o s\\u01a1 mi unisex ng\\u01b0\\u1eddi l\\u1edbn hi\\u0300nh in Demon Slayer. Phom \\u00e1o relax th\\u1eddi trang, c\\u1ed5 b\\u1ebb ve hi\\u1ec7n \\u0111\\u1ea1i. M\\u00f9a s\\u1eafc trung t\\u00ednh ph\\u00f9 h\\u1ee3p c\\u1ea3 nam v\\u00e0 n\\u1eef. Ch\\u1ea5t li\\u1ec7u d\\u1ec7t thoi ki\\u1ec3u gi\\u00f3 Nylon pha m\\u1ec1m m\\u1ea1i, \\u0111\\u1ed9c \\u0111\\u00e1o.\",\"price\":\"599000.00\",\"category_id\":1,\"image\":\"https:\\/\\/2885371169.e.cdneverest.net\\/catalog\\/product\\/5\\/t\\/5th25w003-sa952-m-2.webp\",\"material\":\"Cotton\",\"is_active\":1,\"created_at\":\"2025-12-14 21:27:14\",\"updated_at\":\"2025-12-14 21:27:14\",\"status\":\"active\"}', 'null', 1, 'admin', '2025-12-14 15:10:10'),
(4, 'product', 9, 'status_change', '{\"status\":\"active\"}', '{\"status\":\"inactive\"}', 1, 'admin', '2025-12-14 15:15:15'),
(5, 'product', 9, 'status_change', '{\"status\":\"inactive\"}', '{\"status\":\"active\"}', 1, 'admin', '2025-12-14 15:15:16'),
(6, 'product', 9, 'status_change', '{\"status\":\"active\"}', '{\"status\":\"inactive\"}', 1, 'admin', '2025-12-14 15:15:18'),
(7, 'product', 9, 'status_change', '{\"status\":\"inactive\"}', '{\"status\":\"active\"}', 1, 'admin', '2025-12-14 15:15:19'),
(8, 'inventory', 66, 'STOCK_INCREASE', '2', '20', 1, NULL, '2025-12-14 16:45:32'),
(9, 'inventory', 65, 'STOCK_INCREASE', '8', '20', 1, NULL, '2025-12-14 16:46:07'),
(10, 'inventory', 63, 'STOCK_INCREASE', '7', '20', 1, NULL, '2025-12-14 16:47:53'),
(11, 'inventory', 65, 'STOCK_DECREASE', '20', '0', 1, NULL, '2025-12-14 16:51:21'),
(12, 'inventory', 63, 'STOCK_DECREASE', '20', '7', 1, NULL, '2025-12-14 16:55:47');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `name`, `description`, `status`, `created_at`) VALUES
(1, NULL, 'Men', NULL, 'active', '2025-12-12 20:59:25'),
(2, NULL, 'Women', NULL, 'active', '2025-12-12 20:59:25'),
(3, NULL, 'Kids', NULL, 'active', '2025-12-12 20:59:25'),
(4, 1, 'Nam trung niên', 'nhóm các người đàn ông tuổi từ 50', 'active', '2025-12-14 22:50:06');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `phone` varchar(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT 'other',
  `dob` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `membership_tier` enum('bronze','silver','gold','platinum','diamond') DEFAULT 'bronze',
  `total_points` int(11) NOT NULL DEFAULT 0,
  `created_by` int(11) DEFAULT NULL COMMENT 'Sale user who created this customer',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `loyalty_points` int(11) DEFAULT 0 COMMENT 'Current loyalty points balance',
  `total_lifetime_spent` decimal(15,2) DEFAULT 0.00 COMMENT 'Total amount spent by customer',
  `tier_updated_at` datetime DEFAULT current_timestamp() COMMENT 'Last tier update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customers`
--

INSERT INTO `customers` (`id`, `user_id`, `phone`, `full_name`, `email`, `gender`, `dob`, `address`, `city`, `membership_tier`, `total_points`, `created_by`, `created_at`, `updated_at`, `loyalty_points`, `total_lifetime_spent`, `tier_updated_at`) VALUES
(1, NULL, '0366874902', 'Thân Quang Huy', 'thanhuy@gmail.com', 'other', NULL, 'Bắc Ninh', '', 'platinum', 0, 2, '2025-12-13 09:38:11', '2025-12-15 02:34:43', 175114, 84807000.00, '2025-12-13 14:59:57'),
(2, NULL, '0999888777', 'Nguyễn Duy Đức', NULL, 'other', NULL, 'Cà Mau', NULL, 'silver', 0, 2, '2025-12-13 09:46:06', '2025-12-15 02:32:48', 3447, 2247000.00, '2025-12-13 14:59:57'),
(3, NULL, '0334525625', 'Mạc Long', 'longmac33@gmail.com', 'other', NULL, 'Hải Dương', 'BangKok', 'bronze', 0, 2, '2025-12-13 10:20:53', '2025-12-13 16:02:22', 900, 350000.00, '2025-12-13 14:59:57'),
(4, NULL, '0943482777', 'Trần Ánh Dương', 'detinatran@gmail.com', 'other', '2005-07-14', 'Long Biên', 'Hà Nội', 'gold', 0, 2, '2025-12-13 13:26:31', '2025-12-15 02:34:43', 6810, 6740000.00, '2025-12-13 15:17:45'),
(5, NULL, '0912345678', 'Phạm Minh Tài', 'minhtai.gold@gmail.com', 'male', '1990-05-15', 'Time City', 'Hà Nội', 'diamond', 5000, 2, '2025-12-15 02:19:25', '2025-12-15 02:32:48', 5000, 150000000.00, '2025-12-15 02:19:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory`
--

CREATE TABLE `inventory` (
  `inventory_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `store_id` int(11) NOT NULL DEFAULT 1,
  `quantity_on_hand` int(11) NOT NULL DEFAULT 0,
  `reserved_quantity` int(11) NOT NULL DEFAULT 0,
  `last_updated` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `inventory`
--

INSERT INTO `inventory` (`inventory_id`, `product_id`, `variant_id`, `store_id`, `quantity_on_hand`, `reserved_quantity`, `last_updated`) VALUES
(62, 1, NULL, 4, 5, 0, '2025-12-14 20:23:02'),
(63, 2, NULL, 4, 7, 0, '2025-12-14 23:55:47'),
(64, 3, NULL, 4, 3, 0, '2025-12-14 20:23:02'),
(65, 9, NULL, 4, 0, 0, '2025-12-14 23:51:21'),
(66, 10, NULL, 4, 20, 0, '2025-12-14 23:45:32'),
(67, 11, NULL, 4, 25, 0, '2025-12-14 20:23:02'),
(68, 12, NULL, 4, 45, 0, '2025-12-14 20:23:02'),
(69, 13, NULL, 4, 60, 0, '2025-12-14 20:23:02'),
(70, 14, NULL, 4, 30, 0, '2025-12-14 20:23:02'),
(72, 16, NULL, 4, 120, 0, '2025-12-14 20:23:02'),
(73, 17, NULL, 4, 150, 0, '2025-12-14 20:23:02'),
(74, 1, NULL, 1, 100, 0, '2025-12-15 00:23:38'),
(75, 2, NULL, 1, 100, 0, '2025-12-15 00:23:38'),
(76, 3, NULL, 1, 100, 0, '2025-12-15 00:23:38'),
(77, 9, NULL, 1, 100, 0, '2025-12-15 00:23:38'),
(78, 10, NULL, 1, 100, 0, '2025-12-15 00:23:38'),
(79, 11, NULL, 1, 100, 0, '2025-12-15 00:23:38'),
(80, 12, NULL, 1, 101, 0, '2025-12-15 01:51:11'),
(81, 13, NULL, 1, 100, 0, '2025-12-15 00:23:38'),
(82, 14, NULL, 1, 88, 0, '2025-12-15 00:35:25'),
(83, 16, NULL, 1, 100, 0, '2025-12-15 00:23:38'),
(84, 17, NULL, 1, 100, 0, '2025-12-15 00:23:38'),
(85, 9, 4, 1, 100, 0, '2025-12-15 00:23:38'),
(86, 1, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(87, 2, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(88, 3, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(89, 9, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(90, 10, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(91, 11, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(92, 12, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(93, 13, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(94, 14, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(95, 16, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(96, 17, NULL, 5, 100, 0, '2025-12-15 00:23:38'),
(97, 9, 4, 5, 100, 0, '2025-12-15 00:23:38'),
(98, 1, NULL, 6, 100, 0, '2025-12-15 00:23:38'),
(99, 2, NULL, 6, 100, 0, '2025-12-15 00:23:38'),
(100, 3, NULL, 6, 100, 0, '2025-12-15 00:23:38'),
(101, 9, NULL, 6, 100, 0, '2025-12-15 00:23:38'),
(102, 10, NULL, 6, 100, 0, '2025-12-15 00:23:38'),
(103, 11, NULL, 6, 100, 0, '2025-12-15 00:23:38'),
(104, 12, NULL, 6, 100, 0, '2025-12-15 00:23:38'),
(105, 13, NULL, 6, 100, 0, '2025-12-15 00:23:38'),
(106, 14, NULL, 6, 112, 0, '2025-12-15 00:35:28'),
(107, 16, NULL, 6, 100, 0, '2025-12-15 00:23:38'),
(108, 17, NULL, 6, 100, 0, '2025-12-15 00:23:38'),
(109, 9, 4, 6, 100, 0, '2025-12-15 00:23:38'),
(110, 1, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(111, 2, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(112, 3, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(113, 9, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(114, 10, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(115, 11, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(116, 12, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(117, 13, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(118, 14, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(119, 16, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(120, 17, NULL, 7, 100, 0, '2025-12-15 00:23:38'),
(121, 9, 4, 7, 100, 0, '2025-12-15 00:23:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_adjustments`
--

CREATE TABLE `inventory_adjustments` (
  `id` int(11) NOT NULL,
  `inventory_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('increase','decrease') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reason` varchar(50) NOT NULL,
  `note` text DEFAULT NULL,
  `previous_stock` int(11) NOT NULL,
  `new_stock` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `inventory_adjustments`
--

INSERT INTO `inventory_adjustments` (`id`, `inventory_id`, `user_id`, `type`, `quantity`, `reason`, `note`, `previous_stock`, `new_stock`, `created_at`) VALUES
(1, 66, 1, 'increase', 18, 'Lost / Missing items', '', 2, 20, '2025-12-14 16:45:32'),
(2, 65, 1, 'increase', 12, 'Initial stock import', '', 8, 20, '2025-12-14 16:46:07'),
(3, 63, 1, 'increase', 13, 'Lost / Missing items', '', 7, 20, '2025-12-14 16:47:53'),
(4, 65, 1, 'decrease', 20, 'Stock audit correction', '', 20, 0, '2025-12-14 16:51:21'),
(5, 63, 1, 'decrease', 13, 'Expired / Spoiled', '', 20, 7, '2025-12-14 16:55:47');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `loyalty_logs`
--

CREATE TABLE `loyalty_logs` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `points` int(11) NOT NULL,
  `type` enum('earn','redeem','adjust') NOT NULL,
  `reference_type` enum('order','manual') DEFAULT 'manual',
  `reference_id` varchar(50) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `loyalty_logs`
--

INSERT INTO `loyalty_logs` (`id`, `customer_id`, `points`, `type`, `reference_type`, `reference_id`, `reason`, `created_at`, `created_by`) VALUES
(1, 1, 175114, 'adjust', 'manual', NULL, 'Initial Balance Migration', '2025-12-15 02:44:38', NULL),
(2, 2, 3447, 'adjust', 'manual', NULL, 'Initial Balance Migration', '2025-12-15 02:44:38', NULL),
(3, 3, 900, 'adjust', 'manual', NULL, 'Initial Balance Migration', '2025-12-15 02:44:38', NULL),
(4, 4, 6810, 'adjust', 'manual', NULL, 'Initial Balance Migration', '2025-12-15 02:44:38', NULL),
(5, 5, 5000, 'adjust', 'manual', NULL, 'Initial Balance Migration', '2025-12-15 02:44:38', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `loyalty_transactions`
--

CREATE TABLE `loyalty_transactions` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `points_earned` int(11) DEFAULT 0 COMMENT 'Points earned in this transaction',
  `points_redeemed` int(11) DEFAULT 0 COMMENT 'Points redeemed in this transaction',
  `transaction_type` enum('earn','redeem','expire','adjust') NOT NULL COMMENT 'Type of loyalty transaction',
  `description` varchar(255) DEFAULT NULL COMMENT 'Transaction description',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `loyalty_transactions`
--

INSERT INTO `loyalty_transactions` (`id`, `customer_id`, `order_id`, `points_earned`, `points_redeemed`, `transaction_type`, `description`, `created_at`) VALUES
(1, 4, 126, 1200, 0, 'earn', 'Earned 1200 points from order #126', '2025-12-13 14:11:25'),
(2, 4, 127, 5190, 0, 'earn', 'Earned 5190 points from order #127', '2025-12-13 15:17:45'),
(3, 3, 128, 350, 0, 'earn', 'Earned 350 points from order #128', '2025-12-13 16:02:22'),
(4, 2, 129, 848, 0, 'earn', 'Earned 848 points from order #129', '2025-12-13 21:11:03'),
(5, 4, 132, 420, 0, 'earn', 'Earned 420 points from order #132', '2025-12-13 21:31:19'),
(6, 1, 133, 2400, 0, 'earn', 'Earned 2400 points from order #133', '2025-12-13 21:59:16'),
(7, 2, 134, 199, 0, 'earn', 'Earned 199 points from order #134', '2025-12-13 22:07:51'),
(8, 2, 147, 1200, 0, 'earn', 'Earned 1200 points from order #147', '2025-12-15 01:02:16');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `membership_tiers`
--

CREATE TABLE `membership_tiers` (
  `id` int(11) NOT NULL,
  `tier_key` varchar(20) NOT NULL,
  `tier_display` varchar(50) NOT NULL,
  `min_spent` decimal(15,2) DEFAULT 0.00,
  `bonus_rate` decimal(5,2) DEFAULT 1.00,
  `color_hex` varchar(10) DEFAULT '#000000',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `membership_tiers`
--

INSERT INTO `membership_tiers` (`id`, `tier_key`, `tier_display`, `min_spent`, `bonus_rate`, `color_hex`, `created_at`, `updated_at`) VALUES
(1, 'bronze', 'Bronze Member', 0.00, 1.00, '#fff7ed', '2025-12-15 02:25:25', '2025-12-15 02:25:25'),
(2, 'silver', 'Silver Member', 2000000.00, 1.10, '#f1f5f9', '2025-12-15 02:25:25', '2025-12-15 02:25:25'),
(3, 'gold', 'Gold Member', 5000000.00, 1.25, '#fef9c3', '2025-12-15 02:25:25', '2025-12-15 02:34:18'),
(4, 'platinum', 'Platinum Member', 30000000.00, 1.50, '#e0e7ff', '2025-12-15 02:25:25', '2025-12-15 02:25:25'),
(5, 'diamond', 'Diamond Member', 100000000.00, 2.00, '#ccfbf1', '2025-12-15 02:25:25', '2025-12-15 02:34:36');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL COMMENT 'Registered user (if any)',
  `sale_id` int(11) DEFAULT NULL COMMENT 'Salesperson who created order',
  `customer_id` int(11) DEFAULT NULL COMMENT 'CRM Customer ID',
  `store_id` int(11) DEFAULT 1,
  `total_amount` decimal(15,2) NOT NULL,
  `subtotal` decimal(15,2) DEFAULT 0.00,
  `discount_amount` decimal(15,2) DEFAULT 0.00,
  `tax_amount` decimal(15,2) DEFAULT 0.00,
  `status` enum('pending','confirmed','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` enum('cod','cash','card','qr','transfer') NOT NULL DEFAULT 'cod',
  `shipping_address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `sale_id`, `customer_id`, `store_id`, `total_amount`, `subtotal`, `discount_amount`, `tax_amount`, `status`, `payment_method`, `shipping_address`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, NULL, NULL, 1, 280000.00, 0.00, 0.00, 0.00, 'pending', 'cod', 'Người nhận: Mạc Văn Long, SĐT: 0342342342. Địa chỉ: 45 Hà Đông, Hà Nội', '', '2025-12-12 22:46:30', '2025-12-15 01:39:40'),
(2, 2, NULL, NULL, 1, 350000.00, 0.00, 0.00, 0.00, 'pending', 'cod', 'Người nhận: Mạc Long , SĐT: 0243234233. Địa chỉ: 55, Đà Nẵng', '', '2025-12-12 22:50:12', '2025-12-15 01:39:40'),
(3, 2, NULL, NULL, 1, 750000.00, 0.00, 0.00, 0.00, 'pending', 'cod', 'Người nhận: Mạc Long, SĐT: 0262674777. Địa chỉ: 66, Hà Nội', '', '2025-12-12 22:51:08', '2025-12-15 01:39:40'),
(4, 2, NULL, NULL, 1, 750000.00, 0.00, 0.00, 0.00, 'pending', 'cod', 'Người nhận: Mạc Long, SĐT: 0634534534. Địa chỉ: 88, Cần Thơ', '', '2025-12-12 22:54:14', '2025-12-15 01:39:40'),
(5, 4, NULL, NULL, 1, 750000.00, 0.00, 50000.00, 0.00, 'pending', 'cod', 'Người nhận: Mạc Long, SĐT: 0956888536. Địa chỉ: 66, Hà Nội', '', '2025-12-12 22:58:27', '2025-12-15 03:57:31'),
(26, 4, 2, 1, 1, 1200000.00, 0.00, 0.00, 0.00, 'confirmed', 'cod', 'Bắc Ninh', '', '2025-12-13 10:17:06', '2025-12-15 01:39:40'),
(27, 5, 2, 2, 1, 1200000.00, 0.00, 0.00, 0.00, 'confirmed', 'cod', 'API Address', '', '2025-12-13 10:18:03', '2025-12-15 01:39:40'),
(28, 4, 2, 3, 1, 550000.00, 0.00, 30000.00, 0.00, 'confirmed', 'cod', 'Hải Dương', '', '2025-12-13 10:20:53', '2025-12-15 03:57:31'),
(29, 5, 2, 1, 1, 350000.00, 0.00, 0.00, 0.00, 'confirmed', 'cod', 'Bắc Ninh', '', '2025-12-13 10:21:20', '2025-12-15 01:37:54'),
(30, 5, 2, 1, 1, 696000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-06-18 05:39:29', '2025-12-15 01:39:40'),
(31, 5, 2, 1, 1, 1232000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-06-12 05:39:29', '2025-12-15 01:39:40'),
(32, 4, 2, 1, 1, 915000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-06-20 05:39:29', '2025-12-15 01:39:40'),
(33, 5, 2, 1, 1, 1738000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-06-11 05:39:29', '2025-12-15 01:39:40'),
(34, 2, 2, 1, 1, 510000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-06-04 05:39:29', '2025-12-15 01:39:40'),
(35, 2, 2, 1, 1, 1344000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-06-08 05:39:29', '2025-12-15 01:39:40'),
(36, 5, 2, 1, 1, 1603000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-07-27 05:39:29', '2025-12-15 01:39:40'),
(37, 5, 2, 1, 1, 633000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-07-14 05:39:29', '2025-12-15 01:39:40'),
(38, 5, 2, 1, 1, 1972000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-07-28 05:39:29', '2025-12-15 01:39:40'),
(39, 4, 2, 1, 1, 957000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-07-09 05:39:29', '2025-12-15 01:39:40'),
(40, 4, 2, 1, 1, 1939000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-07-05 05:39:29', '2025-12-15 01:37:54'),
(41, 2, 2, 1, 1, 1253000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-07-28 05:39:29', '2025-12-15 01:39:40'),
(42, 5, 2, 1, 1, 1369000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-08-13 05:39:29', '2025-12-15 01:39:40'),
(43, 4, 2, 1, 1, 868000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-08-28 05:39:29', '2025-12-15 01:39:40'),
(44, 2, 2, 1, 1, 1792000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-08-17 05:39:29', '2025-12-15 01:39:40'),
(45, 2, 2, 1, 1, 1383000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-08-04 05:39:29', '2025-12-15 01:39:40'),
(46, 4, 2, 1, 1, 1700000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-08-15 05:39:29', '2025-12-15 01:39:40'),
(47, 2, 2, 1, 1, 1296000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-08-13 05:39:29', '2025-12-15 01:39:40'),
(48, 4, 2, 1, 1, 1924000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-09-23 05:39:29', '2025-12-15 01:39:40'),
(49, 4, 2, 1, 1, 1223000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-09-16 05:39:29', '2025-12-15 01:37:54'),
(50, 5, 2, 1, 1, 1822000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-09-11 05:39:29', '2025-12-15 01:39:40'),
(51, 2, 2, 1, 1, 700000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-09-16 05:39:29', '2025-12-15 01:37:54'),
(52, 2, 2, 1, 1, 1232000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-09-06 05:39:29', '2025-12-15 01:31:54'),
(53, 4, 2, 1, 1, 1502000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-09-06 05:39:29', '2025-12-15 01:39:40'),
(54, 5, 2, 1, 1, 1056000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-09-20 05:39:29', '2025-12-15 01:39:40'),
(55, 2, 2, 1, 1, 1200000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-09-24 05:39:29', '2025-12-15 01:39:40'),
(56, 5, 2, 1, 1, 672000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-07 05:39:29', '2025-12-15 01:39:40'),
(57, 5, 2, 1, 1, 587000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-02 05:39:29', '2025-12-15 01:37:56'),
(58, 5, 2, 1, 1, 731000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-13 05:39:29', '2025-12-15 01:37:56'),
(59, 5, 2, 1, 1, 1046000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-08 05:39:29', '2025-12-15 01:39:40'),
(60, 2, 2, 1, 1, 1282000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-10 05:39:29', '2025-12-15 01:39:40'),
(61, 5, 2, 1, 1, 1363000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-10 05:39:29', '2025-12-15 01:39:40'),
(62, 4, 2, 1, 1, 1130000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-13 05:39:29', '2025-12-15 01:39:40'),
(63, 4, 2, 1, 1, 1985000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-24 05:39:29', '2025-12-15 01:39:40'),
(64, 2, 2, 1, 1, 605000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-12 05:39:29', '2025-12-15 01:37:56'),
(65, 5, 2, 1, 1, 1512000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-05 05:39:29', '2025-12-15 01:39:40'),
(66, 4, 2, 1, 1, 1916000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-08 05:39:29', '2025-12-15 01:39:40'),
(67, 5, 2, 1, 1, 1971000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-19 05:39:29', '2025-12-15 01:39:40'),
(68, 4, 2, 1, 1, 722000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-15 05:39:29', '2025-12-15 01:39:40'),
(69, 4, 2, 1, 1, 1699000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-24 05:39:29', '2025-12-15 01:39:40'),
(70, 4, 2, 1, 1, 1162000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-25 05:39:29', '2025-12-15 01:39:40'),
(71, 2, 2, 1, 1, 549000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-11 05:39:29', '2025-12-15 01:39:40'),
(72, 2, 2, 1, 1, 1088000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-14 05:39:29', '2025-12-15 01:39:40'),
(73, 4, 2, 1, 1, 1663000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-13 05:39:29', '2025-12-15 01:39:40'),
(74, 5, 2, 1, 1, 565000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-14 05:39:29', '2025-12-15 01:37:56'),
(75, 2, 2, 1, 1, 538000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-16 05:39:29', '2025-12-15 01:39:40'),
(76, 5, 2, 1, 1, 936000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-18 05:39:29', '2025-12-15 01:39:40'),
(77, 4, 2, 1, 1, 619000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-20 05:39:29', '2025-12-15 01:37:56'),
(78, 2, 2, 1, 1, 296000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-25 05:39:29', '2025-12-15 01:39:40'),
(79, 5, 2, 1, 1, 851000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-22 05:39:29', '2025-12-15 01:39:40'),
(80, 2, 2, 1, 1, 554000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-19 05:39:29', '2025-12-15 01:39:40'),
(81, 4, 2, 1, 1, 477000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-26 05:39:29', '2025-12-15 01:39:40'),
(82, 5, 2, 1, 1, 326000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-01 05:39:29', '2025-12-15 01:39:40'),
(83, 4, 2, 1, 1, 819000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-31 05:39:29', '2025-12-15 01:39:40'),
(84, 2, 2, 1, 1, 384000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-29 05:39:29', '2025-12-15 01:39:40'),
(85, 4, 2, 1, 1, 523000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-10-29 05:39:29', '2025-12-15 01:39:40'),
(86, 4, 2, 1, 1, 218000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-07 05:39:29', '2025-12-15 01:39:40'),
(87, 5, 2, 1, 1, 528000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-04 05:39:29', '2025-12-15 01:39:40'),
(88, 4, 2, 1, 1, 422000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-07 05:39:29', '2025-12-15 01:39:40'),
(89, 4, 2, 1, 1, 990000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-07 05:39:29', '2025-12-15 01:39:40'),
(90, 4, 2, 1, 1, 489000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-03 05:39:29', '2025-12-15 01:39:40'),
(91, 2, 2, 1, 1, 434000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-05 05:39:29', '2025-12-15 01:39:40'),
(92, 4, 2, 1, 1, 316000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-06 05:39:29', '2025-12-15 01:39:40'),
(93, 4, 2, 1, 1, 689000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-12 05:39:29', '2025-12-15 01:39:40'),
(94, 5, 2, 1, 1, 436000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-12 05:39:29', '2025-12-15 01:39:40'),
(95, 5, 2, 1, 1, 703000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-10 05:39:29', '2025-12-15 01:37:56'),
(96, 2, 2, 1, 1, 496000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-12 05:39:29', '2025-12-15 01:39:40'),
(97, 5, 2, 1, 1, 206000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-10 05:39:29', '2025-12-15 01:39:40'),
(98, 4, 2, 1, 1, 565000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-09 05:39:29', '2025-12-15 01:37:56'),
(99, 5, 2, 1, 1, 995000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-18 05:39:29', '2025-12-15 01:39:40'),
(100, 4, 2, 1, 1, 534000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-20 05:39:29', '2025-12-15 01:39:40'),
(101, 2, 2, 1, 1, 436000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-21 05:39:29', '2025-12-15 01:37:56'),
(102, 5, 2, 1, 1, 448000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-16 05:39:29', '2025-12-15 01:39:40'),
(103, 4, 2, 1, 1, 941000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-22 05:39:29', '2025-12-15 01:39:40'),
(104, 5, 2, 1, 1, 603000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-28 05:39:29', '2025-12-15 01:39:40'),
(105, 5, 2, 1, 1, 357000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-26 05:39:29', '2025-12-15 01:39:40'),
(106, 5, 2, 1, 1, 339000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-26 05:39:29', '2025-12-15 01:39:40'),
(107, 4, 2, 1, 1, 403000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-23 05:39:29', '2025-12-15 01:37:56'),
(108, 4, 2, 1, 1, 273000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-25 05:39:29', '2025-12-15 01:39:40'),
(109, 4, 2, 1, 1, 826000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-24 05:39:29', '2025-12-15 01:39:40'),
(110, 4, 2, 1, 1, 725000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-11-24 05:39:29', '2025-12-15 01:39:40'),
(111, 4, 2, 1, 1, 631000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-03 05:39:29', '2025-12-15 01:39:40'),
(112, 4, 2, 1, 1, 804000.00, 0.00, 30000.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-03 05:39:29', '2025-12-15 03:57:31'),
(113, 5, 2, 1, 1, 858000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-04 05:39:29', '2025-12-15 01:39:40'),
(114, 4, 2, 1, 1, 413000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-01 05:39:29', '2025-12-15 01:39:40'),
(115, 4, 2, 1, 1, 419000.00, 0.00, 50000.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-06 05:39:29', '2025-12-15 03:57:31'),
(116, 2, 2, 1, 1, 793000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-04 05:39:29', '2025-12-15 01:39:40'),
(117, 4, 2, 1, 1, 471000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-05 05:39:29', '2025-12-15 01:39:40'),
(118, 4, 2, 1, 1, 500000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-07 05:39:29', '2025-12-15 01:39:40'),
(119, 4, 2, 1, 1, 832000.00, 0.00, 30000.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-12 05:39:29', '2025-12-15 03:57:31'),
(120, 5, 2, 1, 1, 599000.00, 0.00, 50000.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-09 05:39:29', '2025-12-15 03:57:31'),
(121, 5, 2, 1, 1, 613000.00, 0.00, 100000.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-10 05:39:29', '2025-12-15 03:57:31'),
(122, 4, 2, 1, 1, 234000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-11 05:39:29', '2025-12-15 01:39:40'),
(123, 4, 2, 1, 1, 200000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-07 05:39:29', '2025-12-15 01:39:40'),
(124, 5, 2, 1, 1, 438000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-10 05:39:29', '2025-12-15 01:39:40'),
(125, 2, 2, 1, 1, 1200000.00, 0.00, 0.00, 0.00, 'confirmed', 'cod', 'Bắc Ninh', '', '2025-12-13 13:01:43', '2025-12-15 01:39:40'),
(126, 5, 2, 4, 1, 1200000.00, 0.00, 0.00, 0.00, 'confirmed', 'cod', 'Long Biên', '', '2025-12-13 14:11:25', '2025-12-15 01:39:40'),
(127, 4, 2, 4, 1, 5190000.00, 0.00, 0.00, 0.00, 'confirmed', 'cod', 'Long Biên', '', '2025-12-13 15:17:45', '2025-12-15 01:39:40'),
(128, 4, 2, 3, 1, 350000.00, 0.00, 0.00, 0.00, 'confirmed', 'qr', 'Hải Dương', '', '2025-12-13 16:02:22', '2025-12-15 01:39:40'),
(129, 5, 2, 2, 1, 848000.00, 0.00, 0.00, 0.00, 'processing', 'cash', 'API Address', 'API Test Order', '2025-12-13 21:11:03', '2025-12-15 01:39:40'),
(132, 2, 2, 4, 1, 350000.00, 0.00, 0.00, 0.00, 'confirmed', 'cash', 'Long Biên', '', '2025-12-13 21:31:19', '2025-12-15 01:39:40'),
(133, 2, 2, 1, 1, 1200000.00, 0.00, 0.00, 0.00, 'confirmed', 'cash', 'Bắc Ninh', '', '2025-12-13 21:59:16', '2025-12-15 01:39:40'),
(134, 4, 2, 2, 1, 199000.00, 0.00, 0.00, 0.00, 'processing', 'qr', 'Cà Mau', '', '2025-12-13 22:07:51', '2025-12-15 01:39:40'),
(135, 5, NULL, NULL, 4, 450000.00, 0.00, 0.00, 0.00, 'cancelled', 'cod', NULL, NULL, '2025-12-12 14:23:02', '2025-12-15 01:39:40'),
(136, 4, NULL, NULL, 4, 320000.00, 0.00, 0.00, 0.00, 'cancelled', 'cod', NULL, NULL, '2025-12-10 14:23:02', '2025-12-15 01:39:40'),
(137, 4, NULL, NULL, 4, 680000.00, 0.00, 0.00, 0.00, 'cancelled', 'cod', NULL, NULL, '2025-12-08 14:23:02', '2025-12-15 01:39:40'),
(138, 2, NULL, NULL, 4, 850000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-13 14:23:02', '2025-12-15 01:37:56'),
(139, 5, NULL, NULL, 4, 1200000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-12 14:23:02', '2025-12-15 01:39:40'),
(140, 2, NULL, NULL, 4, 650000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-11 14:23:02', '2025-12-15 01:37:56'),
(141, 5, NULL, NULL, 4, 920000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-09 14:23:02', '2025-12-15 01:39:40'),
(142, 4, NULL, NULL, 4, 780000.00, 0.00, 0.00, 0.00, 'completed', 'cod', NULL, NULL, '2025-12-08 14:23:02', '2025-12-15 01:39:40'),
(143, 4, NULL, NULL, 4, 550000.00, 0.00, 0.00, 0.00, 'pending', 'cod', NULL, NULL, '2025-12-14 14:23:02', '2025-12-15 01:39:40'),
(144, 5, NULL, NULL, 4, 720000.00, 0.00, 0.00, 0.00, 'pending', 'cod', NULL, NULL, '2025-12-13 14:23:02', '2025-12-15 01:39:40'),
(145, 5, NULL, NULL, 4, 890000.00, 0.00, 0.00, 0.00, 'processing', 'cod', NULL, NULL, '2025-12-13 14:23:02', '2025-12-15 01:39:40'),
(146, 2, NULL, NULL, 4, 640000.00, 0.00, 0.00, 0.00, 'processing', 'cod', NULL, NULL, '2025-12-12 14:23:02', '2025-12-15 01:39:40'),
(147, 5, 2, 2, 1, 1200000.00, 0.00, 0.00, 0.00, 'cancelled', 'card', 'Cà Mau', '', '2025-12-15 01:02:16', '2025-12-15 01:51:11');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `variant_id`, `quantity`, `price`, `discount_amount`) VALUES
(1, 1, 14, NULL, 1, 280000.00, 0.00),
(2, 2, 13, NULL, 1, 350000.00, 0.00),
(3, 3, 9, NULL, 1, 750000.00, 0.00),
(4, 4, 9, NULL, 1, 750000.00, 0.00),
(5, 5, 9, NULL, 1, 750000.00, 0.00),
(28, 26, 12, NULL, 1, 1200000.00, 0.00),
(29, 27, 12, NULL, 1, 1200000.00, 0.00),
(30, 28, 10, NULL, 1, 550000.00, 0.00),
(31, 29, 13, NULL, 1, 350000.00, 0.00),
(32, 125, 12, NULL, 1, 1200000.00, 0.00),
(33, 126, 12, NULL, 1, 1200000.00, 0.00),
(34, 127, 12, NULL, 2, 1200000.00, 0.00),
(35, 127, 17, NULL, 2, 420000.00, 0.00),
(36, 127, 9, NULL, 2, 750000.00, 0.00),
(37, 127, 2, NULL, 1, 450000.00, 0.00),
(38, 128, 13, NULL, 1, 350000.00, 0.00),
(39, 129, 1, NULL, 2, 199000.00, 0.00),
(40, 129, 2, NULL, 1, 450000.00, 0.00),
(41, 132, 13, NULL, 1, 350000.00, 0.00),
(42, 133, 12, NULL, 1, 1200000.00, 0.00),
(43, 134, 1, NULL, 1, 199000.00, 0.00),
(44, 135, 13, NULL, 2, 225000.00, 0.00),
(45, 136, 10, NULL, 2, 160000.00, 0.00),
(46, 137, 13, NULL, 2, 340000.00, 0.00),
(47, 138, 12, NULL, 3, 283333.33, 0.00),
(48, 139, 3, NULL, 3, 400000.00, 0.00),
(49, 140, 10, NULL, 3, 216666.67, 0.00),
(50, 141, 12, NULL, 3, 306666.67, 0.00),
(51, 142, 16, NULL, 3, 260000.00, 0.00),
(52, 143, 2, NULL, 2, 275000.00, 0.00),
(53, 144, 2, NULL, 2, 360000.00, 0.00),
(54, 145, 17, NULL, 2, 445000.00, 0.00),
(55, 146, 10, NULL, 2, 320000.00, 0.00),
(56, 147, 12, NULL, 1, 1200000.00, 0.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `sku`, `barcode`, `name`, `description`, `price`, `category_id`, `image`, `material`, `is_active`, `created_at`, `updated_at`, `status`) VALUES
(1, 'SKU-001', '893001', 'Áo Thun Nam Cotton', 'Basic cotton t-shirt', 199000.00, 1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', 'Cotton', 1, '2025-12-12 20:59:25', '2025-12-12 21:52:08', 'active'),
(2, 'SKU-002', '893002', 'Váy Nữ Mùa Hè', 'Summer dress', 450000.00, 2, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800', 'Silk', 1, '2025-12-12 20:59:25', '2025-12-12 21:52:08', 'active'),
(3, 'SKU-003', '893003', 'Quần Short Bé Trai', 'Cool shorts', 150000.00, 3, 'https://concung.com/2024/10/67607-113990-large_mobile/quan-short-be-trai-animo-hn0724013-9m-6y-xam-dam.jpg', 'Denim', 1, '2025-12-12 20:59:25', '2025-12-13 09:34:31', 'active'),
(9, 'SKU-NEW-001', '893NEW001', 'Áo Khoác Denim Nam', 'Phong cách mạnh mẽ, bụi bặm', 750000.00, 1, 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800', 'Denim', 1, '2025-12-12 21:52:08', '2025-12-14 22:15:19', 'active'),
(10, 'SKU-NEW-002', '893NEW002', 'Quần Jeans Slim Fit', 'Co giãn thoải mái, tôn dáng', 550000.00, 1, 'https://yame.vn/cdn/shop/files/qu-n-jean-the-original-02-xanh-nh-t-1174882602.jpg?v=1760783019&width=823', 'Jean', 1, '2025-12-12 21:52:08', '2025-12-13 09:31:02', 'active'),
(11, 'SKU-NEW-003', '893NEW003', 'Áo Sơ Mi Linen', 'Thoáng mát cho ngày hè', 450000.00, 1, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', 'Linen', 1, '2025-12-12 21:52:08', '2025-12-12 21:52:08', 'active'),
(12, 'SKU-NEW-004', '893NEW004', 'Đầm Dự Tiệc Sang Trọng', 'Thiết kế tinh tế, quý phái', 1200000.00, 2, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', 'Silk', 1, '2025-12-12 21:52:08', '2025-12-12 21:52:08', 'active'),
(13, 'SKU-NEW-005', '893NEW005', 'Áo Len Nữ Cổ Lọ', 'Ấm áp, thời trang thu đông', 350000.00, 2, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800', 'Wool', 1, '2025-12-12 21:52:08', '2025-12-12 21:52:08', 'active'),
(14, 'SKU-NEW-006', '893NEW006', 'Chân Váy Xếp Ly', 'Năng động, trẻ trung', 280000.00, 2, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800', 'Polyester', 1, '2025-12-12 21:52:08', '2025-12-12 21:52:08', 'active'),
(16, 'SKU-NEW-008', '893NEW008', 'Bộ Đồ Thể Thao Bé Trai', 'Thoải mái vận động cả ngày', 320000.00, 3, 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800', 'Cotton', 1, '2025-12-12 21:52:08', '2025-12-12 21:52:08', 'active'),
(17, 'SKU-NEW-009', '893NEW009', 'Váy Công Chúa Bé Gái', 'Xinh xắn, đáng yêu', 420000.00, 3, 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800', 'Tulle', 1, '2025-12-12 21:52:08', '2025-12-12 21:52:08', 'active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_variants`
--

CREATE TABLE `product_variants` (
  `variant_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `size` varchar(10) NOT NULL,
  `color` varchar(50) NOT NULL,
  `color_code` varchar(7) DEFAULT NULL,
  `variant_sku` varchar(50) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `price_adjustment` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `barcode` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `sku` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_variants`
--

INSERT INTO `product_variants` (`variant_id`, `product_id`, `size`, `color`, `color_code`, `variant_sku`, `quantity`, `price_adjustment`, `is_active`, `created_at`, `barcode`, `status`, `sku`) VALUES
(4, 9, 'S', '#a62b2b', NULL, NULL, 35, -59000.00, 1, '2025-12-14 22:27:17', '893027019918', 'active', 'SKU-NEW-001-A1');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotions`
--

CREATE TABLE `promotions` (
  `promotion_id` int(11) NOT NULL,
  `promotion_code` varchar(50) NOT NULL,
  `promotion_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('draft','active','expired') DEFAULT 'draft',
  `scope_type` enum('all','category','product') DEFAULT 'all',
  `scope_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`scope_ids`)),
  `membership_tiers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`membership_tiers`)),
  `discount_type` enum('Percentage','Fixed Amount') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `buy_x` int(11) DEFAULT NULL,
  `get_y` int(11) DEFAULT NULL,
  `min_purchase_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `priority` int(11) DEFAULT 0,
  `stackable` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `promotions`
--

INSERT INTO `promotions` (`promotion_id`, `promotion_code`, `promotion_name`, `description`, `status`, `scope_type`, `scope_ids`, `membership_tiers`, `discount_type`, `discount_value`, `buy_x`, `get_y`, `min_purchase_amount`, `max_discount_amount`, `start_date`, `end_date`, `usage_limit`, `is_active`, `priority`, `stackable`, `created_at`) VALUES
(1, 'WELCOME10', 'Welcome Discount', '10% off for all new orders', 'active', 'all', NULL, '[]', 'Percentage', 10.00, NULL, NULL, 0.00, NULL, '2025-12-14 20:53:26', '2026-01-13 20:53:26', NULL, 1, 0, 0, '2025-12-15 02:53:26'),
(2, 'SAVE50K', 'Save 50k on 500k', 'Get 50,000 VND off orders over 500,000 VND', 'active', 'all', '[]', '[\"gold\"]', 'Fixed Amount', 50000.00, NULL, NULL, 5000000.00, NULL, '2025-12-14 20:53:00', '2025-12-29 20:53:00', NULL, 1, 0, 0, '2025-12-15 02:53:26'),
(4, 'VIPGOLD', 'Gold Members Exclusive', '15% off for Gold, Platinum & Diamond members', 'active', 'all', NULL, '[\"gold\", \"platinum\", \"diamond\"]', 'Percentage', 15.00, NULL, NULL, 0.00, NULL, '2025-12-14 20:53:26', '2026-02-12 20:53:26', NULL, 1, 0, 0, '2025-12-15 02:53:26'),
(5, 'BF2024', 'Black Friday 2024', 'Expired campaign', 'expired', 'all', NULL, '[]', 'Percentage', 50.00, NULL, NULL, 0.00, NULL, '2024-11-01 00:00:00', '2024-11-30 23:59:59', NULL, 0, 0, 0, '2025-12-15 02:53:26');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `returns`
--

CREATE TABLE `returns` (
  `return_id` int(11) NOT NULL,
  `return_number` varchar(50) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL COMMENT 'Admin/Sale processing return',
  `reason` text DEFAULT NULL,
  `refund_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `return_items`
--

CREATE TABLE `return_items` (
  `id` int(11) NOT NULL,
  `return_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sale_returns`
--

CREATE TABLE `sale_returns` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `return_number` varchar(50) DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'approved',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sale_returns`
--

INSERT INTO `sale_returns` (`id`, `order_id`, `user_id`, `return_number`, `refund_amount`, `reason`, `status`, `created_at`) VALUES
(1, 27, 2, 'RET-1765597915', 1200000.00, 'defective', 'approved', '2025-12-13 03:51:55'),
(2, 126, 2, 'RET-1765636244', 1200000.00, 'wrong_size', 'approved', '2025-12-13 14:30:44'),
(3, 28, 2, 'RET-1765639292', 550000.00, 'wrong_item', 'approved', '2025-12-13 15:21:32'),
(4, 125, 1, 'RET-20251214-707', 1200000.00, 'Wrong Size', 'completed', '2025-12-14 18:19:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sale_return_items`
--

CREATE TABLE `sale_return_items` (
  `id` int(11) NOT NULL,
  `return_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `sale_return_items`
--

INSERT INTO `sale_return_items` (`id`, `return_id`, `product_id`, `quantity`) VALUES
(1, 1, 12, 1),
(2, 2, 12, 1),
(3, 3, 10, 1),
(4, 4, 12, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stock_transfers`
--

CREATE TABLE `stock_transfers` (
  `id` int(11) NOT NULL,
  `transfer_code` varchar(20) NOT NULL,
  `from_store_id` int(11) NOT NULL,
  `to_store_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `sku` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `status` enum('pending','in_transit','completed','cancelled') DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `stock_transfers`
--

INSERT INTO `stock_transfers` (`id`, `transfer_code`, `from_store_id`, `to_store_id`, `product_id`, `variant_id`, `sku`, `quantity`, `status`, `note`, `created_by`, `approved_by`, `completed_at`, `created_at`) VALUES
(1, 'ST-20251214-001', 4, 2, 11, NULL, 'SKU-NEW-003', 56, 'cancelled', '', 1, NULL, NULL, '2025-12-14 17:14:56'),
(2, 'ST-20251214-002', 1, 6, 14, NULL, 'SKU-NEW-006', 12, 'completed', '', 1, 1, '2025-12-14 17:35:28', '2025-12-14 17:35:23'),
(3, 'ST-20251214-003', 4, 7, 11, NULL, 'SKU-NEW-003', 12, 'pending', '', 1, NULL, NULL, '2025-12-14 17:36:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stores`
--

CREATE TABLE `stores` (
  `store_id` int(11) NOT NULL,
  `store_code` varchar(20) NOT NULL,
  `store_name` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `city` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `stores`
--

INSERT INTO `stores` (`store_id`, `store_code`, `store_name`, `address`, `city`, `phone`, `is_active`, `created_at`) VALUES
(1, 'STORE001', 'Canifa - Cửa hàng chính', '123 Đường Nguyễn Huệ, Quận 1', 'Hồ Chí Minh', NULL, 1, '2025-12-12 20:59:25'),
(4, 'CNF_AEON', 'Canifa - Aeon Long Biên', '', '', NULL, 1, '2025-12-13 21:11:52'),
(5, 'CNF_TIMES', 'Canifa - Times City', '', '', NULL, 1, '2025-12-13 21:11:52'),
(6, 'CNF_ROYAL', 'Canifa - Royal City', '', '', NULL, 1, '2025-12-13 21:11:52'),
(7, 'CNF_CG', 'Canifa - Cầu Giấy', '', '', NULL, 1, '2025-12-13 21:11:52');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','customer','sale') NOT NULL DEFAULT 'customer',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `store_id` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `phone`, `role`, `is_active`, `created_at`, `updated_at`, `store_id`) VALUES
(1, 'admin', '$2y$10$V7xmVxpWyNUuDGhU8Kb1CecgcjM7zfseJ3I5GlCp/9Kcqt3x1lvwS', 'Nguyễn Tổng', 'admin@example.com', NULL, 'admin', 1, '2025-12-12 20:59:25', '2025-12-13 09:43:06', 1),
(2, 'saleuser', '$2y$10$ZVpVjCzIEIP22CZ2.MV.k.aL9ALMae6mnDufsR2HrbA9PqRh5Uzf.', 'Ngọc Anh Sale', 'sale@example.com', NULL, 'sale', 1, '2025-12-12 20:59:25', '2025-12-13 09:44:26', 1),
(3, 'customer_test', '$2y$10$V7xmVxpWyNUuDGhU8Kb1CecgcjM7zfseJ3I5GlCp/9Kcqt3x1lvwS', 'Mạc Long', 'customer@example.com', NULL, 'customer', 1, '2025-12-12 20:59:25', '2025-12-13 09:43:06', 1),
(4, 'huysale', '$2y$10$ZVpVjCzIEIP22CZ2.MV.k.aL9ALMae6mnDufsR2HrbA9PqRh5Uzf.', 'Huy Sales', 'huy@canifa.com', NULL, 'sale', 1, '2025-12-15 01:37:54', '2025-12-15 01:37:54', 1),
(5, 'tramsale', '$2y$10$ZVpVjCzIEIP22CZ2.MV.k.aL9ALMae6mnDufsR2HrbA9PqRh5Uzf.', 'Tram Sales', 'tram@canifa.com', NULL, 'sale', 1, '2025-12-15 01:37:54', '2025-12-15 01:37:54', 1);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category_parent` (`parent_id`);

--
-- Chỉ mục cho bảng `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_membership` (`membership_tier`);

--
-- Chỉ mục cho bảng `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`inventory_id`),
  ADD UNIQUE KEY `uk_product_variant_store` (`product_id`,`variant_id`,`store_id`),
  ADD KEY `variant_id` (`variant_id`),
  ADD KEY `store_id` (`store_id`);

--
-- Chỉ mục cho bảng `inventory_adjustments`
--
ALTER TABLE `inventory_adjustments`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `loyalty_logs`
--
ALTER TABLE `loyalty_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Chỉ mục cho bảng `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_order_id` (`order_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Chỉ mục cho bảng `membership_tiers`
--
ALTER TABLE `membership_tiers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tier_key` (`tier_key`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `store_id` (`store_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_sale_id` (`sale_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD UNIQUE KEY `barcode` (`barcode`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `idx_sku` (`sku`),
  ADD KEY `idx_barcode` (`barcode`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Chỉ mục cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`variant_id`),
  ADD UNIQUE KEY `uk_product_size_color` (`product_id`,`size`,`color`),
  ADD UNIQUE KEY `variant_sku` (`variant_sku`),
  ADD UNIQUE KEY `barcode` (`barcode`);

--
-- Chỉ mục cho bảng `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`promotion_id`),
  ADD UNIQUE KEY `promotion_code` (`promotion_code`);

--
-- Chỉ mục cho bảng `returns`
--
ALTER TABLE `returns`
  ADD PRIMARY KEY (`return_id`),
  ADD UNIQUE KEY `return_number` (`return_number`),
  ADD KEY `order_id` (`order_id`);

--
-- Chỉ mục cho bảng `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `sale_returns`
--
ALTER TABLE `sale_returns`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `sale_return_items`
--
ALTER TABLE `sale_return_items`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `stock_transfers`
--
ALTER TABLE `stock_transfers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transfer_code` (`transfer_code`);

--
-- Chỉ mục cho bảng `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`store_id`),
  ADD UNIQUE KEY `store_code` (`store_code`),
  ADD KEY `idx_store_code` (`store_code`),
  ADD KEY `idx_city` (`city`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `inventory`
--
ALTER TABLE `inventory`
  MODIFY `inventory_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT cho bảng `inventory_adjustments`
--
ALTER TABLE `inventory_adjustments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `loyalty_logs`
--
ALTER TABLE `loyalty_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `membership_tiers`
--
ALTER TABLE `membership_tiers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=148;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `variant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `promotions`
--
ALTER TABLE `promotions`
  MODIFY `promotion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `returns`
--
ALTER TABLE `returns`
  MODIFY `return_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `return_items`
--
ALTER TABLE `return_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `sale_returns`
--
ALTER TABLE `sale_returns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `sale_return_items`
--
ALTER TABLE `sale_return_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `stock_transfers`
--
ALTER TABLE `stock_transfers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `stores`
--
ALTER TABLE `stores`
  MODIFY `store_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `customers_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`variant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_ibfk_3` FOREIGN KEY (`store_id`) REFERENCES `stores` (`store_id`);

--
-- Các ràng buộc cho bảng `loyalty_logs`
--
ALTER TABLE `loyalty_logs`
  ADD CONSTRAINT `loyalty_logs_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD CONSTRAINT `loyalty_transactions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loyalty_transactions_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`sale_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`store_id`) REFERENCES `stores` (`store_id`);

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `returns`
--
ALTER TABLE `returns`
  ADD CONSTRAINT `returns_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
