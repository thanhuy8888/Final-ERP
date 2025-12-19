import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../contexts/ToastContext';
import {
    RefreshCw,
    Search,
    Filter,
    ArrowUpCircle,
    ArrowDownCircle,
    Plus
} from 'lucide-react';
import StockAdjustmentModal from '../../components/modals/StockAdjustmentModal';
import './Inventory.css';

const StockAdjustments = () => {
    const { t } = useTranslation();
    const { showError } = useToast();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [adjustModal, setAdjustModal] = useState({ open: false, item: null });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/adjustment_history.php');
            setHistory(response.data);
        } catch (error) {
            console.error(error);
            showError('Failed to fetch adjustment history');
        } finally {
            setLoading(false);
        }
    };

    // Since creating an adjustment requires selecting an ITEM first, 
    // the "New Adjustment" button here might need to open a generic Item Selector.
    // For simplicity now, we assume this page is primarily for History, 
    // but users can adjust via the specific item in Inventory Overview. 
    // OR we can implement an Item Search step in the modal later.
    // For now, I'll document that "New Adjustment" should separate, 
    // but the user requirement implies "Create Stock Adjustment" is a main action.

    // To enable "Create from scratch", we'd need an item picker. 
    // Let's stick to the requirements: "1.5 View Adjustment History".
    // "1.1 Create Stock Adjustment" is covered by the modal logic we just did, 
    // typically triggered from the Inventory List.

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h1>Stock Adjustment History</h1>
                    <p className="subtitle">Audit trail of all manual stock changes</p>
                </div>
                <button className="btn-refresh" onClick={fetchHistory}>
                    <RefreshCw size={18} /> Refresh
                </button>
            </div>

            <div className="content-card">
                <div className="toolbar">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-wrapper"><div className="spinner"></div></div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Product</th>
                                    <th>Store</th>
                                    <th>Type</th>
                                    <th>Qty</th>
                                    <th>Reason</th>
                                    <th>User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((log) => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                                        <td>
                                            <div className="font-medium">{log.product_name}</div>
                                            <div className="text-xs text-muted">{log.product_sku}</div>
                                        </td>
                                        <td>{log.store_name}</td>
                                        <td>
                                            {log.type === 'increase' ? (
                                                <span className="status-badge badge-green">
                                                    <ArrowUpCircle size={14} /> Increase
                                                </span>
                                            ) : (
                                                <span className="status-badge badge-red">
                                                    <ArrowDownCircle size={14} /> Decrease
                                                </span>
                                            )}
                                        </td>
                                        <td className="font-bold">
                                            {log.type === 'increase' ? '+' : '-'}{log.quantity}
                                            <div className="text-xs text-muted">
                                                {log.previous_stock} &rarr; {log.new_stock}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge-text">{log.reason}</span>
                                            {log.note && <div className="text-xs text-gray-500 italic mt-1">{log.note}</div>}
                                        </td>
                                        <td>{log.user_name}</td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr><td colSpan="7" className="text-center py-5 text-muted">No history found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockAdjustments;
