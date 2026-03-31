-- Step 1: Check if membership_tier column exists and its type
SHOW COLUMNS FROM customers LIKE 'membership_tier';

-- Step 2: If column exists but wrong type, drop and recreate it
ALTER TABLE customers DROP COLUMN IF EXISTS membership_tier;

-- Step 3: Add column with correct ENUM type
ALTER TABLE customers 
ADD COLUMN membership_tier ENUM('bronze', 'silver', 'gold', 'platinum') 
DEFAULT 'bronze' 
NOT NULL
AFTER total_lifetime_spent;

-- Step 4: Update tiers based on spending
UPDATE customers 
SET membership_tier = CASE
    WHEN total_lifetime_spent >= 50000000 THEN 'platinum'
    WHEN total_lifetime_spent >= 20000000 THEN 'gold'
    WHEN total_lifetime_spent >= 5000000 THEN 'silver'
    ELSE 'bronze'
END;

-- Step 5: Verify
SELECT id, full_name, membership_tier, total_lifetime_spent 
FROM customers 
ORDER BY total_lifetime_spent DESC
LIMIT 10;
