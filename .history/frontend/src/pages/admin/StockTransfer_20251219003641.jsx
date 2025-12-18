import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Plus, ArrowRight, Truck, CheckCircle, XCircle, Package, Trash2, Search, RefreshCw } from 'lucide-react';
import CreateTransferModal from '../../components/modals/CreateTransferModal';
import './Inventory.css';

const StockTransfer = () => {
    const { error: showError, success: showSuccess } = useToast();
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchTransfers(); }, []);

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/get_transfers.php');
            setTransfers(res.data);
        } catch (err) { showError('Failed to load transfers'); } 
        finally { setLoading(false); }
    };

    const handleAction = async (transferId, action) => {
        try {
            await api.post('/admin/update_transfer.php', { transfer_id: transferId, action, user_id: 1 });
            showSuccess(`Action successful`);
            fetchTransfers();
        } catch (err) { showError(err.response?.data?.message || 'Action failed'); }
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { class: 'warning', icon: <Package size={12}/> },
            in_transit: { class: 'info', icon: <Truck size={12}/> },
            completed: { class: 'success', icon: <CheckCircle size={12}/> },
            cancelled: { class: 'danger', icon: <XCircle size={12}/> }
        };
        const current = config[status] || { class: 'info', icon: null };
        return (
            <span className={`status-badge ${current.class}`}>
                {current.icon} {status.replace('_', ' ').toUpperCase()}
            </span>
        );
    };

    const filteredData = transfers.filter(t => 
        (filterStatus === 'all' || t.status === filterStatus) &&
        (t.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || t.transfer_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="admin-page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div>
                    <h1>Stock Transfers</h1>
                    <p className="text-muted">Audit trail of all stock movements between stores</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-refresh" onClick={fetchTransfers}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)} style={{ borderRadius: '8px', padding: '0 20px' }}>
                        <Plus size={18} /> New Transfer
                    </button>
                </div>
            </div>

            <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="search-container">
                        <Search className="search-icon-fixed" size={18} />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search transfers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select className="modern-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ marginBottom: '24px', minWidth: '150px' }}>
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}><RefreshCw className="animate-spin" /></div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Route</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th>Created By</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(item => (
                                <tr key={item.id}>
                                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}<br/>
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '700' }}>{item.product_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.sku}</div>
                                    </td>
                                    <td>
                                        <div className="route-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span>{item.from_store_name?.split('-')[1] || 'WH'}</span>
                                            <ArrowRight size={12} color="#94a3b8" />
                                            <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{item.to_store_name?.split('-')[1] || 'Store'}</span>
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(item.status)}</td>
                                    <td style={{ textAlign: 'center' }} className="qty-display">{item.quantity}</td>
                                    <td style={{ fontWeight: '600' }}>{item.created_by_name}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {item.status === 'pending' && (
                                                <button className="btn-icon-text info" onClick={() => handleAction(item.id, 'ship')} style={{ padding: '4px 10px', borderRadius: '6px' }}>
                                                    <Truck size={14} /> Ship
                                                </button>
                                            )}
                                            {item.status === 'in_transit' && (
                                                <button className="btn-icon-text success" onClick={() => handleAction(item.id, 'receive')} style={{ padding: '4px 10px', borderRadius: '6px' }}>
                                                    <CheckCircle size={14} /> Receive
                                                </button>
                                            )}
                                            <button className="btn-icon" onClick={() => handleDelete(item.id)} style={{ border: 'none', background: 'transparent', color: '#cbd5e1' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <CreateTransferModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchTransfers} />
        </div>
    );
};

export default StockTransfer;