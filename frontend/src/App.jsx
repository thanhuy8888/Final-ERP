import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import SaleLayout from './components/SaleLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import ProductForm from './pages/admin/ProductForm';
import OrderDetail from './pages/admin/OrderDetail';
import AdminUsers from './pages/admin/Users';
import AdminInventory from './pages/admin/Inventory';
import AdminPromotions from './pages/admin/Promotions';
import AdminReports from './pages/admin/Reports';
import SaleDashboard from './pages/sale/Dashboard';
import SaleOrders from './pages/sale/Orders';
import SaleCustomers from './pages/sale/Customers';
import SaleNewOrder from './pages/sale/NewOrder';
import './App.css';

function App() {
  return (
    <AuthProvider>
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
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

