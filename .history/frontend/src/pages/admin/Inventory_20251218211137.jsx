import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../contexts/ToastContext';
import {
    Search,
    Filter,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Bot,
    RefreshCw,
    Plus,
    ArrowRight,
    Save,
    Edit
} from 'lucide-react';
import StockAdjustmentModal from '../../components/modals/StockAdjustmentModal';
import './Inventory.css';

const Inventory = () => {
    const { t } = useTranslation();
    const { showError } = useToast();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [itemHistory, setItemHistory] = useState({ sales: [], audits: [] });
    const [aiModal, setAiModal] = useState(null); // { open: false, item: null }

    // Adjustment Modal State
    const [adjustModal, setAdjustModal] = useState({
        open: false,
        step: 1,
        item: null,
        type: 'increase',
        quantity: 0,
        reason: '',
        note: ''
    });
    const REASONS = [
        'Damaged goods',
        'Lost / Missing items',
        'Stock audit correction',
        'Initial stock import',
        'System correction'
    ];

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/inventory.php');
            setInventory(response.data);
        } catch (error) {
            console.error(error);
            showError('Failed to fetch inventory data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (item) => {
        setSelectedItem(item);
        setDetailLoading(true);
        try {
            const response = await api.get(`/admin/inventory_details.php?inventory_id=${item.id}`);
            setItemHistory({
                sales: response.data.sales_history || [],
                audits: response.data.audit_logs || []
            });
        } catch (error) {
            console.error(error);
            showError('Failed to load item details');
        } finally {
            setDetailLoading(false);
        }
    };

    // Open Stock Adjustment Modal
    const openAdjustmentModal = (item, prefill = {}) => {
        setAdjustModal({
            open: true,
            step: 1,
            item: item,
            type: prefill.type || 'increase',
            quantity: prefill.quantity || '',
            reason: prefill.reason || '',
            note: ''
        });
        if (aiModal) setAiModal(null);
    };


    const handleAiClick = (item) => {
        setAiModal(item);
    };

    // Filtering logic
    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        if (status === 'out_of_stock') {
            return <span className="status-badge badge-red"><XCircle size={14} /> Out of Stock</span>;
        }
        if (status === 'low_stock') {
            return <span className="status-badge badge-yellow"><AlertTriangle size={14} /> Low Stock</span>;
        }
        return <span className="status-badge badge-green"><CheckCircle size={14} /> Normal</span>;
    };

    const formatChangeLog = (newValueStr) => {
        try {
            const val = JSON.parse(newValueStr);
            if (typeof val === 'object' && val !== null) {
                return (
                    <div className="change-log">
                        {Object.entries(val).map(([k, v]) => (
                            <div key={k}>
                                <span className="font-semibold">{k}:</span> {String(v)}
                            </div>
                        ))}
                    </div>
                );
            }
            return <div className="change-log">{String(val)}</div>;
        } catch (e) {
            return <div className="change-log">{newValueStr}</div>;
        }
    };

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h1>Stock Overview</h1>
                    <p className="subtitle">Real-time inventory levels</p>
                </div>
                <button className="btn-refresh" onClick={fetchInventory} title="Refresh Data">
                    <RefreshCw size={18} /> Refresh Data
                </button>
            </div>

            <div className="content-card">
                <div className="toolbar">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by Product or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="status-filter"
                        >
                            <option value="all">All Status</option>
                            <option value="low_stock">Low Stock (Risk)</option>
                            <option value="out_of_stock">Out of Stock</option>
                            <option value="normal">Normal</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-wrapper">
                        <div className="spinner"></div> Loading Inventory...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th>Store</th>
                                    <th className="text-center">Quantity</th>
                                    <th className="text-center">Status</th>
                                    <th>Recommendation</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.map((item) => (
                                    <tr key={item.id} className={item.status !== 'normal' ? 'row-alert' : ''}>
                                        <td onClick={() => handleViewDetail(item)} style={{ cursor: 'pointer' }}>
                                            <div className="product-cell">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.product_name}
                                                        className="product-thumb"
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40?text=IMG'; }}
                                                    />
                                                ) : (
                                                    <div className="product-thumb placeholder">IMG</div>
                                                )}
                                                <div>
                                                    <div className="product-name">{item.product_name}</div>
                                                    <small className="text-muted">Last updated: {item.last_updated?.split(' ')[0]}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="font-mono text-blue cursor-pointer" onClick={() => handleViewDetail(item)}>{item.sku}</td>
                                        <td>{item.store_name}</td>
                                        <td className="text-center">
                                            <span className={`qty-indicator ${item.status}`}>
                                                {item.quantity}
                                            </span>
                                        </td>
                                        <td className="text-center">{getStatusBadge(item.status)}</td>
                                        <td>
                                            {item.ai_recommendation ? (
                                                <div className="ai-pill" onClick={() => handleAiClick(item)} style={{ cursor: 'pointer' }}>
                                                    <Bot size={16} className="ai-icon" />
                                                    <div className="ai-content">
                                                        <strong>{item.ai_recommendation.action} +{item.ai_recommendation.quantity}</strong>
                                                        <div className="ai-reason">{item.ai_recommendation.reason}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted text-xs">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-icon"
                                                title="Adjust Stock"
                                                onClick={() => openAdjustmentModal(item)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredInventory.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            No inventory items found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* SKU Detail Modal */}
            {selectedItem && (
                <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedItem.product_name} <span className="text-muted text-sm">({selectedItem.sku})</span></h3>
                            <button className="btn-close" onClick={() => setSelectedItem(null)}>
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {detailLoading ? (
                                <div className="loading-wrapper"><div className="spinner"></div></div>
                            ) : (
                                <div className="detail-sections">
                                    <div className="detail-section">
                                        <h4>Sales History (Last 10 Orders)</h4>
                                        <table className="mini-table">
                                            <thead><tr><th>Date</th><th>Order ID</th><th>Qty</th><th>Customer</th></tr></thead>
                                            <tbody>
                                                {itemHistory.sales.map(sale => (
                                                    <tr key={sale.order_id}>
                                                        <td>{new Date(sale.created_at).toLocaleDateString('vi-VN')}</td>
                                                        <td className="text-blue">#{sale.order_id}</td>
                                                        <td className="font-bold">{sale.quantity}</td>
                                                        <td>{sale.customer_name || 'Guest'}</td>
                                                    </tr>
                                                ))}
                                                {itemHistory.sales.length === 0 && <tr><td colSpan="4" className="text-center text-muted">No sales history</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="detail-section">
                                        <h4>Audit Logs</h4>
                                        <table className="mini-table">
                                            <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Changes</th></tr></thead>
                                            <tbody>
                                                {itemHistory.audits.map((log, idx) => (
                                                    <tr key={idx}>
                                                        <td>{new Date(log.created_at).toLocaleDateString('vi-VN')}</td>
                                                        <td>{log.user_name}</td>
                                                        <td><span className="badge-text">{log.action}</span></td>
                                                        <td>{formatChangeLog(log.new_value)}</td>
                                                    </tr>
                                                ))}
                                                {itemHistory.audits.length === 0 && <tr><td colSpan="4" className="text-center text-muted">No audit logs</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Recommendation Modal */}
            {/* Stock Adjustment Modal */}
            <StockAdjustmentModal
                isOpen={adjustModal.open}
                onClose={() => setAdjustModal({ ...adjustModal, open: false })}
                onSuccess={fetchInventory}
                initialItem={adjustModal.item}
                initialData={{
                    type: adjustModal.type,
                    quantity: adjustModal.quantity,
                    reason: adjustModal.reason
                }}
            />

            {aiModal && (
                <div className="modal-overlay" onClick={() => setAiModal(null)}>
                    <div className="modal-content ai-modal" onClick={e => e.stopPropagation()}>
                        <div className="ai-header">
                            <Bot size={32} />
                            <div>
                                <h3>AI Replenishment Advice</h3>
                                <p className="text-sm opacity-90">Powered by Canifa Intelligence</p>
                            </div>
                        </div>
                        <div className="ai-body">
                            <div className="ai-metric-card">
                                <label>Target Store</label>
                                <div className="value">{aiModal.store_name}</div>
                            </div>
                            <div className="ai-metric-card warning">
                                <label>Current Stock</label>
                                <div className="value text-red">{aiModal.quantity} units</div>
                            </div>

                            <div className="ai-suggestion-box">
                                <h4>✅ Recommended Action</h4>
                                <div className="suggestion-main">
                                    {aiModal.ai_recommendation?.action}
                                    <span className="highlight"> +{aiModal.ai_recommendation?.quantity} units</span>
                                </div>
                                <p className="reason-text">"{aiModal.ai_recommendation?.reason}"</p>
                                <div className="rule-explanation">
                                    <strong>Why?</strong> Based on sales velocity of similar items in this region, maintaining a safety stock of 10-15 units avoids lost sales opportunities.
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setAiModal(null)}>Dismiss</button>
                                <button className="btn-primary" onClick={() => openAdjustmentModal(aiModal, {
                                    type: 'increase',
                                    quantity: aiModal.ai_recommendation?.quantity,
                                    reason: 'System correction' // Default or map logic
                                })}>
                                    Create Stock Adjustment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
