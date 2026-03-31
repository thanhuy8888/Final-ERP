<?php
// Prevent any stray output
ob_start();

// Define allowed origins
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Handle CORS
if (in_array($origin, $allowed_origins) || preg_match('/^http:\/\/localhost:\d+$/', $origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
}

// Always set these headers
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Language, X-CSRF-Token, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Handle Preflight Options Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Clear output buffer
    ob_end_clean();
    http_response_code(200);
    exit();
}

// Rate Limiting (Simple implementation)
// require_once __DIR__ . '/rate_limiter.php'; // Commented out for debugging to reduce failure points
// $rateLimiter->enforce();

// Input Validator
if (file_exists(__DIR__ . '/input_validator.php')) {
    require_once __DIR__ . '/input_validator.php';
}
?>
