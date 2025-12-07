# Final-ERP 

A comprehensive Fashion ERP System featuring a modern React Frontend and a robust PHP Backend. It includes Customer, Sales Staff, and Administration portals.

![Tech Stack](https://skillicons.dev/icons?i=react,vite,php,mysql,html,css)

## 📂 Project Structure

```
Final-ERP/
├── api/               # PHP Backend API (RESTful)
│   ├── admin/         # Admin endpoints (Products, Stats)
│   ├── sale/          # Sales Staff endpoints (Stock, Orders)
│   └── ...            # Public endpoints (Auth, Products)
├── frontend/          # React Vite Application
│   ├── src/
│   │   ├── components/# Reusable UI components
│   │   ├── context/   # Auth & Language Context
│   │   ├── pages/     # Application Pages
│   │   └── ...
├── includes/          # Shared PHP Utilities (DB, Cache)
├── uploads/           # Product component images
└── erpiiiii.sql       # Consolidated Database Schema
```

## 🚀 Tech Stack

-   **Frontend**: React.js, Vite, Axios, React Router, Tailwind CSS (or Custom CSS).
-   **Backend**: Native PHP 8.x, PDO (MySQL Authentication).
-   **Database**: MySQL (MariaDB).
-   **Caching**: File-based Caching (Redis-free).
-   **Server**: XAMPP / Apache.

## 🔑 Demo Accounts

| Role | Username | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `123456` | `/admin` - Dashboard, Products, Orders |
| **Sales** | `saleuser` | `123456` | `/sale` - Stock Lookup, Manual Orders |
| **Customer** | `customer_test` | `123456` | `/` - Home, Cart, Checkout |

## 🛠️ Installation & Setup

### 1. Prerequisites
-   **XAMPP** (PHP 8.0+, MySQL/MariaDB)
-   **Node.js** (v18+)

### 2. Backend Setup
1.  Clone the repository into `c:\xampp\htdocs\Final-ERP`.
    ```bash
    git clone https://github.com/thanhuy8888/Final-ERP.git .
    ```
2.  Start **Apache** and **MySQL** in XAMPP Control Panel.
3.  Open [phpMyAdmin](http://localhost/phpmyadmin/).
4.  Create a new database named `final_erp`.
    *(Or simply import the file below which handles creation)*
5.  Import `erpiiiii.sql` into the database.
6.  Verify `includes/db.php` credentials:
    ```php
    $host = 'localhost';
    $db   = 'final_erp';
    $user = 'root';
    $pass = ''; // Default XAMPP password is empty
    ```

### 3. Frontend Setup
1.  Navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  (Optional) Install dependencies (node_modules is already included):
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

### 4. Access the Application
-   **Frontend**: [http://localhost:5173](http://localhost:5173)
-   **Backend API**: [http://localhost/Final-ERP/api](http://localhost/Final-ERP/api)

## 📋 Features Checklist
### Customer Portal
-   [x] Account Registration/Login
-   [x] Product Browsing & Search (Filter by Category, Price)
-   [x] Shopping Cart & Checkout (COD)
-   [x] Order History

### Sales Staff Portal
-   [x] Stock Lookup (Real-time Inventory)
-   [x] Manual Order Creation (Walk-in Customers)
-   [x] Returns & Exchanges

### Admin Portal
-   [x] Dashboard Analytics (Revenue, Top Products)
-   [x] Product Management (CRUD, Variants)
-   [x] Audit Logs

## 📝 License
This project is for educational purposes.
