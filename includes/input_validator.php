<?php
/**
 * Input Validation & Sanitization Helper
 */

class InputValidator {
    
    /**
     * Sanitize string input
     * @param string $input
     * @return string Sanitized string
     */
    public static function sanitizeString($input) {
        if (!is_string($input)) {
            return '';
        }
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Sanitize email
     * @param string $email
     * @return string|false Sanitized email or false if invalid
     */
    public static function sanitizeEmail($email) {
        $email = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : false;
    }
    
    /**
     * Sanitize integer
     * @param mixed $input
     * @return int
     */
    public static function sanitizeInt($input) {
        return (int) filter_var($input, FILTER_SANITIZE_NUMBER_INT);
    }
    
    /**
     * Sanitize float/decimal
     * @param mixed $input
     * @return float
     */
    public static function sanitizeFloat($input) {
        return (float) filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }
    
    /**
     * Validate required fields
     * @param array $data Input data
     * @param array $required Required field names
     * @return array ['valid' => bool, 'missing' => array]
     */
    public static function validateRequired($data, $required) {
        $missing = [];
        
        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $missing[] = $field;
            }
        }
        
        return [
            'valid' => empty($missing),
            'missing' => $missing
        ];
    }
    
    /**
     * Validate string length
     * @param string $input
     * @param int $min Minimum length
     * @param int $max Maximum length
     * @return bool
     */
    public static function validateLength($input, $min = 0, $max = PHP_INT_MAX) {
        $len = mb_strlen($input);
        return $len >= $min && $len <= $max;
    }
    
    /**
     * Validate username format
     * @param string $username
     * @return bool
     */
    public static function validateUsername($username) {
        // 3-50 chars, alphanumeric and underscore only
        return preg_match('/^[a-zA-Z0-9_]{3,50}$/', $username);
    }
    
    /**
     * Validate password strength
     * @param string $password
     * @return array ['valid' => bool, 'errors' => array]
     */
    public static function validatePassword($password) {
        $errors = [];
        
        if (strlen($password) < 6) {
            $errors[] = 'Password must be at least 6 characters';
        }
        if (strlen($password) > 100) {
            $errors[] = 'Password must be less than 100 characters';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    /**
     * Validate phone number (Vietnamese format)
     * @param string $phone
     * @return bool
     */
    public static function validatePhone($phone) {
        // Vietnamese phone: 10-11 digits, starts with 0
        return preg_match('/^0[0-9]{9,10}$/', preg_replace('/\s+/', '', $phone));
    }
    
    /**
     * Validate and sanitize an entire input array
     * @param array $data Input data
     * @param array $rules Validation rules ['field' => 'type']
     * @return array ['valid' => bool, 'data' => array, 'errors' => array]
     */
    public static function validate($data, $rules) {
        $sanitized = [];
        $errors = [];
        
        foreach ($rules as $field => $rule) {
            $value = $data[$field] ?? null;
            $parts = explode('|', $rule);
            $type = $parts[0];
            $required = in_array('required', $parts);
            
            // Check required
            if ($required && ($value === null || $value === '')) {
                $errors[$field] = "$field is required";
                continue;
            }
            
            // Skip if not required and empty
            if (!$required && ($value === null || $value === '')) {
                $sanitized[$field] = null;
                continue;
            }
            
            // Sanitize by type
            switch ($type) {
                case 'string':
                    $sanitized[$field] = self::sanitizeString($value);
                    break;
                case 'email':
                    $email = self::sanitizeEmail($value);
                    if ($email === false) {
                        $errors[$field] = "Invalid email format";
                    } else {
                        $sanitized[$field] = $email;
                    }
                    break;
                case 'int':
                    $sanitized[$field] = self::sanitizeInt($value);
                    break;
                case 'float':
                    $sanitized[$field] = self::sanitizeFloat($value);
                    break;
                case 'phone':
                    if (!self::validatePhone($value)) {
                        $errors[$field] = "Invalid phone number";
                    } else {
                        $sanitized[$field] = preg_replace('/\s+/', '', $value);
                    }
                    break;
                default:
                    $sanitized[$field] = self::sanitizeString($value);
            }
        }
        
        return [
            'valid' => empty($errors),
            'data' => $sanitized,
            'errors' => $errors
        ];
    }
}
?>
