import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../contexts/ToastContext';
import {
    Search, AlertTriangle, CheckCircle, XCircle,
    Bot, RefreshCw, Edit, X, ArrowRight, Package
} from 'lucide-react';
import StockAdjustmentModal from '../../components/modals/StockAdjustmentModal';
import { motion, AnimatePresence } from 'framer-motion'; // Nếu có cài framer-motion
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
    const [aiModal, setAiModal] = useState(null);

    const [adjustModal, setAdjustModal] = useState({
        open: false, step: 1, item: null, type: 'increase', quantity: 0, reason: '', note: ''
    });

    useEffect(() => { fetchInventory(); }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/inventory.php');
            setInventory(response.data);
        } catch (error) {
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
            showError('Failed to load item details');
        } finally {
            setDetailLoading(false);
        }
    };

    const openAdjustmentModal = (item, prefill = {}) => {
        setAdjustModal({
            open: true, step: 1, item: item,
            type: prefill.type || 'increase',
            quantity: prefill.quantity || '',
            reason: prefill.reason || '',
            note: ''
        });
        if (aiModal) setAiModal(null);
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        if (status === 'out_of_stock') return <span className="status-badge badge-red"><XCircle size={14} /> Out of Stock</span>;
        if (status === 'low_stock') return <span className="status-badge badge-yellow"><AlertTriangle size={14} /> Low Stock</span>;
        return <span className="status-badge badge-green"><CheckCircle size={14} /> Normal</span>;
    };

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h1>Inventory Control</h1>
                    <p className="subtitle">Monitor and manage your real-time stock levels</p>
                </div>
                <button className="btn-refresh" onClick={fetchInventory}>
                    <RefreshCw size={18} /> 
                    <span>Sync Data</span>
                </button>
            </div>

            <div className="content-card">
                <div className="toolbar">
                    <div className="search-bar">
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search by Product Name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter"
                    >
                        <option value="all">All Inventory</option>
                        <option value="low_stock">Low Stock Risk</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="normal">Healthy Stock</option>
                    </select>
                </div>

                <div className="table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product Details</th>
                                <th>SKU</th>
                                <th>Location</th>
                                <th className="text-center">Stock Qty</th>
                                <th className="text-center">Status</th>
                                <th>AI Insight</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" className="text-center py-5">Loading inventory data...</td></tr>
                            ) : filteredInventory.map((item) => (
                                <tr key={item.id}>
                                    <td onClick={() => handleViewDetail(item)} style={{ cursor: 'pointer' }}>
                                        <div className="product-cell">
                                            <img 
                                                src={item.image || 'https://via.placeholder.com/48'} 
                                                className="product-thumb" 
                                                alt="" 
                                            />
                                            <div>
                                                <span className="product-name">{item.product_name}</span>
                                                <small className="text-muted">Updated: {item.last_updated?.split(' ')[0]}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-mono" style={{color: '#3b82f6', fontWeight: 600}}>{item.sku}</td>
                                    <td>{item.store_name}</td>
                                    <td className="text-center">
                                        <span className={`qty-indicator ${item.status}`}>
                                            {item.quantity}
                                        </span>
                                    </td>
                                    <td className="text-center">{getStatusBadge(item.status)}</td>
                                    <td>
                                        {item.ai_recommendation ? (
                                            <div className="ai-pill" onClick={() => setAiModal(item)} style={{ cursor: 'pointer' }}>
                                                <Bot size={18} className="ai-icon" />
                                                <div className="ai-content">
                                                    <strong>{item.ai_recommendation.action} +{item.ai_recommendation.quantity}</strong>
                                                    <div className="ai-reason">{item.ai_recommendation.reason}</div>
                                                </div>
                                            </div>
                                        ) : <span className="text-muted">—</span>}
                                    </td>
                                    <td>
                                        <div style={{display: 'flex', justifyContent: 'center'}}>
                                            <button className="btn-icon" onClick={() => openAdjustmentModal(item)}>
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SKU Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-content large-modal" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div>
                                    <h3>{selectedItem.product_name}</h3>
                                    <span className="badge-outline">{selectedItem.sku}</span>
                                </div>
                                <button className="btn-close" onClick={() => setSelectedItem(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                {/* ... Giữ nguyên phần nội dung Detail Sections của bạn ... */}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AI Modal */}
            <AnimatePresence>
                {aiModal && (
                    <div className="modal-overlay" onClick={() => setAiModal(null)}>
                        <motion.div 
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="modal-content ai-modal" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="ai-header">
                                <Bot size={40} />
                                <div>
                                    <h3 style={{color: 'white'}}>Smart Replenishment</h3>
                                    <p style={{margin: 0, opacity: 0.8}}>AI-driven stock optimization</p>
                                </div>
                            </div>
                            <div className="modal-body ai-body">
                                <div className="ai-suggestion-box">
                                    <div className="suggestion-main">
                                        Recommended: <span className="highlight">+{aiModal.ai_recommendation?.quantity} units</span>
                                    </div>
                                    <p className="reason-text">"{aiModal.ai_recommendation?.reason}"</p>
                                </div>
                                <div className="modal-actions">
                                    <button className="btn-secondary" onClick={() => setAiModal(null)}>Dismiss</button>
                                    <button className="btn-primary" onClick={() => openAdjustmentModal(aiModal, {
                                        type: 'increase',
                                        quantity: aiModal.ai_recommendation?.quantity,
                                        reason: 'System correction'
                                    })}>
                                        Apply Recommendation
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
        </div>
    );
};

export default Inventory;