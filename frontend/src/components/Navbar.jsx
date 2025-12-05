import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">CANIFA</Link>

                <ul className="navbar-menu">
                    <li><Link to="/">Trang chủ</Link></li>
                    <li><Link to="/">Sản phẩm mới</Link></li>
                    <li><Link to="/">Nam</Link></li>
                    <li><Link to="/">Nữ</Link></li>
                    <li><Link to="/">Trẻ em</Link></li>
                </ul>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <span className="user-welcome">Xin chào, {user.username}</span>
                            {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
                            <Link to="/cart" className="nav-link">🛒 Giỏ hàng</Link>
                            <button onClick={handleLogout} className="btn-logout">Đăng xuất</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Đăng nhập</Link>
                            <Link to="/register" className="nav-link">Đăng ký</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
