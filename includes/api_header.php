<?php
/**
 * API Header with CORS, Rate Limiting, and Security
 */

// CORS - Allow requests from React dev server
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Language, X-CSRF-Token');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Rate Limiting (60 requests per minute)
require_once __DIR__ . '/rate_limiter.php';
$rateLimiter->enforce();

// Input Validator (available for all endpoints)
require_once __DIR__ . '/input_validator.php';
?>
