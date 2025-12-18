import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Filter, RefreshCw, Eye, User, AlertTriangle, Calendar } from 'lucide-react';
import OrderDetailModal from '../../components/modals/OrderDetailModal';
import './Inventory.css'; // Sử dụng file CSS chung đã tạo ở bước trước

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

    // Helper badge style
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="status-badge badge-yellow">Pending</span>;
            case 'processing': return <span className="status-badge badge-blue">Processing</span>;
            case 'completed': return <span className="status-badge badge-green">Completed</span>;
            case 'cancelled': return <span className="status-badge badge-red">Cancelled</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    return (
        <div className="inventory-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>{t('admin.orderList')}</h1>
                    <p className="subtitle">Review and manage customer orders effortlessly.</p>
                </div>
            </div>

            <div className="content-card">
                {/* Toolbar Filter */}
                <div className="toolbar" style={{ flexWrap: 'wrap', gap: '12px' }}>
                    <div className="search-bar" style={{ width: '300px' }}>
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Order ID, Customer Name..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
                        <select 
                            className="status-filter" 
                            style={{ minWidth: '160px' }}
                            value={filters.store_id} 
                            onChange={(e) => handleFilterChange('store_id', e.target.value)}
                        >
                            <option value="">All Stores</option>
                            {stores.map(s => <option key={s.id} value={s.id}>{s.name.replace('Canifa - ', '')}</option>)}
                        </select>

                        <select 
                            className="status-filter" 
                            style={{ minWidth: '140px' }}
                            value={filters.status} 
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        
                        {/* Date Pickers - styled simply as inputs for now */}
                        <div className="search-bar" style={{ width: 'auto', padding: '10px 14px' }}>
                            <Calendar size={16} color="#64748b" style={{ marginRight: '8px' }}/>
                            <input 
                                type="date" 
                                style={{ margin: 0, fontSize: '13px' }}
                                value={filters.date_start}
                                onChange={(e) => handleFilterChange('date_start', e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-primary" onClick={fetchOrders} style={{ padding: '10px 16px' }}>
                            <Filter size={16} /> Filter
                        </button>
                        <button className="btn-refresh" onClick={resetFilters} style={{ padding: '10px 16px' }}>
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading orders...</div>
                ) : (
                    <table className="admin-table">
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
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6' }}>#{order.id}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600, color: '#1e293b' }}>{order.customer_name}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{order.customer_email || order.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{order.store_name?.replace('Canifa - ', '') || order.store_id}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                            <User size={12} />
                                            <span>{order.staff_name || 'N/A'}</span>
                                            {staffRisks[order.user_id] && (
                                                <AlertTriangle size={12} color="#f59e0b" title={`High Return Rate: ${staffRisks[order.user_id].rate}%`} />
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#1e293b' }}>
                                        {parseInt(order.total_amount).toLocaleString()}{t('common.currency')}
                                    </td>
                                    <td>{getStatusBadge(order.status)}</td>
                                    <td style={{ color: '#64748b', fontSize: '13px' }}>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-icon" onClick={() => openDetail(order.id)} title="View Details">
                                            <Eye size={18} />
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