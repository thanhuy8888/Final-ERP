import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Filter, RefreshCw, Eye, User, AlertTriangle, ShoppingBag, Mail } from 'lucide-react';
import OrderDetailModal from '../../components/modals/OrderDetailModal';
import './Orders.css'; 

const AdminOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stores, setStores] = useState([]);
    const [staffRisks] = useState({}); // Giả lập dữ liệu AI Insights
    
    const [filters, setFilters] = useState({
        search: '',
        store_id: '',
        status: '',
    });

    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchStores();
        fetchOrders();
    }, []);

    const fetchStores = async () => {
        try {
            const res = await api.get('/admin/get_stores.php');
            setStores(res.data || []);
        } catch (err) { console.error("Store error", err); }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`/admin/orders.php?${params.toString()}`);
            setOrders(response.data);
        } catch (error) {
            console.error("Fetch orders error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({ search: '', store_id: '', status: '' });
        // Fetch lại ngay lập tức với filter trống
        setLoading(true);
        api.get('/admin/orders.php').then(res => {
            setOrders(res.data);
            setLoading(false);
        });
    };

    return (
        <div className="admin-page-container">
            {/* Header chuyên nghiệp hơn */}
            <div className="page-header-modern">
                <div className="header-title">
                    <h1>{t('admin.orderList')}</h1>
                    <p>{orders.length} orders total in your system</p>
                </div>
                <div className="header-actions">
                    <button className="btn-modern secondary" onClick={fetchOrders}>
                        <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                        Sync Data
                    </button>
                </div>
            </div>

            {/* Filter Bar sử dụng class hiện có */}
            <div className="filter-container">
                <div className="filter-group flex-1">
                    <label className="filter-label">Quick Search</label>
                    <div className="input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="Find by ID, customer name..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Location</label>
                    <select className="modern-select" value={filters.store_id} onChange={(e) => handleFilterChange('store_id', e.target.value)}>
                        <option value="">All Stores</option>
                        {stores.map(s => (
                            <option key={s.id} value={s.id}>{s.name.replace('Canifa - ', '')}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <select className="modern-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="filter-actions">
                    <button className="btn-modern primary" onClick={fetchOrders}>
                        <Filter size={16} /> Filter
                    </button>
                    <button className="btn-modern secondary" onClick={resetFilters}>
                         Clear
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="content-card-modern">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Updating order records...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Origin</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <div className="order-id-cell">
                                                <ShoppingBag size={14} />
                                                <span>#{order.id}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="customer-cell">
                                                <div className="avatar-placeholder">
                                                    {order.customer_name?.charAt(0)}
                                                </div>
                                                <div className="customer-info">
                                                    <span className="name">{order.customer_name}</span>
                                                    <span className="email"><Mail size={10}/> {order.customer_email || 'No email'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="store-info">
                                                <span className="s-name">{order.store_name?.replace('Canifa - ', '')}</span>
                                                <div className="staff-tag">
                                                    <User size={12} /> {order.staff_name || 'System'}
                                                    {staffRisks[order.user_id] && (
                                                        <div className="tooltip-container">
                                                            <AlertTriangle size={12} className="risk-icon" />
                                                            <span className="tooltip-text">
                                                                Risk Level: {staffRisks[order.user_id].rate}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="total-price">
                                                {parseInt(order.total_amount).toLocaleString()}₫
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge-soft ${order.status}`}>
                                                {t(`admin.statusLabels.${order.status}`)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="date-text">
                                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="text-right">
                                            <button className="btn-view-modern" onClick={() => setSelectedOrderId(order.id) || setIsModalOpen(true)}>
                                                <Eye size={14} /> Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {!loading && orders.length === 0 && (
                    <div className="empty-table-state">
                        <ShoppingBag size={48} />
                        <p>No orders matched your criteria</p>
                    </div>
                )}
            </div>

            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                orderId={selectedOrderId}
                onOrderUpdated={fetchOrders}
            />
        </div>
    );
};

export default AdminOrders;