import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Plus, ArrowRight, Truck, CheckCircle, XCircle, Package, Trash2, RefreshCw, Filter, Search } from 'lucide-react';
import CreateTransferModal from '../../components/modals/CreateTransferModal';
import './Inventory.css'; 

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
            showError('Failed to load transfers');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (transferId, action) => {
        try {
            await api.post('/admin/update_transfer.php', { transfer_id: transferId, action, user_id: 1 });
            showSuccess(`Transfer ${action} successful`);
            fetchTransfers();
        } catch (err) {
            showError(err.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (transferId) => {
        if (!window.confirm('Delete this transfer history?')) return;
        try {
            await api.post('/admin/delete_transfer.php', { transfer_id: transferId });
            showSuccess('Record deleted');
            fetchTransfers();
        } catch (err) {
            showError('Failed to delete');
        }
    };

    const filteredTransfers = transfers.filter(t => filterStatus === 'all' ? true : t.status === filterStatus);

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { class: 'badge-pending', label: 'Pending', icon: <Package size={12}/> },
            in_transit: { class: 'badge-transit', label: 'In Transit', icon: <Truck size={12}/> },
            completed: { class: 'badge-success', label: 'Completed', icon: <CheckCircle size={12}/> },
            cancelled: { class: 'badge-danger', label: 'Cancelled', icon: <XCircle size={12}/> },
        };
        const config = statusMap[status] || { class: '', label: status, icon: null };
        return (
            <span className={`st-status-badge ${config.class}`}>
                {config.icon} {config.label}
            </span>
        );
    };

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h1>Stock Transfers</h1>
                    <p className="subtitle">Track and manage inventory movements between locations</p>
                </div>
                <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={18} /> New Transfer
                </button>
            </div>

            <div className="content-card">
                <div className="toolbar">
                    <div className="toolbar-left">
                        <div className="filter-wrapper">
                            <Filter size={16} className="filter-icon" />
                            <select 
                                className="status-filter-select"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_transit">In Transit</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                    
                    <button className="btn-refresh" onClick={fetchTransfers}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading transfers...</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Ref Code</th>
                                    <th>Product Details</th>
                                    <th>Transfer Route</th>
                                    <th className="text-center">Qty</th>
                                    <th>Status</th>
                                    <th>Created By</th>
                                    <th>Date</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransfers.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <span className="ref-code">{item.transfer_code}</span>
                                        </td>
                                        <td>
                                            <div className="product-info-cell">
                                                <div className="product-img-wrapper">
                                                    {item.image ? (
                                                        <img src={item.image} alt="" />
                                                    ) : (
                                                        <Package size={20} />
                                                    )}
                                                </div>
                                                <div className="product-details">
                                                    <span className="p-name">{item.product_name}</span>
                                                    <span className="p-sku">{item.sku}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="route-flow">
                                                <span className="store-tag">{item.from_store_name || 'Source'}</span>
                                                <ArrowRight size={14} className="route-arrow" />
                                                <span className="store-tag destination">{item.to_store_name || 'Dest'}</span>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="qty-badge">{item.quantity}</span>
                                        </td>
                                        <td>{getStatusBadge(item.status)}</td>
                                        <td>
                                            <div className="user-info">
                                                <div className="avatar-sm">
                                                    {item.created_by_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{item.created_by_name}</span>
                                            </div>
                                        </td>
                                        <td className="date-cell">
                                            {new Date(item.created_at).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="text-right">
                                            <div className="action-buttons">
                                                {item.status === 'pending' && (
                                                    <>
                                                        <button className="btn-act btn-ship" onClick={() => handleAction(item.id, 'ship')} title="Ship Now">
                                                            <Truck size={16} />
                                                        </button>
                                                        <button className="btn-act btn-cancel-req" onClick={() => handleAction(item.id, 'cancel')} title="Cancel">
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {item.status === 'in_transit' && (
                                                    <button className="btn-act btn-receive" onClick={() => handleAction(item.id, 'receive')} title="Receive Stock">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                {(item.status === 'cancelled' || item.status === 'completed') && (
                                                    <button className="btn-act btn-delete" onClick={() => handleDelete(item.id)} title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredTransfers.length === 0 && (
                            <div className="empty-state">
                                <Package size={48} />
                                <p>No transfer records found</p>
                            </div>
                        )}
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