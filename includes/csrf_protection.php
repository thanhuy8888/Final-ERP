<?php
/**
 * CSRF Protection Helper
 * Generates and validates CSRF tokens
 */

class CSRFProtection {
    private $tokenName = 'csrf_token';
    private $tokenLifetime = 3600; // 1 hour
    
    public function __construct() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    /**
     * Generate a new CSRF token
     * @return string The generated token
     */
    public function generateToken() {
        $token = bin2hex(random_bytes(32));
        $_SESSION[$this->tokenName] = [
            'token' => $token,
            'expires' => time() + $this->tokenLifetime
        ];
        return $token;
    }
    
    /**
     * Get current token or generate new one
     * @return string Current valid token
     */
    public function getToken() {
        if ($this->hasValidToken()) {
            return $_SESSION[$this->tokenName]['token'];
        }
        return $this->generateToken();
    }
    
    /**
     * Check if current session has valid token
     * @return bool
     */
    private function hasValidToken() {
        if (!isset($_SESSION[$this->tokenName])) {
            return false;
        }
        
        $tokenData = $_SESSION[$this->tokenName];
        return isset($tokenData['token']) && 
               isset($tokenData['expires']) && 
               $tokenData['expires'] > time();
    }
    
    /**
     * Validate a submitted token
     * @param string $token Token to validate
     * @return bool True if valid
     */
    public function validateToken($token) {
        if (!$this->hasValidToken()) {
            return false;
        }
        
        return hash_equals($_SESSION[$this->tokenName]['token'], $token);
    }
    
    /**
     * Enforce CSRF protection on POST/PUT/DELETE requests
     * @return bool True if valid, exits with 403 if not
     */
    public function enforce() {
        // Skip for GET and OPTIONS requests
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (in_array($method, ['GET', 'OPTIONS', 'HEAD'])) {
            return true;
        }
        
        // Get token from header or body
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
        
        if (!$token) {
            $input = json_decode(file_get_contents('php://input'), true);
            $token = $input['csrf_token'] ?? $_POST['csrf_token'] ?? null;
        }
        
        if (!$token || !$this->validateToken($token)) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Invalid or missing CSRF token',
                'code' => 'CSRF_VALIDATION_FAILED'
            ]);
            exit;
        }
        
        return true;
    }
    
    /**
     * Regenerate token after successful validation (for extra security)
     */
    public function regenerate() {
        return $this->generateToken();
    }
}

// Global CSRF instance
$csrf = new CSRFProtection();
?>
