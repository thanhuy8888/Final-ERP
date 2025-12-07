<?php
/**
 * Rate Limiter - File-based API rate limiting
 * Limits requests per IP address
 */

class RateLimiter {
    private $cacheDir;
    private $maxRequests;
    private $timeWindow;
    
    /**
     * @param int $maxRequests Maximum requests allowed in time window
     * @param int $timeWindow Time window in seconds (default 60)
     * @param string|null $cacheDir Directory to store rate limit data
     */
    public function __construct($maxRequests = 60, $timeWindow = 60, $cacheDir = null) {
        $this->maxRequests = $maxRequests;
        $this->timeWindow = $timeWindow;
        $this->cacheDir = $cacheDir ?: dirname(__DIR__) . '/cache/ratelimit';
        
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    /**
     * Get client IP address
     */
    private function getClientIP() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        
        // Check for proxy headers
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } elseif (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        }
        
        return trim($ip);
    }
    
    /**
     * Get file path for IP
     */
    private function getFilePath($ip) {
        $safeIP = preg_replace('/[^a-zA-Z0-9]/', '_', $ip);
        return $this->cacheDir . '/' . $safeIP . '.json';
    }
    
    /**
     * Check if request is allowed
     * @param string|null $identifier Optional identifier (e.g., user_id) instead of IP
     * @return array ['allowed' => bool, 'remaining' => int, 'reset' => int]
     */
    public function check($identifier = null) {
        $key = $identifier ?? $this->getClientIP();
        $filePath = $this->getFilePath($key);
        $now = time();
        
        // Get existing data
        $data = ['requests' => [], 'blocked_until' => 0];
        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            $data = json_decode($content, true) ?: $data;
        }
        
        // Check if blocked
        if ($data['blocked_until'] > $now) {
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset' => $data['blocked_until'] - $now,
                'blocked' => true
            ];
        }
        
        // Clean old requests outside time window
        $data['requests'] = array_filter($data['requests'], function($ts) use ($now) {
            return $ts > ($now - $this->timeWindow);
        });
        
        // Check limit
        $requestCount = count($data['requests']);
        
        if ($requestCount >= $this->maxRequests) {
            // Block for time window
            $data['blocked_until'] = $now + $this->timeWindow;
            file_put_contents($filePath, json_encode($data));
            
            return [
                'allowed' => false,
                'remaining' => 0,
                'reset' => $this->timeWindow,
                'blocked' => true
            ];
        }
        
        // Add current request
        $data['requests'][] = $now;
        file_put_contents($filePath, json_encode($data));
        
        return [
            'allowed' => true,
            'remaining' => $this->maxRequests - count($data['requests']),
            'reset' => $this->timeWindow
        ];
    }
    
    /**
     * Apply rate limiting headers and check
     * @return bool True if allowed, exits with 429 if not
     */
    public function enforce($identifier = null) {
        $result = $this->check($identifier);
        
        // Set rate limit headers
        header('X-RateLimit-Limit: ' . $this->maxRequests);
        header('X-RateLimit-Remaining: ' . $result['remaining']);
        header('X-RateLimit-Reset: ' . $result['reset']);
        
        if (!$result['allowed']) {
            http_response_code(429);
            header('Retry-After: ' . $result['reset']);
            echo json_encode([
                'error' => 'Too many requests. Please wait ' . $result['reset'] . ' seconds.',
                'retry_after' => $result['reset']
            ]);
            exit;
        }
        
        return true;
    }
    
    /**
     * Clear rate limit data for cleanup
     */
    public function cleanup() {
        $files = glob($this->cacheDir . '/*.json');
        $now = time();
        $cleaned = 0;
        
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);
            
            // Remove if no recent requests and not blocked
            if (empty($data['requests']) && ($data['blocked_until'] ?? 0) < $now) {
                unlink($file);
                $cleaned++;
            }
        }
        
        return $cleaned;
    }
}

// Global rate limiter instance (60 requests per minute default)
$rateLimiter = new RateLimiter(60, 60);
?>
