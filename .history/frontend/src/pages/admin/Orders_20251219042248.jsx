import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Filter, RefreshCw, Eye, User, AlertTriangle, Calendar } from 'lucide-react';
import OrderDetailModal from '../../components/modals/OrderDetailModal';

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

    // --- STYLES (Đồng bộ với Membership & Categories) ---
    const s = {
        container: { padding: '32px 40px', background: '#F8FAFC', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' },
        header: { marginBottom: '32px' },
        title: { fontSize: '32px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' },
        subtitle: { color: '#64748B', fontSize: '15px', marginTop: '4px', fontWeight: '500' },
        
        // Card & Toolbar
        card: { background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' },
        toolbar: { padding: '24px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
        
        // Inputs & Selects
        searchWrapper: { display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 16px', width: '280px' },
        input: { border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '14px', color: '#0F172A' },
        select: { padding: '10px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontSize: '14px', fontWeight: '500', color: '#334155', outline: 'none', cursor: 'pointer', minWidth: '140px' },
        dateInput: { padding: '10px 12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontSize: '13px', color: '#334155', outline: 'none' },

        // Buttons
        btnFilter: { background: '#E11D48', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.2)' },
        btnRefresh: { background: 'white', border: '1px solid #E2E8F0', color: '#64748B', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
        
        // Table
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
        td: { padding: '20px 24px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', verticalAlign: 'middle', color: '#334155' },
        
        // Badges & Actions
        statusBadge: (status) => {
            const styles = {
                pending: { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' },
                processing: { bg: '#EFF6FF', text: '#3B82F6', border: '#DBEAFE' },
                completed: { bg: '#ECFDF5', text: '#059669', border: '#D1FAE5' },
                cancelled: { bg: '#FEF2F2', text: '#EF4444', border: '#FECACA' }
            };
            const s = styles[status] || styles.pending;
            return {
                background: s.bg, color: s.text, border: `1px solid ${s.border}`,
                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block'
            };
        },
        actionBtn: {
            width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E2E8F0', 
            background: 'white', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' 
        },
        // Wrapper để fix lỗi lệch
        actionWrapper: { display: 'flex', justifyContent: 'flex-end' } 
    };

    return (
        <div style={s.container}>
            {/* Header */}
            <div style={s.header}>
                <h1 style={s.title}>{t('admin.orderList')}</h1>
                <p style={s.subtitle}>Review and manage customer orders effortlessly.</p>
            </div>

            <div style={s.card}>
                {/* Toolbar */}
                <div style={s.toolbar}>
                    <div style={s.searchWrapper}>
                        <Search size={18} color="#94A3B8" />
                        <input
                            style={s.input}
                            type="text"
                            placeholder="Order ID, Client..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <select style={s.select} value={filters.store_id} onChange={(e) => handleFilterChange('store_id', e.target.value)}>
                        <option value="">All Stores</option>
                        {stores.map(s => <option key={s.id} value={s.id}>{s.name.replace('Canifa - ', '')}</option>)}
                    </select>

                    <select style={s.select} value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <div style={{display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 12px'}}>
                        <Calendar size={16} color="#94A3B8" />
                        <input type="date" style={{...s.dateInput, border: 'none'}} value={filters.date_start} onChange={(e) => handleFilterChange('date_start', e.target.value)} />
                    </div>

                    <div style={{marginLeft: 'auto', display: 'flex', gap: '8px'}}>
                        <button style={s.btnFilter} onClick={fetchOrders}>
                            <Filter size={16} /> Filter
                        </button>
                        <button style={s.btnRefresh} onClick={resetFilters} title="Reset">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading orders...</div>
                ) : (
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>Order ID</th>
                                <th style={s.th}>Client</th>
                                <th style={s.th}>Store & Staff</th>
                                <th style={s.th}>Total</th>
                                <th style={s.th}>Status</th>
                                <th style={s.th}>Date</th>
                                <th style={{...s.th, textAlign: 'right', paddingRight: '32px'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} style={{ background: 'white' }}>
                                    <td style={{...s.td, fontFamily: 'monospace', fontWeight: 700, color: '#3B82F6'}}>#{order.id}</td>
                                    <td style={s.td}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 600, color: '#0F172A' }}>{order.customer_name}</span>
                                            <span style={{ fontSize: '13px', color: '#64748B' }}>{order.customer_email || order.email}</span>
                                        </div>
                                    </td>
                                    <td style={s.td}>
                                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#334155' }}>{order.store_name?.replace('Canifa - ', '') || order.store_id}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                                            <User size={12} />
                                            <span>{order.staff_name || 'N/A'}</span>
                                            {staffRisks[order.user_id] && (
                                                <AlertTriangle size={12} color="#F59E0B" title={`High Return Rate: ${staffRisks[order.user_id].rate}%`} />
                                            )}
                                        </div>
                                    </td>
                                    <td style={{...s.td, fontWeight: 700, color: '#0F172A'}}>
                                        {parseInt(order.total_amount).toLocaleString()}{t('common.currency')}
                                    </td>
                                    <td style={s.td}>
                                        <span style={s.statusBadge(order.status)}>{order.status}</span>
                                    </td>
                                    <td style={{...s.td, color: '#64748B', fontSize: '13px'}}>
                                        {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    {/* FIX CĂN PHẢI TẠI ĐÂY */}
                                    <td style={{...s.td, textAlign: 'right', paddingRight: '24px'}}>
                                        <div style={s.actionWrapper}>
                                            <button style={s.actionBtn} onClick={() => openDetail(order.id)} title="View Details">
                                                <Eye size={18} />
                                            </button>
                                        </div>
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