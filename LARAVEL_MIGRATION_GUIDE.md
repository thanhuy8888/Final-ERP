# Laravel Migration Guide - Final-ERP

## Hướng dẫn chuyển đổi sang Laravel Framework

### Bước 1: Cài đặt Composer (nếu chưa có)
```bash
# Download từ https://getcomposer.org/download/
# Hoặc với PowerShell:
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
```

### Bước 2: Tạo project Laravel mới
```bash
cd c:\xampp\htdocs

# Tạo Laravel project mới
php composer.phar create-project laravel/laravel Final-ERP-Laravel

# Hoặc nếu composer đã cài global:
composer create-project laravel/laravel Final-ERP-Laravel
```

### Bước 3: Cấu hình Database
```bash
cd Final-ERP-Laravel

# Sao chép .env.example sang .env
copy .env.example .env

# Generate app key
php artisan key:generate
```

Chỉnh sửa file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=final_erp
DB_USERNAME=root
DB_PASSWORD=
```

### Bước 4: Copy frontend sang Laravel
```bash
# Copy toàn bộ frontend React vào Laravel
xcopy /E /I "c:\xampp\htdocs\Final-ERP\frontend" "c:\xampp\htdocs\Final-ERP-Laravel\frontend"
```

### Bước 5: Tạo Laravel Migrations

Các file migration cần tạo (trong thư mục `database/migrations/`):

1. `create_users_table.php` - Mở rộng bảng users với role, phone
2. `create_customers_table.php`
3. `create_stores_table.php`
4. `create_product_variants_table.php`
5. `create_inventory_table.php`
6. `create_promotions_table.php`
7. `create_audit_logs_table.php`

### Bước 6: Tạo Laravel Controllers

```bash
php artisan make:controller Api/ProductController --api
php artisan make:controller Api/CartController --api
php artisan make:controller Api/Admin/UserController --api
php artisan make:controller Api/Admin/InventoryController --api
php artisan make:controller Api/Admin/PromotionController --api
```

### Bước 7: Chuyển logic từ PHP sang Laravel

Ví dụ chuyển `api/admin/products.php` sang Laravel:

**Trước (PHP thuần):**
```php
<?php
require_once '../includes/api_header.php';
$stmt = $pdo->query("SELECT * FROM products");
echo json_encode($stmt->fetchAll());
```

**Sau (Laravel Controller):**
```php
<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        return Product::all();
    }
}
```

### Bước 8: Cấu hình Routes

Thêm vào `routes/api.php`:
```php
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::apiResource('products', ProductController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('inventory', InventoryController::class);
    Route::apiResource('promotions', PromotionController::class);
});
```

### Bước 9: Cài đặt Authentication

```bash
php artisan install:api
# Chọn Sanctum cho SPA authentication
```

### Bước 10: Chạy Laravel

```bash
php artisan serve --port=8000
```

Cập nhật frontend axios base URL:
```javascript
// frontend/src/api/axios.js
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true,
});
```

---

## Lưu ý quan trọng

1. **Giữ nguyên database**: Laravel sẽ dùng chung database `final_erp` hiện tại
2. **Chạy song song**: Có thể chạy cả PHP API cũ và Laravel API mới trong quá trình chuyển đổi
3. **Test từng phần**: Chuyển từng API endpoint sang Laravel và test kỹ trước khi tiếp tục

---
