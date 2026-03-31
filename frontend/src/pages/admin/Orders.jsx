import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Filter, RefreshCw, Eye, User, AlertTriangle } from 'lucide-react';
import OrderDetailModal from '../../components/modals/OrderDetailModal';
import './Orders.css'; // Import the new styles

const AdminOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [staffRisks, setStaffRisks] = useState({}); // AI Insights

    // Filters
    const [stores, setStores] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        store_id: '',
        status: '',
        date_start: '',
        date_end: ''
    });

    // Modal
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
        } catch (err) {
            console.error("Failed to load stores");
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.store_id) params.append('store_id', filters.store_id);
            if (filters.status) params.append('status', filters.status);
            if (filters.date_start) params.append('date_start', filters.date_start);
            if (filters.date_end) params.append('date_end', filters.date_end);

            const response = await api.get(`/admin/orders.php?${params.toString()}`);
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        fetchOrders();
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            store_id: '',
            status: '',
            date_start: '',
            date_end: ''
        });
        setTimeout(() => fetchOrders(), 0);
    };

    const openDetail = (id) => {
        setSelectedOrderId(id);
        setIsModalOpen(true);
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{t('admin.orderList')}</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Review and manage customer orders effortlessly.</p>
                </div>
            </div>

            {/* Modern Filter Bar */}
            <div className="filter-container">
                <div className="filter-group" style={{ flex: 1, minWidth: '240px' }}>
                    <label className="filter-label">Search Order</label>
                    <div className="input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="Order ID, Customer Name..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-group" style={{ width: '200px' }}>
                    <label className="filter-label">Store Location</label>
                    <select className="modern-select" value={filters.store_id} onChange={(e) => handleFilterChange('store_id', e.target.value)}>
                        <option value="">All Stores</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name.replace('Canifa - ', '')}</option>)}
                    </select>
                </div>

                <div className="filter-group" style={{ width: '160px' }}>
                    <label className="filter-label">Status</label>
                    <select className="modern-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="filter-group" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '8px' }}>
                    <button className="btn-modern primary" onClick={applyFilters}>
                        <Filter size={16} /> Filter
                    </button>
                    <button className="btn-modern secondary" onClick={resetFilters}>
                        <RefreshCw size={16} /> Reset
                    </button>
                </div>
            </div>

            <div className="content-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading orders...</div>
                ) : (
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Client</th>
                                <th>Store</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>#{order.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{order.customer_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.customer_email || order.email}</div>
                                    </td>
                                    <td>
                                        <div>{order.store_name?.replace('Canifa - ', '') || order.store_id}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User size={12} />
                                            <span>{order.staff_name || 'N/A'}</span>
                                            {staffRisks[order.user_id] && (
                                                <div className="tooltip-container" style={{ position: 'relative', display: 'inline-block' }}>
                                                    <AlertTriangle size={12} color="#f59e0b" style={{ cursor: 'help' }} />
                                                    <span className="tooltip-text">
                                                        High Return Rate: {staffRisks[order.user_id].rate}%
                                                        <br />
                                                        ({staffRisks[order.user_id].details})
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{parseInt(order.total_amount).toLocaleString()}{t('common.currency')}</td>
                                    <td>
                                        <span className={`badge-soft ${order.status}`}>
                                            {t(`admin.statusLabels.${order.status}`)}
                                        </span>
                                    </td>
                                    <td style={{ color: '#64748b' }}>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="btn-view-modern"
                                            onClick={() => openDetail(order.id)}
                                        >
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
