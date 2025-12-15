# Final ERP System

A comprehensive Enterprise Resource Planning (ERP) system built with PHP backend and React frontend.

## 🚀 Features

### Admin Dashboard
- **Dashboard Overview**: Real-time KPIs, revenue charts, order status tracking
- **Product Management**: Full CRUD operations, variant management, category management
- **Order Management**: Order processing, returns handling, order tracking
- **Inventory Management**: Stock tracking, stock adjustments, stock transfers between stores
- **Customer & Loyalty**: Customer management, membership tiers, loyalty points system
- **Promotion Management**: Discount codes, promotion campaigns
- **Reporting & Analytics**: 
  - Sales & Inventory Reports
  - Customer Analytics
  - Promotion Analytics
- **User & System**: User management, roles & permissions, audit logs

### Sales Dashboard
- Quick order creation with barcode scanning
- Customer lookup and management
- Real-time inventory checking
- Performance tracking
- Draft orders management

## 🛠️ Tech Stack

### Frontend
- **React** 18+ with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Chart.js** & **react-chartjs-2** for data visualization
- **Lucide React** for icons
- **CSS** for styling

### Backend
- **PHP** 8.0+
- **MySQL** database
- **PDO** for database operations
- Session-based authentication

## 📦 Installation

### Prerequisites
- **XAMPP** (or similar: Apache + MySQL + PHP 8.0+)
- **Node.js** 16+ and npm
- **Git**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Final-ERP.git
   cd Final-ERP
   ```

2. **Move to XAMPP htdocs**
   ```bash
   # Copy the entire project to C:\xampp\htdocs\
   ```

3. **Database Setup**
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Click "Import" tab
   - Choose file `final_erp.sql`
   - Click "Go"
   
   > **Note:** Database `final_erp` will be created automatically!

4. **Verify Database Connection**
   - File `includes/db.php` is already configured with XAMPP defaults
   - If you use different settings, edit this file:
     - `$dbname = 'final_erp'`
     - `$username = 'root'`
     - `$password = ''`

5. **Start Apache and MySQL**
   - Open XAMPP Control Panel
   - Start Apache and MySQL services

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (Optional - only if Apache uses different port)
   ```bash
   # If your Apache runs on port other than 8081:
   # 1. Copy .env.example to .env
   cp .env.example .env
   
   # 2. Edit .env and change the port
   # VITE_API_URL=http://localhost:YOUR_PORT/Final-ERP/api
   ```
   
   > **Note:** Default is port 8081. Skip this step if using XAMPP defaults.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8081/Final-ERP/api

## 👤 Default Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `123456`

### Sales Account
- **Username**: `saleuser`
- **Password**: `123456`

### Customer Account
- **Username**: `customer_test`
- **Password**: `123456`

## 📁 Project Structure

```
Final-ERP/
├── api/                    # Backend API endpoints
│   ├── admin/             # Admin-specific endpoints
│   ├── auth/              # Authentication endpoints
│   └── customer/          # Customer-facing endpoints
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom hooks
│   │   └── api/           # API configuration
│   └── public/            # Static assets
├── includes/              # PHP includes
│   ├── db.php            # Database connection (gitignored)
│   └── api_header.php    # API headers
└── database/             # Database files
    └── schema.sql        # Database schema
```

## 🔒 Security Notes

- **Never commit** `includes/db.php` with real credentials
- Change default passwords in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Implement rate limiting for API endpoints

## 🚀 Deployment

### Production Checklist
- [ ] Update database credentials
- [ ] Change default admin password
- [ ] Build frontend for production: `npm run build`
- [ ] Configure proper CORS settings
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure error logging
- [ ] Optimize images and assets

## 📝 License

This project is for educational purposes.

## 👨‍💻 Author

Your Name - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- Built as a final project for [Course Name]
- Special thanks to [Instructor/Team]
