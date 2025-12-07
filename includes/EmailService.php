<?php
/**
 * Email Service Class for Final-ERP
 * Handles all email notifications with i18n support
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    private $mailer;
    private $language = 'vi'; // Default language
    
    // Email translations
    private $translations = [
        'vi' => [
            'order_confirmation_subject' => 'Xác nhận đơn hàng #{order_id}',
            'order_confirmation_title' => 'Cảm ơn bạn đã đặt hàng!',
            'order_confirmation_greeting' => 'Xin chào {name},',
            'order_confirmation_message' => 'Đơn hàng của bạn đã được đặt thành công. Dưới đây là chi tiết đơn hàng:',
            'order_id' => 'Mã đơn hàng',
            'order_date' => 'Ngày đặt',
            'order_status' => 'Trạng thái',
            'order_total' => 'Tổng tiền',
            'product_name' => 'Sản phẩm',
            'quantity' => 'Số lượng',
            'price' => 'Giá',
            'subtotal' => 'Thành tiền',
            'shipping_address' => 'Địa chỉ giao hàng',
            'thank_you' => 'Cảm ơn bạn đã mua sắm tại CANIFA!',
            'contact_support' => 'Nếu có thắc mắc, vui lòng liên hệ chúng tôi.',
            
            'status_update_subject' => 'Cập nhật trạng thái đơn hàng #{order_id}',
            'status_update_title' => 'Trạng thái đơn hàng đã được cập nhật',
            'status_update_message' => 'Đơn hàng #{order_id} của bạn đã được cập nhật trạng thái từ <strong>{old_status}</strong> thành <strong>{new_status}</strong>.',
            
            'statuses' => [
                'pending' => 'Chờ xử lý',
                'confirmed' => 'Đã xác nhận',
                'processing' => 'Đang xử lý',
                'shipping' => 'Đang giao hàng',
                'delivered' => 'Đã giao hàng',
                'cancelled' => 'Đã hủy'
            ]
        ],
        'en' => [
            'order_confirmation_subject' => 'Order Confirmation #{order_id}',
            'order_confirmation_title' => 'Thank you for your order!',
            'order_confirmation_greeting' => 'Hello {name},',
            'order_confirmation_message' => 'Your order has been placed successfully. Here are the order details:',
            'order_id' => 'Order ID',
            'order_date' => 'Order Date',
            'order_status' => 'Status',
            'order_total' => 'Total',
            'product_name' => 'Product',
            'quantity' => 'Quantity',
            'price' => 'Price',
            'subtotal' => 'Subtotal',
            'shipping_address' => 'Shipping Address',
            'thank_you' => 'Thank you for shopping at CANIFA!',
            'contact_support' => 'If you have any questions, please contact us.',
            
            'status_update_subject' => 'Order Status Update #{order_id}',
            'status_update_title' => 'Your order status has been updated',
            'status_update_message' => 'Your order #{order_id} status has been updated from <strong>{old_status}</strong> to <strong>{new_status}</strong>.',
            
            'statuses' => [
                'pending' => 'Pending',
                'confirmed' => 'Confirmed',
                'processing' => 'Processing',
                'shipping' => 'Shipping',
                'delivered' => 'Delivered',
                'cancelled' => 'Cancelled'
            ]
        ]
    ];
    
    public function __construct($language = 'vi') {
        $this->language = $language;
        $this->mailer = new PHPMailer(true);
        
        // Configure SMTP if enabled
        if (SMTP_ENABLED) {
            $this->mailer->isSMTP();
            $this->mailer->Host = SMTP_HOST;
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = SMTP_USERNAME;
            $this->mailer->Password = SMTP_PASSWORD;
            $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mailer->Port = SMTP_PORT;
        }
        
        $this->mailer->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $this->mailer->isHTML(true);
        $this->mailer->CharSet = 'UTF-8';
    }
    
    /**
     * Set the language for email content
     */
    public function setLanguage($lang) {
        if (isset($this->translations[$lang])) {
            $this->language = $lang;
        }
    }
    
    /**
     * Get translation by key
     */
    private function t($key, $replacements = []) {
        $text = $this->translations[$this->language][$key] ?? $key;
        foreach ($replacements as $placeholder => $value) {
            $text = str_replace('{' . $placeholder . '}', $value, $text);
        }
        return $text;
    }
    
    /**
     * Get status translation
     */
    private function translateStatus($status) {
        return $this->translations[$this->language]['statuses'][$status] ?? $status;
    }
    
    /**
     * Send order confirmation email
     */
    public function sendOrderConfirmation($orderId, $userEmail, $userName) {
        global $pdo;
        
        try {
            // Get order details
            $stmt = $pdo->prepare("
                SELECT o.*, u.username, u.email 
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                WHERE o.id = ?
            ");
            $stmt->execute([$orderId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$order) {
                throw new Exception("Order not found: $orderId");
            }
            
            // Get order items
            $stmt = $pdo->prepare("
                SELECT oi.*, p.name as product_name, p.image 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            ");
            $stmt->execute([$orderId]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Build email content
            $subject = $this->t('order_confirmation_subject', ['order_id' => $orderId]);
            $html = $this->buildOrderConfirmationHtml($order, $items, $userName);
            
            // Send email
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($userEmail, $userName);
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $html;
            
            if (SMTP_ENABLED) {
                $this->mailer->send();
            }
            
            // Log email sent
            $this->logEmail($orderId, 'order_confirmation', $userEmail);
            
            return true;
            
        } catch (Exception $e) {
            error_log("Email Error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send order status update email
     */
    public function sendOrderStatusUpdate($orderId, $userEmail, $userName, $oldStatus, $newStatus) {
        global $pdo;
        
        try {
            // Get order details
            $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
            $stmt->execute([$orderId]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$order) {
                throw new Exception("Order not found: $orderId");
            }
            
            // Build email content
            $subject = $this->t('status_update_subject', ['order_id' => $orderId]);
            $html = $this->buildStatusUpdateHtml($order, $userName, $oldStatus, $newStatus);
            
            // Send email
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($userEmail, $userName);
            $this->mailer->Subject = $subject;
            $this->mailer->Body = $html;
            
            if (SMTP_ENABLED) {
                $this->mailer->send();
            }
            
            // Log email sent
            $this->logEmail($orderId, 'status_update', $userEmail);
            
            return true;
            
        } catch (Exception $e) {
            error_log("Email Error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Build HTML for order confirmation email
     */
    private function buildOrderConfirmationHtml($order, $items, $userName) {
        $orderDate = date('d/m/Y H:i', strtotime($order['created_at']));
        $total = number_format($order['total_amount'], 0, ',', '.') . '₫';
        
        $itemsHtml = '';
        foreach ($items as $item) {
            $itemTotal = number_format($item['price'] * $item['quantity'], 0, ',', '.') . '₫';
            $itemPrice = number_format($item['price'], 0, ',', '.') . '₫';
            $itemsHtml .= "
                <tr>
                    <td style='padding: 12px; border-bottom: 1px solid #eee;'>{$item['product_name']}</td>
                    <td style='padding: 12px; border-bottom: 1px solid #eee; text-align: center;'>{$item['quantity']}</td>
                    <td style='padding: 12px; border-bottom: 1px solid #eee; text-align: right;'>{$itemPrice}</td>
                    <td style='padding: 12px; border-bottom: 1px solid #eee; text-align: right;'>{$itemTotal}</td>
                </tr>
            ";
        }
        
        $shipping = isset($order['shipping_address']) ? $order['shipping_address'] : 'N/A';
        $statusText = $this->translateStatus($order['status']);
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        </head>
        <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;'>
            <div style='max-width: 600px; margin: 0 auto; background: white; padding: 40px;'>
                <div style='text-align: center; margin-bottom: 30px;'>
                    <h1 style='color: #e74c3c; margin: 0;'>CANIFA</h1>
                    <p style='color: #666; margin-top: 5px;'>Fashion Store</p>
                </div>
                
                <h2 style='color: #333; text-align: center;'>{$this->t('order_confirmation_title')}</h2>
                
                <p style='color: #555; font-size: 16px;'>{$this->t('order_confirmation_greeting', ['name' => $userName])}</p>
                <p style='color: #555;'>{$this->t('order_confirmation_message')}</p>
                
                <div style='background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                    <p style='margin: 5px 0;'><strong>{$this->t('order_id')}:</strong> #{$order['id']}</p>
                    <p style='margin: 5px 0;'><strong>{$this->t('order_date')}:</strong> {$orderDate}</p>
                    <p style='margin: 5px 0;'><strong>{$this->t('order_status')}:</strong> <span style='color: #e74c3c;'>{$statusText}</span></p>
                </div>
                
                <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                    <thead>
                        <tr style='background: #e74c3c; color: white;'>
                            <th style='padding: 12px; text-align: left;'>{$this->t('product_name')}</th>
                            <th style='padding: 12px; text-align: center;'>{$this->t('quantity')}</th>
                            <th style='padding: 12px; text-align: right;'>{$this->t('price')}</th>
                            <th style='padding: 12px; text-align: right;'>{$this->t('subtotal')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {$itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan='3' style='padding: 12px; text-align: right; font-weight: bold;'>{$this->t('order_total')}:</td>
                            <td style='padding: 12px; text-align: right; font-weight: bold; color: #e74c3c; font-size: 18px;'>{$total}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div style='background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                    <p style='margin: 0;'><strong>{$this->t('shipping_address')}:</strong></p>
                    <p style='margin: 5px 0 0;'>{$shipping}</p>
                </div>
                
                <p style='text-align: center; color: #e74c3c; font-size: 18px; margin-top: 30px;'>{$this->t('thank_you')}</p>
                <p style='text-align: center; color: #888; font-size: 14px;'>{$this->t('contact_support')}</p>
                
                <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>
                    <p style='color: #888; font-size: 12px;'>© " . date('Y') . " CANIFA. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * Build HTML for status update email
     */
    private function buildStatusUpdateHtml($order, $userName, $oldStatus, $newStatus) {
        $orderId = $order['id'];
        $orderDate = date('d/m/Y H:i', strtotime($order['created_at']));
        $total = number_format($order['total_amount'], 0, ',', '.') . '₫';
        $oldStatusText = $this->translateStatus($oldStatus);
        $newStatusText = $this->translateStatus($newStatus);
        
        // Status icon and color based on new status
        $statusColors = [
            'pending' => '#f39c12',
            'confirmed' => '#3498db',
            'processing' => '#9b59b6',
            'shipping' => '#1abc9c',
            'delivered' => '#27ae60',
            'cancelled' => '#e74c3c'
        ];
        $statusColor = $statusColors[$newStatus] ?? '#666';
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        </head>
        <body style='font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;'>
            <div style='max-width: 600px; margin: 0 auto; background: white; padding: 40px;'>
                <div style='text-align: center; margin-bottom: 30px;'>
                    <h1 style='color: #e74c3c; margin: 0;'>CANIFA</h1>
                    <p style='color: #666; margin-top: 5px;'>Fashion Store</p>
                </div>
                
                <h2 style='color: #333; text-align: center;'>{$this->t('status_update_title')}</h2>
                
                <p style='color: #555; font-size: 16px;'>{$this->t('order_confirmation_greeting', ['name' => $userName])}</p>
                <p style='color: #555;'>{$this->t('status_update_message', ['order_id' => $orderId, 'old_status' => $oldStatusText, 'new_status' => $newStatusText])}</p>
                
                <div style='text-align: center; margin: 30px 0;'>
                    <div style='display: inline-block; background: {$statusColor}; color: white; padding: 15px 30px; border-radius: 8px; font-size: 18px; font-weight: bold;'>
                        {$newStatusText}
                    </div>
                </div>
                
                <div style='background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;'>
                    <p style='margin: 5px 0;'><strong>{$this->t('order_id')}:</strong> #{$orderId}</p>
                    <p style='margin: 5px 0;'><strong>{$this->t('order_date')}:</strong> {$orderDate}</p>
                    <p style='margin: 5px 0;'><strong>{$this->t('order_total')}:</strong> {$total}</p>
                </div>
                
                <p style='text-align: center; color: #e74c3c; font-size: 18px; margin-top: 30px;'>{$this->t('thank_you')}</p>
                <p style='text-align: center; color: #888; font-size: 14px;'>{$this->t('contact_support')}</p>
                
                <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>
                    <p style='color: #888; font-size: 12px;'>© " . date('Y') . " CANIFA. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * Log email to database for tracking
     */
    private function logEmail($orderId, $type, $recipient) {
        global $pdo;
        
        try {
            // Check if email_logs table exists, if not create it
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS email_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NOT NULL,
                    email_type VARCHAR(50) NOT NULL,
                    recipient VARCHAR(255) NOT NULL,
                    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_order_id (order_id),
                    INDEX idx_email_type (email_type)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ");
            
            $stmt = $pdo->prepare("INSERT INTO email_logs (order_id, email_type, recipient) VALUES (?, ?, ?)");
            $stmt->execute([$orderId, $type, $recipient]);
        } catch (Exception $e) {
            error_log("Email logging error: " . $e->getMessage());
        }
    }
    
    /**
     * Test email configuration
     */
    public function testConnection() {
        if (!SMTP_ENABLED) {
            return ['success' => false, 'message' => 'SMTP is disabled in config'];
        }
        
        try {
            $this->mailer->smtpConnect();
            $this->mailer->smtpClose();
            return ['success' => true, 'message' => 'SMTP connection successful'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
?>
