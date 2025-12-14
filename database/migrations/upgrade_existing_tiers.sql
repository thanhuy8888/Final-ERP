-- Upgrade membership tiers for all existing customers based on total_lifetime_spent
-- Run this in phpMyAdmin SQL tab

UPDATE customers 
SET membership_tier = CASE
    WHEN total_lifetime_spent >= 50000000 THEN 'platinum'
    WHEN total_lifetime_spent >= 20000000 THEN 'gold'
    WHEN total_lifetime_spent >= 5000000 THEN 'silver'
    ELSE 'bronze'
END,
tier_updated_at = CURRENT_TIMESTAMP
WHERE total_lifetime_spent > 0;

-- Verify the results
SELECT 
    membership_tier,
    COUNT(*) as customer_count,
    MIN(total_lifetime_spent) as min_spent,
    MAX(total_lifetime_spent) as max_spent
FROM customers
GROUP BY membership_tier
ORDER BY FIELD(membership_tier, 'bronze', 'silver', 'gold', 'platinum');
