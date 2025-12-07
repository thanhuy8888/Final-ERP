import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Lazy load layouts
// Lazy load customer pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));

// Lazy load admin pages
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminPromotions = lazy(() => import('./pages/admin/Promotions'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));

// Direct import for debugging
import SaleLayout from './components/SaleLayout';
import SaleDashboard from './pages/sale/Dashboard';
import SaleOrders from './pages/sale/Orders';
import SaleCustomers from './pages/sale/Customers';
import SaleNewOrder from './pages/sale/NewOrder';
import SaleReturns from './pages/sale/Returns';
import SaleStockLookup from './pages/sale/StockLookup';

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

function App() {
  return (
    <AuthProvider>
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
            <Route path="customers" element={<SaleCustomers />} />
            <Route path="new-order" element={<SaleNewOrder />} />
            <Route path="returns" element={<SaleReturns />} />

          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
