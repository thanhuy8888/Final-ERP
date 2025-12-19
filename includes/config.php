<?php
/**
 * Central Configuration File for Final-ERP
 */

// Database Configuration (already in db.php but included here for reference)
define('DB_HOST', 'localhost');
define('DB_NAME', 'final_erp');
define('DB_USER', 'root');
define('DB_PASS', '');

// Email Configuration (SMTP)
// Using Mailtrap.io for testing - replace with your own credentials
define('SMTP_HOST', 'sandbox.smtp.mailtrap.io');
define('SMTP_PORT', 2525);
define('SMTP_USERNAME', ''); // Get from Mailtrap.io
define('SMTP_PASSWORD', ''); // Get from Mailtrap.io
define('SMTP_FROM_EMAIL', 'noreply@canifa.vn');
define('SMTP_FROM_NAME', 'CANIFA Fashion');
define('SMTP_ENABLED', false); // Set to true when SMTP is configured

// Site Configuration
define('SITE_NAME', 'CANIFA Fashion');
define('SITE_URL', 'http://localhost:5173');
define('API_URL', 'http://localhost/Final-ERP/api');

// Session Configuration
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_strict_mode', 1);
}
?>
