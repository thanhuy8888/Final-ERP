-- Fix empty membership_tier values in customers table
-- Run this in phpMyAdmin SQL tab

UPDATE customers 
SET membership_tier = 'bronze' 
WHERE membership_tier IS NULL OR membership_tier = '';

-- Verify the update
SELECT id, full_name, membership_tier, total_lifetime_spent 
FROM customers 
LIMIT 10;
