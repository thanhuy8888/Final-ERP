import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Filter, RefreshCw, Eye, User, ShoppingBag } from 'lucide-react';
import OrderDetailModal from '../../components/modals/OrderDetailModal';
import './Orders.css';

const AdminOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stores, setStores] = useState([]);
    const [filters, setFilters] = useState({ search: '', store_id: '', status: '', date_start: '', date_end: '' });
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
        } catch (err) { console.error("Store error"); }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)));
            const response = await api.get(`/admin/orders.php?${params.toString()}`);
            setOrders(response.data);
        } catch (error) { console.error("Fetch error"); } 
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
            <div className="admin-header" style={{ marginBottom: '32px' }}>
                <h1>{t('admin.orderList')}</h1>
                <p className="text-muted">Review and fulfill customer orders in real-time.</p>
            </div>

            <div className="filter-container">
                <div className="filter-group" style={{ flex: 1.5 }}>
                    <label className="filter-label">Quick Search</label>
                    <div className="input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            className="modern-input" style={{ paddingLeft: '44px' }}
                            placeholder="Order ID, Customer..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-group" style={{ flex: 1 }}>
                    <label className="filter-label">Location</label>
                    <select className="modern-select" value={filters.store_id} onChange={(e) => handleFilterChange('store_id', e.target.value)}>
                        <option value="">All Stores</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name.replace('Canifa - ', '')}</option>)}
                    </select>
                </div>

                <div className="filter-group" style={{ flex: 1 }}>
                    <label className="filter-label">Status</label>
                    <select className="modern-select" value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-modern primary" onClick={fetchOrders}><Filter size={18} /> Apply</button>
                    <button className="btn-modern secondary" onClick={resetFilters}><RefreshCw size={18} /></button>
                </div>
            </div>

            <div className="content-card">
                {loading ? (
                    <div style={{ padding: '80px', textAlign: 'center' }}>
                        <RefreshCw className="animate-spin" size={24} style={{ color: '#cbd5e1' }} />
                    </div>
                ) : (
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Store & Staff</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: '700', fontFamily: 'monospace' }}>#{order.id}</td>
                                    <td>
                                        <div style={{ fontWeight: '600' }}>{order.customer_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.customer_email || order.email}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{order.store_name?.replace('Canifa - ', '')}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <User size={12} /> {order.staff_name || 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: '700' }}>
                                        {parseInt(order.total_amount).toLocaleString()}₫
                                    </td>
                                    <td>
                                        <span className={`badge-soft ${order.status}`}>
                                            {t(`admin.statusLabels.${order.status}`)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-modern secondary" style={{ height: '36px', padding: '0 12px', fontSize: '0.8rem' }} onClick={() => openDetail(order.id)}>
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <OrderDetailModal
                isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
                orderId={selectedOrderId} onOrderUpdated={fetchOrders}
            />
        </div>
    );
};

export default AdminOrders;