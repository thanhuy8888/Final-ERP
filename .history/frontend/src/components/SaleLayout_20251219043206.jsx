import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/axios';
import './SaleLayout.css';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/sale/notifications.php');
            if (res.data && Array.isArray(res.data)) {
                setNotifications(res.data);
                setUnreadCount(res.data.length);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleOpen = () => setIsOpen(!isOpen);

    const getIcon = (type) => {
        switch (type) {
            case 'alert': return '⚠️';
            case 'opportunity': return '🔥';
            case 'info': return 'ℹ️';
            default: return '🔔';
        }
    };

    return (
        <div className="notification-center" ref={dropdownRef}>
            <button className="btn-bell" onClick={toggleOpen} title="Thông báo">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Thông báo</h3>
                        <span className="mark-read">Đánh dấu đã đọc</span>
                    </div>
                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className={`notification-item type-${n.type}`}>
                                    <div className="notif-icon">{getIcon(n.type)}</div>
                                    <div className="notif-content">
                                        <h4>{n.title}</h4>
                                        <p>{n.message}</p>
                                        <span className="notif-time">{n.time}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-notif">Không có thông báo nào</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SaleLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { t, language, toggleLanguage } = useTranslation();
    const [ordersMenuOpen, setOrdersMenuOpen] = useState(true);

    const Icons = {
        Dashboard: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
        Plus: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
        FileText: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
        Package: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
        Users: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
        TrendingUp: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
        Box: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
        RotateCcw: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>,
        Globe: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
        LogOut: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
        ChevronDown: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>,
    };

    const menuItems = [
        { path: '/sale/customers', icon: <Icons.Users />, label: t('sale.customers') },
        { path: '/sale/stock', icon: <Icons.Box />, label: t('sale.stockLookup') },
        { path: '/sale/performance', icon: <Icons.TrendingUp />, label: t('sale.performance.title') },
    ];

    const ordersSubMenu = [
        { path: '/sale/new-order', icon: <Icons.Plus />, label: t('sale.newOrder') },
        { path: '/sale/drafts', icon: <Icons.FileText />, label: t('sale.draftOrders') },
        { path: '/sale/orders', icon: <Icons.Package />, label: t('sale.myOrders') },
        { path: '/sale/returns', icon: <Icons.RotateCcw />, label: t('sale.returns') },
    ];

    const isOrdersActive = ['/sale/new-order', '/sale/drafts', '/sale/orders', '/sale/returns'].some(
        path => location.pathname === path
    );

    return (
        <div className="sale-container">
            <aside className="sale-sidebar">
                <div className="sidebar-header">
                    {/* Logo Canifa Mới */}
                    <Link to="/sale" className="sidebar-logo">
                        <span>CANIFA</span>
                    </Link>
                    
                    {/* Chuyển Notification Center vào đây */}
                    <NotificationCenter />
                </div>

                <div className="user-info-section">
                    {t('navbar.welcome')}, <strong>{user?.full_name || user?.username}</strong>
                </div>

                <ul className="sidebar-menu">
                    {/* Dashboard */}
                    <li className="menu-item">
                        <Link
                            to="/sale"
                            className={`menu-link ${location.pathname === '/sale' || location.pathname === '/sale/' ? 'active' : ''}`}
                        >
                            <span className="menu-icon"><Icons.Dashboard /></span>
                            {t('admin.dashboard')}
                        </Link>
                    </li>

                    {/* Orders Menu Group */}
                    <li className="menu-item menu-group">
                        <div
                            className={`menu-link menu-group-header ${isOrdersActive ? 'active' : ''}`}
                            onClick={() => setOrdersMenuOpen(!ordersMenuOpen)}
                        >
                            <span className="menu-icon"><Icons.Package /></span>
                            {t('sale.ordersGroup')}
                            <span className={`chevron ${ordersMenuOpen ? 'open' : ''}`}>
                                <Icons.ChevronDown />
                            </span>
                        </div>
                        {ordersMenuOpen && (
                            <ul className="submenu">
                                {ordersSubMenu.map((item) => (
                                    <li key={item.path} className="submenu-item">
                                        <Link
                                            to={item.path}
                                            className={`submenu-link ${location.pathname === item.path ? 'active' : ''}`}
                                        >
                                            <span className="menu-icon">{item.icon}</span>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>

                    {/* Other menu items */}
                    {menuItems.map((item) => (
                        <li key={item.path} className="menu-item">
                            <Link
                                to={item.path}
                                className={`menu-link ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span className="menu-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="sidebar-footer">
                    <button onClick={toggleLanguage} className="lang-btn">
                        <Icons.Globe /> {language === 'vi' ? 'Tiếng Việt' : 'English'}
                    </button>
                    <button onClick={logout} className="logout-btn">
                        <Icons.LogOut /> {t('navbar.logout')}
                    </button>
                </div>
            </aside>

            <main className="sale-main">
                {/* Đã xóa Header ở đây theo yêu cầu */}
                <div className="sale-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default SaleLayout;