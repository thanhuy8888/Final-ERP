<?php
$base_url = 'http://localhost:8081/Final-ERP/api';
$cookie_file = sys_get_temp_dir() . '/cookie.txt';
if (file_exists($cookie_file)) unlink($cookie_file);

function request($url, $method = 'GET', $data = null) {
    global $cookie_file;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file);
    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['code' => $http_code, 'body' => $response];
}

echo "1. Logging in...\n";
$login = request("$base_url/login.php", 'POST', ['username' => 'saleuser', 'password' => '123456']);
echo "Login Status: " . $login['code'] . "\n";
echo "Login Body: " . substr($login['body'], 0, 100) . "...\n";

if ($login['code'] != 200) {
    echo "Login failed.\n";
    exit;
}

echo "\n2. Creating Order...\n";
$orderData = [
    'items' => [
        ['product_id' => 1, 'quantity' => 2], // Assuming product ID 1 exists
        ['product_id' => 2, 'quantity' => 1]
    ],
    'discount' => 0,
    'notes' => 'API Test Order',
    'customer_phone' => '0999888777',
    'customer_name' => 'API Test User',
    'address' => 'API Address'
];

$order = request("$base_url/sale/orders.php", 'POST', $orderData);
echo "Order Status: " . $order['code'] . "\n";
echo "Order Body: " . $order['body'] . "\n";
?>
