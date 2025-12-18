import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Plus, ArrowRight, Truck, CheckCircle, XCircle, Package, Trash2 } from 'lucide-react';
import CreateTransferModal from '../../components/modals/CreateTransferModal';
import './Inventory.css'; // Reusing Inventory styles for consistency

const StockTransfer = () => {
    const { error: showError, success: showSuccess } = useToast();
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchTransfers();
    }, []);

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/get_transfers.php');
            setTransfers(res.data);
        } catch (err) {
            console.error(err);
            showError('Failed to load transfers');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (transferId, action) => {
        try {
            await api.post('/admin/update_transfer.php', {
                transfer_id: transferId,
                action,
                user_id: 1 // TODO: Get from AuthContext
            });
            showSuccess(`Transfer ${action} action successful`);
            fetchTransfers();
        } catch (err) {
            console.error(err);
            showError(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (transferId) => {
        if (!window.confirm('Are you sure you want to delete this transfer history?')) return;
        try {
            await api.post('/admin/delete_transfer.php', { transfer_id: transferId });
            showSuccess('Transfer record deleted');
            fetchTransfers();
        } catch (err) {
            console.error(err);
            showError('Failed to delete transfer');
        }
    };

    const filteredTransfers = transfers.filter(t =>
        filterStatus === 'all' ? true : t.status === filterStatus
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="status-badge warning">Pending</span>;
            case 'in_transit': return <span className="status-badge info">In Transit</span>;
            case 'completed': return <span className="status-badge success">Completed</span>;
            case 'cancelled': return <span className="status-badge danger">Cancelled</span>;
            default: return status;
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Stock Transfers</h1>
                    <p className="text-muted">Manage stock movement between stores</p>
                </div>
                <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} /> Create Transfer
                </button>
            </div>

            <div className="content-card">
    <div className="toolbar">
        <div className="toolbar-left">
            <div className="filter-group">
                <div className="filter-icon-wrapper">
                    <Filter size={16} />
                </div>
                <select
                    className="status-select-custom"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>

        <button 
            className={`btn-refresh-custom ${loading ? 'spinning' : ''}`} 
            onClick={fetchTransfers}
            disabled={loading}
        >
            <RefreshCw size={16} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
    </div>

                {loading ? (
                    <div className="loading-state" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>Loading transfers...</div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '120px' }}>Ref Code</th>
                                    <th>Product</th>
                                    <th>Route</th>
                                    <th style={{ textAlign: 'center' }}>Qty</th>
                                    <th>Status</th>
                                    <th>Created By</th>
                                    <th>Date</th>
                                    <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransfers.map(item => (
                                    <tr key={item.id}>
                                        <td className="font-mono text-blue" style={{ fontWeight: 500 }}>{item.transfer_code}</td>
                                        <td>
                                            <div className="product-cell" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {item.image ? (
                                                    <img src={item.image} alt="" className="product-thumb" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Package size={20} className="text-muted" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="product-name" style={{ fontWeight: 500, color: '#2c3e50' }}>{item.product_name}</div>
                                                    <small className="text-muted" style={{ fontSize: '0.8rem' }}>{item.sku}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                                                <span style={{ fontWeight: 500 }}>{item.from_store_name || `Store #${item.from_store_id}`}</span>
                                                <ArrowRight size={18} className="text-muted" />
                                                <span style={{ fontWeight: 500 }}>{item.to_store_name || `Store #${item.to_store_id}`}</span>
                                            </div>
                                        </td>
                                        <td className="font-bold" style={{ textAlign: 'center', color: '#2c3e50' }}>{item.quantity}</td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td style={{ fontSize: '13px', color: '#555' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e9ecef', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                                    {item.created_by_name?.charAt(0).toUpperCase()}
                                                </div>
                                                {item.created_by_name}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#6c757d' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="actions-cell" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {item.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn-icon-text info"
                                                            onClick={() => handleAction(item.id, 'ship')}
                                                            title="Mark as Shipped"
                                                            style={{ border: '1px solid #17a2b8', color: '#17a2b8', background: 'transparent', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                                                        >
                                                            <Truck size={14} /> Ship
                                                        </button>
                                                        <button
                                                            className="btn-icon danger"
                                                            onClick={() => handleAction(item.id, 'cancel')}
                                                            title="Cancel Request"
                                                            style={{ padding: '4px', borderRadius: '4px', border: '1px solid #dc3545', color: '#dc3545', background: 'transparent' }}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {item.status === 'in_transit' && (
                                                    <button
                                                        className="btn-icon-text success"
                                                        onClick={() => handleAction(item.id, 'receive')}
                                                        title="Mark as Received"
                                                        style={{ border: '1px solid #28a745', color: '#28a745', background: 'transparent', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                                                    >
                                                        <CheckCircle size={14} /> Receive
                                                    </button>
                                                )}
                                                {(item.status === 'cancelled' || item.status === 'completed') && (
                                                    <button
                                                        className="btn-icon danger"
                                                        onClick={() => handleDelete(item.id)}
                                                        title="Delete Record"
                                                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#94a3b8', background: 'transparent' }}
                                                        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                                                        onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredTransfers.length === 0 && (
                                    <tr><td colSpan="9" className="text-center text-muted py-5">No transfers found matching filter.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CreateTransferModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchTransfers}
            />
        </div>
    );
};

export default StockTransfer;
