import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import {
    LayoutDashboard,
    Package,
    Warehouse,
    ShoppingCart,
    Users,
    Tag,
    BarChart3,
    Home,
    Settings,
    FileText,
    Layers,
    RefreshCw,
    Shield,
    ChevronRight,
    ShoppingBag
} from 'lucide-react';
import './AdminLayout.css';

const NavGroup = ({ title, icon: Icon, children, isActiveGroup, to }) => {
    const [isExpanded, setIsExpanded] = useState(isActiveGroup);
    const navigate = useNavigate();

    useEffect(() => {
        if (isActiveGroup) setIsExpanded(true);
    }, [isActiveGroup]);

    const handleHeaderClick = () => {
        if (to) {
            navigate(to);
        }
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="nav-group-container">
            <div
                className={`nav-group-header ${isExpanded ? 'expanded' : ''}`}
                onClick={handleHeaderClick}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {Icon && <Icon size={18} />}
                    <span>{title}</span>
                </div>
                <ChevronRight size={16} className="chevron" />
            </div>
            <div className={`nav-sub-menu ${isExpanded ? 'open' : ''}`}>
                {children}
            </div>
        </div>
    );
};

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, language, toggleLanguage } = useTranslation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';
    const isGroupActive = (paths) => paths.some(path => location.pathname.startsWith(path));

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>{t('admin.panel')}</h2>
                    <p>{t('admin.welcome')}, {user?.full_name || user?.username}</p>
                </div>

                <nav className="admin-nav">
                    {/* Dashboard */}
                    <Link to="/admin" className={isActive('/admin')}>
                        <LayoutDashboard size={18} /> {t('admin.dashboard')}
                    </Link>

                    {/* Product Management */}
                    <NavGroup
                        title={t('admin.productManagement')}
                        icon={Package}
                        isActiveGroup={isGroupActive(['/admin/products'])}
                        to="/admin/products"
                    >
                        <Link to="/admin/products" className={`nav-sub-item ${isActive('/admin/products')}`}>
                            <Package size={16} /> {t('admin.products')}
                        </Link>
                        <Link to="/admin/products/variants" className={`nav-sub-item ${isActive('/admin/products/variants')}`}>
                            <Layers size={16} /> {t('admin.variants')}
                        </Link>
                        <Link to="/admin/products/categories" className={`nav-sub-item ${isActive('/admin/products/categories')}`}>
                            <Tag size={16} /> {t('admin.categories')}
                        </Link>
                    </NavGroup>

                    {/* Inventory Management */}
                    <NavGroup
                        title={t('admin.inventoryManagement')}
                        icon={Warehouse}
                        isActiveGroup={isGroupActive(['/admin/inventory'])}
                        to="/admin/inventory"
                    >
                        <Link to="/admin/inventory" className={`nav-sub-item ${isActive('/admin/inventory')}`}>
                            <Warehouse size={16} /> {t('admin.stockOverview')}
                        </Link>
                        <Link to="/admin/inventory/adjust" className={`nav-sub-item ${isActive('/admin/inventory/adjust')}`}>
                            <RefreshCw size={16} /> {t('admin.stockAdjustment')}
                        </Link>
                        <Link to="/admin/inventory/transfer" className={`nav-sub-item ${isActive('/admin/inventory/transfer')}`}>
                            <FileText size={16} /> {t('admin.stockTransfer')}
                        </Link>
                    </NavGroup>

                    {/* Order Management */}
                    <NavGroup
                        title={t('admin.orderManagement')}
                        icon={ShoppingBag}
                        isActiveGroup={isGroupActive(['/admin/orders'])}
                        to="/admin/orders"
                    >
                        <Link to="/admin/orders" className={`nav-sub-item ${isActive('/admin/orders')}`}>
                            <ShoppingCart size={16} /> {t('admin.orders')}
                        </Link>
                        <Link to="/admin/orders/returns" className={`nav-sub-item ${isActive('/admin/orders/returns')}`}>
                            <RefreshCw size={16} /> {t('admin.returns')}
                        </Link>
                    </NavGroup>

                    {/* Customer & Loyalty */}
                    <NavGroup
                        title={t('admin.customerLoyalty')}
                        icon={Users}
                        isActiveGroup={isGroupActive(['/admin/customers', '/admin/loyalty', '/admin/membership'])}
                        to="/admin/customers"
                    >
                        <Link to="/admin/customers" className={`nav-sub-item ${isActive('/admin/customers')}`}>
                            <Users size={16} /> {t('admin.customers')}
                        </Link>
                        <Link to="/admin/membership" className={`nav-sub-item ${isActive('/admin/membership')}`}>
                            <Tag size={16} /> Membership Tiers
                        </Link>
                        <Link to="/admin/loyalty/points" className={`nav-sub-item ${isActive('/admin/loyalty/points')}`}>
                            <Tag size={16} /> {t('admin.loyaltyPoints')}
                        </Link>
                    </NavGroup>

                    {/* Other Main Items */}
                    <Link to="/admin/promotions" className={`nav-group-header ${isActive('/admin/promotions')}`} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Tag size={18} />
                            <span>{t('admin.promotionManagement')}</span>
                        </div>
                    </Link>
                    <Link to="/admin/reports" className={`nav-group-header ${isActive('/admin/reports')}`} style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BarChart3 size={18} />
                            <span>{t('admin.reportingAnalytics')}</span>
                        </div>
                    </Link>

                    {/* User & System */}
                    <NavGroup
                        title={t('admin.userSystemManagement')}
                        icon={Settings}
                        isActiveGroup={isGroupActive(['/admin/system', '/admin/users'])}
                        to="/admin/users"
                    >
                        <Link to="/admin/users" className={`nav-sub-item ${isActive('/admin/users')}`}>
                            <Users size={16} /> {t('admin.users')}
                        </Link>
                        <Link to="/admin/system/roles" className={`nav-sub-item ${isActive('/admin/system/roles')}`}>
                            <Shield size={16} /> {t('admin.rolesPermissions')}
                        </Link>
                        <Link to="/admin/system/audit-logs" className={`nav-sub-item ${isActive('/admin/system/audit-logs')}`}>
                            <FileText size={16} /> {t('admin.auditLogs')}
                        </Link>
                    </NavGroup>

                    <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <button
                            className="lang-toggle-admin"
                            onClick={toggleLanguage}
                            title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                        >
                            {language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
                        </button>
                        <Link to="/" className="nav-group-header" style={{ marginTop: '10px', textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Home size={18} />
                                <span>{t('admin.backHome')}</span>
                            </div>
                        </Link>
                        <button onClick={handleLogout} className="logout-btn">
                            {t('admin.logout')}
                        </button>
                    </div>
                </nav>
            </aside>
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
