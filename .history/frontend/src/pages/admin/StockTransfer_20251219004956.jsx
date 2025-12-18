import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { 
    Plus, 
    ArrowRight, 
    Truck, 
    CheckCircle, 
    XCircle, 
    Package, 
    Trash2, 
    Search, 
    RefreshCw 
} from 'lucide-react';
import CreateTransferModal from '../../components/modals/CreateTransferModal';
import './Inventory.css'; // Import file CSS mới

const StockTransfer = () => {
    const { error: showError, success: showSuccess } = useToast();
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

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
                user_id: 1 
            });
            showSuccess(`Transfer ${action} action successful`);
            fetchTransfers();
        } catch (err) {
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
            showError('Failed to delete transfer');
        }
    };

    const filteredTransfers = transfers.filter(t => {
        const matchesStatus = filterStatus === 'all' ? true : t.status === filterStatus;
        const matchesSearch = t.transfer_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Helper để chọn class badge đúng theo CSS
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': 
                return <span className="status-badge badge-yellow">Pending</span>;
            case 'in_transit': 
                return <span className="status-badge badge-blue">In Transit</span>;
            case 'completed': 
                return <span className="status-badge badge-green">Completed</span>;
            case 'cancelled': 
                return <span className="status-badge badge-red">Cancelled</span>;
            default: 
                return <span className="status-badge">{status}</span>;
        }
    };

    return (
        <div className="inventory-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Stock Transfers</h1>
                    <p className="subtitle">Manage stock movement and logistics between stores.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                    <Plus size={20} /> Create Transfer
                </button>
            </div>

            {/* Main Content Card */}
            <div className="content-card">
                {/* Toolbar */}
                <div className="toolbar">
                    <div className="search-bar">
                        <Search size={18} color="#64748b" />
                        <input 
                            type="text" 
                            placeholder="Search by Transfer Code or Product..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select 
                            className="status-filter"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_transit">In Transit</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        
                        <button className="btn-refresh" onClick={fetchTransfers}>
                            <RefreshCw size={18} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Loading transfers...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Ref Code</th>
                                <th>Product</th>
                                <th>Route</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th>Status</th>
                                <th>Created By</th>
                                <th>Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransfers.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6' }}>
                                        {item.transfer_code}
                                    </td>
                                    <td>
                                        <div className="product-cell">
                                            {item.image ? (
                                                <img src={item.image} alt="" className="product-thumb" />
                                            ) : (
                                                <div className="product-thumb" style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Package size={20} color="#94a3b8" />
                                                </div>
                                            )}
                                            <div>
                                                <span className="product-name">{item.product_name}</span>
                                                <span className="sku-text">{item.sku}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="route-info">
                                            <span>{item.from_store_name?.replace('Canifa - ', '')}</span>
                                            <ArrowRight size={14} color="#94a3b8" />
                                            <span>{item.to_store_name?.replace('Canifa - ', '')}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '15px' }}>
                                        {item.quantity}
                                    </td>
                                    <td>{getStatusBadge(item.status)}</td>
                                    <td>
                                        <div className="user-info">
                                            <div className="avatar-circle">
                                                {item.created_by_name?.charAt(0).toUpperCase()}
                                            </div>
                                            {item.created_by_name}
                                        </div>
                                    </td>
                                    <td style={{ color: '#64748b' }}>
                                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {item.status === 'pending' && (
                                                <>
                                                    <button 
                                                        className="btn-icon" 
                                                        title="Mark as Shipped"
                                                        onClick={() => handleAction(item.id, 'ship')}
                                                    >
                                                        <Truck size={18} />
                                                    </button>
                                                    <button 
                                                        className="btn-icon danger" 
                                                        title="Cancel"
                                                        onClick={() => handleAction(item.id, 'cancel')}
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {item.status === 'in_transit' && (
                                                <button 
                                                    className="btn-icon success" 
                                                    title="Receive Stock"
                                                    onClick={() => handleAction(item.id, 'receive')}
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            {(item.status === 'cancelled' || item.status === 'completed') && (
                                                <button 
                                                    className="btn-icon danger" 
                                                    title="Delete Record"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransfers.length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        No transfers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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