<?php
require_once '../../includes/api_header.php';
require_once '../../includes/db.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: List Tiers ---
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM membership_tiers ORDER BY min_spent ASC");
    $tiers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($tiers);
}

// --- PUT: Update Tier Config ---
if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing ID']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE membership_tiers SET min_spent = ?, bonus_rate = ? WHERE id = ?");
    if ($stmt->execute([$data['min_spent'], $data['bonus_rate'], $data['id']])) {
        echo json_encode(['message' => 'Tier updated']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Update failed']);
    }
}

// --- POST: Auto-Calculate Tiers ---
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (($data['action'] ?? '') !== 'calculate') {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // Fetch criteria ordered from Highest to Lowest
        $stmt = $pdo->query("SELECT tier_key, min_spent FROM membership_tiers ORDER BY min_spent DESC");
        $tiers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $updatedCount = 0;

        foreach ($tiers as $tier) {
            // Update customers who meet this tier's spend but aren't yet at this tier (or higher)
            // Actually, simpler logic: Update ALL customers to their highest eligible tier.
            // But SQL batch update is faster:
            
            // "Update users to [Tier X] if spent >= [Threshold X] AND membership_tier != [Tier X]"
            // But we must ensure we don't downgrade or cross-grade incorrectly if we run multiple queries.
            // Best approach: CASE statement in one go? Or loop queries.
            
            // Let's use specific logic: "Set tier = X where spent >= limit AND current tier is lower" 
            // BUT customers might have 'grandfathered' tiers.
            // User requirement: "Auto-update tier".
            
            // Let's assume strict rule: Tier is strictly based on spent.
            // We run from Highest (Diamond) to Lowest (Bronze).
            // Any user matching the criteria gets updated.
            // We exclude users already at that tier.
            
            $sql = "UPDATE customers 
                    SET membership_tier = ?, tier_updated_at = NOW() 
                    WHERE total_lifetime_spent >= ? 
                    AND membership_tier != ?";
                    
            // We also need to ensure they don't get set to a LOWER tier if we run this loop.
            // Actually, since we run form Highest to Lowest, we need to be careful.
            // If we run Diamond update: everyone > 50M becomes Diamond.
            // If we run Platinum update: everyone > 30M becomes Platinum. 
            // Oops, that would downgrade the Diamonds because >50M is also >30M.
            
            // FIX: Add "AND membership_tier NOT IN (higher tiers)"? 
            // Or only target "lower tiers".
            
            // Better Logic:
            // Update customers to 'diamond' WHERE spent >= 50M.
            // Update customers to 'platinum' WHERE spent >= 30M AND spent < 50M.
            // Update customers to 'gold' WHERE spent >= 10M AND spent < 30M.
            // ...
            
            // To do this dynamically:
            // We need the next tier's threshold.
        }
        
        // Dynamic Logic with Upper Bounds
        for ($i = 0; $i < count($tiers); $i++) {
            $current = $tiers[$i];
            $upperBound = ($i > 0) ? $tiers[$i - 1]['min_spent'] : 999999999999; // Since we ordered DESC, previous is higher.
            
            // So for Diamond (first): spent >= 50M. Upper bound infinity.
            // For Platinum (second): spent >= 30M AND spent < 50M.
            
            if ($i == 0) {
                 $sql = "UPDATE customers SET membership_tier = ? WHERE total_lifetime_spent >= ? AND membership_tier != ?";
                 $params = [$current['tier_key'], $current['min_spent'], $current['tier_key']];
            } else {
                 $sql = "UPDATE customers SET membership_tier = ? WHERE total_lifetime_spent >= ? AND total_lifetime_spent < ? AND membership_tier != ?";
                 $params = [$current['tier_key'], $current['min_spent'], $upperBound, $current['tier_key']];
            }
            
            $stmtUpdate = $pdo->prepare($sql);
            $stmtUpdate->execute($params);
            $updatedCount += $stmtUpdate->rowCount();
        }

        $pdo->commit();
        echo json_encode(['message' => "Recalculated tiers. Updated $updatedCount customers."]);

    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}
?>
