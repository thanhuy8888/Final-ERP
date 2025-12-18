import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Filter, RefreshCw, Eye, User, AlertTriangle } from 'lucide-react';
import OrderDetailModal from '../../components/modals/OrderDetailModal';
import './AdminShared.css'; // Import CSS chung

const AdminOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [staffRisks, setStaffRisks] = useState({});
    const [stores, setStores] = useState([]);
    const [filters, setFilters] = useState({
        search: '',
        store_id: '',
        status: '',
        date_start: '',
        date_end: ''
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
        } catch (err) { console.error("Failed to load stores"); }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`/admin/orders.php?${params.toString()}`);
            setOrders(response.data);
        } catch (error) { console.error("Failed to fetch orders", error); } 
        finally { setLoading(false); }
    };

    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
    
    const resetFilters = () => {
        setFilters({ search: '', store_id: '', status: '', date_start: '', date_end: '' });
        setTimeout(() => fetchOrders(), 0);
    };

    const openDetail = (id) => {
        setSelectedOrderId(id);
        setIsModalOpen(true);
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <div>
                    <h1>{t('admin.orderList')}</h1>
                    <p className="text-muted">Review and manage customer orders effortlessly.</p>
                </div>
            </div>

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

                <div className="filter-group" style={{ width: '220px' }}>
                    <label className="filter-label">Store Location</label>
                    <select className="modern-select" value={filters.store_id} onChange={(e) => handleFilterChange('store_id', e.target.value)}>
                        <option value="">All Stores</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name.replace('Canifa - ', '')}</option>)}
                    </select>
                </div>

                <div className="filter-group" style={{ width: '180px' }}>
                    <label className="filter-label">Status</label>
                    <select className="modern-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="filter-group" style={{ flexDirection: 'row', gap: '10px' }}>
                    <button className="btn-modern primary" onClick={fetchOrders}>
                        <Filter size={16} /> Filter
                    </button>
                    <button className="btn-modern secondary" onClick={resetFilters}>
                        <RefreshCw size={16} /> Reset
                    </button>
                </div>
            </div>

            <div className="content-card">
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading orders...</div>
                ) : (
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Client</th>
                                <th>Store & Staff</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>#{order.id}</td>
                                    <td>
                                        <div className="user-cell">
                                            <span style={{ fontWeight: 600 }}>{order.customer_name}</span>
                                            <span className="user-sub">{order.customer_email || order.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{order.store_name?.replace('Canifa - ', '') || order.store_id}</div>
                                        <div className="staff-info">
                                            <User size={14} />
                                            <span>{order.staff_name || 'N/A'}</span>
                                            {staffRisks[order.user_id] && (
                                                <AlertTriangle size={14} color="#f59e0b" title={`High Return Rate: ${staffRisks[order.user_id].rate}%`} />
                                            )}
                                        </div>
                                    </td>
                                    <td className="price-text">{parseInt(order.total_amount).toLocaleString()}{t('common.currency')}</td>
                                    <td>
                                        <span className={`badge-soft ${order.status}`}>
                                            {t(`admin.statusLabels.${order.status}`) || order.status}
                                        </span>
                                    </td>
                                    <td style={{ color: '#64748b' }}>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-modern secondary" style={{ height: '36px', padding: '0 12px' }} onClick={() => openDetail(order.id)}>
                                            <Eye size={16} /> View
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