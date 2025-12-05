import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>Admin Panel</h2>
                    <p>Xin chào, {user?.username}</p>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin">Dashboard</Link>
                    <Link to="/admin/products">Sản phẩm</Link>
                    <Link to="/admin/orders">Đơn hàng</Link>
                    <Link to="/">Về trang chủ</Link>
                    <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
                </nav>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
