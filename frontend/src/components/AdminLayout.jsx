import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t, language, toggleLanguage } = useTranslation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>{t('admin.panel')}</h2>
                    <p>{t('admin.welcome')}, {user?.username}</p>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin">📊 {t('admin.dashboard')}</Link>
                    <Link to="/admin/products">📦 {t('admin.products')}</Link>
                    <Link to="/admin/inventory">🏪 {t('admin.inventory')}</Link>
                    <Link to="/admin/orders">🛒 {t('admin.orders')}</Link>
                    <Link to="/admin/users">👥 {t('admin.users')}</Link>
                    <Link to="/admin/promotions">🎁 {t('admin.promotions')}</Link>
                    <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #444' }} />
                    <button
                        className="lang-toggle-admin"
                        onClick={toggleLanguage}
                        title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                    >
                        {language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
                    </button>
                    <Link to="/">🏠 {t('admin.backHome')}</Link>
                    <button onClick={handleLogout} className="logout-btn">🚪 {t('admin.logout')}</button>
                </nav>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
