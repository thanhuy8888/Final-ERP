import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import './SaleLayout.css';

const SaleLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t, language, toggleLanguage } = useTranslation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="sale-layout">
            <aside className="sale-sidebar">
                <div className="sale-brand">
                    <h2>👔 {t('sale.panel')}</h2>
                    <p>{t('sale.welcome')}, {user?.username}</p>
                </div>
                <nav className="sale-nav">
                    <Link to="/sale">📊 {t('sale.dashboard')}</Link>
                    <Link to="/sale/orders">🛒 {t('sale.myOrders')}</Link>
                    <Link to="/sale/customers">👥 {t('sale.customers')}</Link>
                    <Link to="/sale/new-order">➕ {t('sale.createOrder')}</Link>
                    <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #444' }} />
                    <button
                        className="lang-toggle-sale"
                        onClick={toggleLanguage}
                        title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                    >
                        {language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
                    </button>
                    <Link to="/">🏠 {t('sale.backHome')}</Link>
                    <button onClick={handleLogout} className="logout-btn">🚪 {t('sale.logout')}</button>
                </nav>
            </aside>
            <main className="sale-content">
                {children || <Outlet />}
            </main>
        </div>
    );
};

export default SaleLayout;
