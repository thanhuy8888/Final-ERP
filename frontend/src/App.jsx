import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Lazy load layouts
// Lazy load customer pages
const Home = lazy(() => import('./pages/customer/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/customer/Register'));
const ProductDetail = lazy(() => import('./pages/customer/ProductDetail'));
const Cart = lazy(() => import('./pages/customer/Cart'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const Orders = lazy(() => import('./pages/customer/Orders'));

// Lazy load admin pages
const AdminLayout = lazy(() => import('./components/AdminLayout'));
// const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductList = lazy(() => import('./pages/admin/products/ProductList'));
const VariantManager = lazy(() => import('./pages/admin/products/VariantManager'));
const ProductDetailAdmin = lazy(() => import('./pages/admin/products/ProductDetail'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const CategoryList = lazy(() => import('./pages/admin/categories/CategoryList'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminRoles = lazy(() => import('./pages/admin/Roles'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminReturns = lazy(() => import('./pages/admin/Returns')); // Import Returns
const StockAdjustments = lazy(() => import('./pages/admin/StockAdjustments'));

const StockTransfer = lazy(() => import('./pages/admin/StockTransfer'));

const AdminPromotions = lazy(() => import('./pages/admin/Promotions'));
const AdminMembership = lazy(() => import('./pages/admin/Membership')); // New Import
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers')); // New Import
const AdminLoyaltyPoints = lazy(() => import('./pages/admin/LoyaltyPoints')); // New Import
const AdminCustomerDetail = lazy(() => import('./pages/admin/Customers')); // Placeholder if needed
// Direct import for debugging
import AdminDashboard from './pages/admin/Dashboard';
import SaleLayout from './components/SaleLayout';
import SaleDashboard from './pages/sale/Dashboard';
import SaleOrders from './pages/sale/Orders';
import SaleCustomers from './pages/sale/Customers';
import SaleNewOrder from './pages/sale/NewOrder';
import SaleReturns from './pages/sale/Returns';
import SaleStockLookup from './pages/sale/StockLookup';
import SaleOrderDetail from './pages/sale/OrderDetail';
import SalePerformance from './pages/sale/Performance';
import SaleDraftOrders from './pages/sale/DraftOrders';

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #E31E24',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

import { ToastProvider } from './contexts/ToastContext';

// ... existing imports ...

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />

            {/* Sale Routes */}
            <Route path="/sale" element={
              <ProtectedRoute saleOnly>
                <SaleLayout />
              </ProtectedRoute>
            }>
              <Route index element={<SaleDashboard />} />
              <Route path="orders" element={<SaleOrders />} />
              <Route path="orders/:id" element={<SaleOrderDetail />} />
              <Route path="customers" element={<SaleCustomers />} />
              <Route path="new-order" element={<SaleNewOrder />} />
              <Route path="drafts" element={<SaleDraftOrders />} />
              <Route path="returns" element={<SaleReturns />} />
              <Route path="stock" element={<SaleStockLookup />} />
              <Route path="performance" element={<SalePerformance />} />

            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/variants" element={<VariantManager />} />
              <Route path="products/categories" element={<CategoryList />} />
              <Route path="products/:id" element={<ProductDetailAdmin />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/edit/:id" element={<ProductForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/returns" element={<AdminReturns />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="customers" element={<AdminCustomers />} /> {/* New Route */}
              <Route path="membership" element={<AdminMembership />} /> {/* New Route */}
              <Route path="loyalty/points" element={<AdminLoyaltyPoints />} /> {/* New Route */}
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="inventory/adjust" element={<StockAdjustments />} />
              <Route path="inventory/transfer" element={<StockTransfer />} />
              <Route path="promotions" element={<AdminPromotions />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="system/users" element={<AdminUsers />} />
              <Route path="system/roles" element={<AdminRoles />} />
              <Route path="system/audit-logs" element={<AuditLogs />} />
            </Route>
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
