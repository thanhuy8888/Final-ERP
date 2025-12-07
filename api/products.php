<?php
/**
 * Products API with Advanced Search & Filtering + File-Based Caching
 * 
 * Query Parameters:
 * - search: Search term (matches name, description)
 * - min_price: Minimum price filter
 * - max_price: Maximum price filter
 * - material: Material filter (comma-separated for multiple)
 * - category_id: Category filter
 * - sort: Sort order (newest, price_asc, price_desc, name_asc, name_desc)
 * - page: Page number for pagination
 * - limit: Items per page (default 20, max 100)
 */

require_once '../includes/api_header.php';
require_once '../includes/db.php';
require_once '../includes/file_cache.php';

try {
    // Single product fetch by ID (for ProductDetail page)
    if (isset($_GET['id'])) {
        $productId = intval($_GET['id']);
        $cacheKey = 'product_' . $productId;
        
        $cachedResult = $cache->get($cacheKey);
        if ($cachedResult !== null) {
            header('X-Cache: HIT');
            echo json_encode($cachedResult);
            exit;
        }
        
        header('X-Cache: MISS');
        $stmt = $pdo->prepare("
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ? AND p.is_active = 1
        ");
        $stmt->execute([$productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($product) {
            $cache->set($cacheKey, $product, 300);
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
        }
        exit;
    }
    
    // Generate cache key from all query params
    $cacheKey = 'products_' . md5(json_encode($_GET));
    
    // Try to get from cache first (5 minute TTL)
    $cachedResult = $cache->get($cacheKey);
    if ($cachedResult !== null) {
        header('X-Cache: HIT');
        echo json_encode($cachedResult);
        exit;
    }
    
    header('X-Cache: MISS');
    // Get filter parameters
    $search = $_GET['search'] ?? '';
    $minPrice = isset($_GET['min_price']) ? floatval($_GET['min_price']) : null;
    $maxPrice = isset($_GET['max_price']) ? floatval($_GET['max_price']) : null;
    $material = $_GET['material'] ?? '';
    $categoryId = isset($_GET['category_id']) ? intval($_GET['category_id']) : null;
    $sort = $_GET['sort'] ?? 'newest';
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(100, max(1, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    
    // Build query
    $conditions = ['is_active = 1'];
    $params = [];
    
    // Search filter
    if (!empty($search)) {
        $conditions[] = '(name LIKE ? OR description LIKE ?)';
        $searchTerm = "%{$search}%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    // Price range filter
    if ($minPrice !== null) {
        $conditions[] = 'price >= ?';
        $params[] = $minPrice;
    }
    if ($maxPrice !== null) {
        $conditions[] = 'price <= ?';
        $params[] = $maxPrice;
    }
    
    // Material filter (supports multiple comma-separated)
    if (!empty($material)) {
        $materials = array_map('trim', explode(',', $material));
        $placeholders = implode(',', array_fill(0, count($materials), '?'));
        $conditions[] = "material IN ({$placeholders})";
        $params = array_merge($params, $materials);
    }
    
    // Category filter
    if ($categoryId !== null) {
        $conditions[] = 'category_id = ?';
        $params[] = $categoryId;
    }
    
    // Build WHERE clause
    $whereClause = implode(' AND ', $conditions);
    
    // Sorting
    $orderBy = match($sort) {
        'price_asc' => 'price ASC',
        'price_desc' => 'price DESC',
        'name_asc' => 'name ASC',
        'name_desc' => 'name DESC',
        'oldest' => 'created_at ASC',
        default => 'created_at DESC' // newest
    };
    
    // Get total count for pagination
    $countSql = "SELECT COUNT(*) as total FROM products WHERE {$whereClause}";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch()['total'];
    
    // Main query with pagination
    $sql = "SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            WHERE {$whereClause} 
            ORDER BY {$orderBy} 
            LIMIT {$limit} OFFSET {$offset}";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get available materials for filter options
    $materialsStmt = $pdo->query("SELECT DISTINCT material FROM products WHERE material IS NOT NULL AND material != '' ORDER BY material");
    $availableMaterials = $materialsStmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Get price range for filter options
    $priceRangeStmt = $pdo->query("SELECT MIN(price) as min_price, MAX(price) as max_price FROM products WHERE is_active = 1");
    $priceRange = $priceRangeStmt->fetch(PDO::FETCH_ASSOC);
    
    // Response with metadata
    $result = [
        'products' => $products,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => intval($total),
            'total_pages' => ceil($total / $limit)
        ],
        'filters' => [
            'available_materials' => $availableMaterials,
            'price_range' => [
                'min' => floatval($priceRange['min_price'] ?? 0),
                'max' => floatval($priceRange['max_price'] ?? 0)
            ]
        ],
        'applied_filters' => [
            'search' => $search,
            'min_price' => $minPrice,
            'max_price' => $maxPrice,
            'material' => $material,
            'category_id' => $categoryId,
            'sort' => $sort
        ]
    ];
    
    // Store in cache for 5 minutes (300 seconds)
    $cache->set($cacheKey, $result, 300);
    
    echo json_encode($result);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

