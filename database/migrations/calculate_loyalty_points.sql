-- Calculate loyalty points for existing customers based on completed orders
-- Using total_amount instead of final_amount

UPDATE customers c
SET loyalty_points = (
    SELECT FLOOR(SUM(o.total_amount) / 1000) * 
           CASE c.membership_tier
               WHEN 'platinum' THEN 2.0
               WHEN 'gold' THEN 1.5
               WHEN 'silver' THEN 1.2
               ELSE 1.0
           END
    FROM orders o
    WHERE o.customer_id = c.id 
    AND o.status IN ('completed', 'confirmed')
)
WHERE id IN (SELECT DISTINCT customer_id FROM orders);

-- Verify results
SELECT id, full_name, membership_tier, loyalty_points, total_lifetime_spent 
FROM customers 
WHERE phone = '0366874902';

-- See top customers by points
SELECT id, full_name, membership_tier, loyalty_points, total_lifetime_spent 
FROM customers 
ORDER BY loyalty_points DESC
LIMIT 10;
