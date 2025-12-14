import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/axios';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language, toggleLanguage } = useTranslation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        try {
            const response = await api.get('/cart.php');
            if (response.data && response.data.items) {
                const count = response.data.items.reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(count);
            }
        } catch (error) {
            console.error('Failed to fetch cart count', error);
        }
    };

    useEffect(() => {
        fetchCartCount();

        // Listen for custom event to update cart
        const handleCartUpdate = () => fetchCartCount();
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [user, location.pathname]); // Re-fetch on route change or user login

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    CANIFA
                </Link>

                <ul className="navbar-menu">
                    <li><Link to="/">{t('navbar.home')}</Link></li>
                    <li><Link to="/">{t('navbar.newProducts')}</Link></li>
                    <li><Link to="/">{t('navbar.men')}</Link></li>
                    <li><Link to="/">{t('navbar.women')}</Link></li>
                    <li><Link to="/">{t('navbar.kids')}</Link></li>
                </ul>

                <div className="navbar-actions">
                    <button
                        className="lang-toggle"
                        onClick={toggleLanguage}
                        title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                    >
                        {language === 'vi' ? '🇻🇳 VN' : '🇬🇧 EN'}
                    </button>

                    {user ? (
                        <>
                            <Link to="/cart" className="nav-icon-link cart-icon">
                                <span className="icon">🛒</span>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>

                            <div
                                className="user-menu-container"
                                onMouseEnter={() => setShowDropdown(true)}
                                onMouseLeave={() => setShowDropdown(false)}
                            >
                                <div className="user-avatar">
                                    <div className="avatar-circle">
                                        {(user.full_name || user.username).charAt(0).toUpperCase()}
                                    </div>
                                    <span className="user-name-display">{user.full_name || user.username}</span>
                                </div>

                                {showDropdown && (
                                    <div className="user-dropdown">
                                        <div className="dropdown-header">
                                            <strong>{t('navbar.welcome')}</strong>
                                            <span>{user.full_name || user.username}</span>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" className="dropdown-item">
                                                ⚙️ {t('navbar.admin')}
                                            </Link>
                                        )}
                                        <Link to="/orders" className="dropdown-item">
                                            📦 {t('home.myOrders')}
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={handleLogout} className="dropdown-item logout-item">
                                            🚪 {t('navbar.logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn-login">{t('navbar.login')}</Link>
                            <Link to="/register" className="btn-register">{t('navbar.register')}</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
