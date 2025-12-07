import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t, language, toggleLanguage } = useTranslation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">CANIFA</Link>

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
                        {language === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}
                    </button>

                    {user ? (
                        <>
                            <span className="user-welcome">{t('navbar.welcome')}, {user.username}</span>
                            {user.role === 'admin' && <Link to="/admin" className="nav-link">{t('navbar.admin')}</Link>}
                            <Link to="/cart" className="nav-link">🛒 {t('navbar.cart')}</Link>
                            <button onClick={handleLogout} className="btn-logout">{t('navbar.logout')}</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">{t('navbar.login')}</Link>
                            <Link to="/register" className="nav-link">{t('navbar.register')}</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
