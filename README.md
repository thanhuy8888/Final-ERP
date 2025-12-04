# Canifa Clone - E-commerce Website

Website thương mại điện tử theo mẫu Canifa, xây dựng bằng PHP với 2 khu vực riêng biệt:
- **Portal Khách hàng**: Duyệt sản phẩm, giỏ hàng, thanh toán
- **Portal Admin**: Quản lý sản phẩm, đơn hàng

## Công nghệ sử dụng
- **Backend**: PHP, MySQL
- **Frontend**: HTML, CSS, JavaScript
- **Database**: MySQL (HeidiSQL)
- **Server**: Laragon

## Cài đặt

### 1. Import Database
```bash
# Mở HeidiSQL
# Chạy file: database.sql
# Chạy file: sample_products.sql
```

### 2. Cấu hình
Kiểm tra file `includes/db.php` và cập nhật thông tin database nếu cần:
```php
$host = 'localhost';
$db   = 'final_erp';
$user = 'root';
$pass = '';
```

### 3. Truy cập
- **Khách hàng**: `http://localhost/Final ERP/`
- **Admin**: `http://localhost/Final ERP/admin/`

## Tính năng

### Khách hàng
- Trang chủ với sản phẩm nổi bật
- Duyệt sản phẩm theo danh mục
- Chi tiết sản phẩm
- Giỏ hàng
- Thanh toán
- Đăng ký / Đăng nhập

### Admin
- Dashboard thống kê
- Quản lý sản phẩm (Thêm, Sửa, Xóa)
- Quản lý đơn hàng
- Cập nhật trạng thái đơn hàng

## Cấu trúc thư mục
```
Final ERP/
├── admin/              # Khu vực admin
├── assets/             # CSS, JS, Images
├── includes/           # Shared PHP files
├── uploads/            # Product images
├── database.sql        # Database schema
├── sample_products.sql # Sample data
└── index.php           # Homepage
```

## Demo Products
Website đi kèm 7 sản phẩm mẫu:
- Nam: Áo Thun, Quần Jean, Áo Blazer
- Nữ: Váy Navy
- Bé trai: Áo Thun, Quần Short
- Bé gái: Váy Hồng

## License
MIT
