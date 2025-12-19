<?php
/**
 * CSRF Token Endpoint
 * GET: Returns a new CSRF token for the session
 */
require_once '../includes/api_header.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../includes/csrf_protection.php';

$token = $csrf->getToken();

echo json_encode([
    'csrf_token' => $token
]);
?>
