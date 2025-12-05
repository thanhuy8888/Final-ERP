require_once '../includes/api_header.php';

// Handle POST actions (Add/Update/Remove)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        $action = $_POST['action'] ?? '';
        $product_id = $_POST['product_id'] ?? 0;
        $quantity = $_POST['quantity'] ?? 1;
    } else {
        $action = $data['action'] ?? '';
        $product_id = $data['product_id'] ?? 0;
        $quantity = $data['quantity'] ?? 1;
    }

    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }

    if ($action === 'add') {
        if (isset($_SESSION['cart'][$product_id])) {
            $_SESSION['cart'][$product_id] += $quantity;
        } else {
            $_SESSION['cart'][$product_id] = $quantity;
        }
    } elseif ($action === 'update') {
        if ($quantity > 0) {
            $_SESSION['cart'][$product_id] = $quantity;
        } else {
            unset($_SESSION['cart'][$product_id]);
        }
    } elseif ($action === 'remove') {
        unset($_SESSION['cart'][$product_id]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        exit;
    }

    echo json_encode(['success' => true, 'cart_count' => array_sum($_SESSION['cart'])]);
    exit;
}

// Handle GET (Fetch Cart)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $cart_items = [];
    $total_price = 0;

    if (!empty($_SESSION['cart'])) {
        $ids = array_keys($_SESSION['cart']);
        if (!empty($ids)) {
            $placeholders = str_repeat('?,', count($ids) - 1) . '?';
            $stmt = $pdo->prepare("SELECT * FROM products WHERE id IN ($placeholders)");
            $stmt->execute($ids);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($products as $product) {
                $qty = $_SESSION['cart'][$product['id']];
                $product['quantity'] = $qty;
                $product['subtotal'] = $product['price'] * $qty;
                $total_price += $product['subtotal'];
                $cart_items[] = $product;
            }
        }
    }

    echo json_encode([
        'items' => $cart_items,
        'total_price' => $total_price,
        'count' => !empty($_SESSION['cart']) ? array_sum($_SESSION['cart']) : 0
    ]);
}
?>
