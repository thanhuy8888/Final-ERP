import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { 
    Search, Plus, RefreshCw, X, AlertCircle, 
    ArrowLeft, Check, Receipt, ShoppingCart, 
    User, Trash2, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import './Orders.css'; 

const AdminReturns = () => {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1);

    // Form State
    const [searchOrderTerm, setSearchOrderTerm] = useState('');
    const [foundOrders, setFoundOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [returnReason, setReturnReason] = useState('');
    const [returnItems, setReturnItems] = useState({});

    useEffect(() => {
        fetchReturns();
    }, []);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/returns.php');
            setReturns(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetModal = () => {
        setIsModalOpen(false);
        setStep(1);
        setSearchOrderTerm('');
        setFoundOrders([]);
        setSelectedOrder(null);
        setOrderItems([]);
        setReturnItems({});
        setReturnReason('');
    };

    const handleSearchOrder = async () => {
        if (!searchOrderTerm) return;
        try {
            const res = await api.get(`/admin/returns.php?search_order=${searchOrderTerm}`);
            setFoundOrders(res.data);
        } catch (err) {
            showError("Failed to search orders");
        }
    };

    const handleSelectOrder = async (order) => {
        setSelectedOrder(order);
        try {
            const res = await api.get(`/admin/returns.php?order_details=${order.id}`);
            setOrderItems(res.data);
            setStep(2);
        } catch (err) {
            showError("Failed to load order items");
        }
    };

    const handleQtyChange = (productId, qty, max) => {
        const val = Math.max(0, Math.min(qty, max));
        setReturnItems(prev => {
            const copy = { ...prev };
            if (val > 0) copy[productId] = val;
            else delete copy[productId];
            return copy;
        });
    };

    const calculateRefundTotal = () => {
        return orderItems.reduce((total, item) => {
            const qty = returnItems[item.product_id] || 0;
            return total + (qty * item.price);
        }, 0);
    };

    const handleSubmitReturn = async () => {
        if (!returnReason) return showError("Please provide a reason");
        const itemsToReturn = Object.entries(returnItems).map(([pid, qty]) => ({ product_id: pid, quantity: qty }));
        if (itemsToReturn.length === 0) return showError("Select at least one item");

        try {
            await api.post('/admin/returns.php', {
                order_id: selectedOrder.id,
                items: itemsToReturn,
                reason: returnReason
            });
            success("Return processed successfully");
            fetchReturns();
            resetModal();
        } catch (err) {
            showError(err.response?.data?.error || "Failed to process");
        }
    };

    return (
        <div className="admin-page-container">
            <div className="page-header-modern">
                <div className="header-title">
                    <h1>Returns & Refunds</h1>
                    <p>Track customer returns and manage inventory restocks</p>
                </div>
                <div className="header-actions">
                    <button className="btn-modern primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> New Return Request
                    </button>
                </div>
            </div>

            <div className="content-card-modern">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading return records...</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th>Return ID</th>
                                    <th>Original Order</th>
                                    <th>Reason</th>
                                    <th>Refund Amount</th>
                                    <th>Handler</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returns.map(ret => (
                                    <tr key={ret.id}>
                                        <td>
                                            <div className="order-id-cell">
                                                <Receipt size={14} />
                                                <span>{ret.return_number}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="order-ref-link">#{ret.order_ref}</span>
                                        </td>
                                        <td>
                                            <span className="reason-tag">
                                                {ret.reason.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="refund-amount-cell">
                                                <span className="amount-val">{parseInt(ret.refund_amount).toLocaleString()}₫</span>
                                                {parseInt(ret.refund_amount) > 1000000 && (
                                                    <span className="high-value-pill">High Value</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-info">
                                                <div className="avatar-placeholder sm">
                                                    {ret.processed_by_display?.charAt(0)}
                                                </div>
                                                <span className="handler-name">{ret.processed_by_display}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="date-text">{new Date(ret.created_at).toLocaleDateString()}</span>
                                        </td>
                                        <td>
                                            <span className="badge-soft completed">Success</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {!loading && returns.length === 0 && (
                    <div className="empty-table-state">
                        <Receipt size={48} />
                        <p>No returns found in the system</p>
                    </div>
                )}
            </div>

            {/* --- Return Modal --- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content-modern">
                        <div className="modal-header-modern">
                            <div className="m-title">
                                <h2>Process New Return</h2>
                                <p>Step {step} of 2: {step === 1 ? 'Identify Order' : 'Return Details'}</p>
                            </div>
                            <button className="btn-close" onClick={resetModal}><X size={20} /></button>
                        </div>

                        <div className="modal-body">
                            {step === 1 ? (
                                <div className="step-search">
                                    <div className="filter-group">
                                        <label className="filter-label">Search Order to Return</label>
                                        <div className="search-box-large">
                                            <Search size={20} className="s-icon" />
                                            <input
                                                type="text"
                                                className="modern-input"
                                                placeholder="Enter Order ID, Customer Name or Phone..."
                                                value={searchOrderTerm}
                                                onChange={(e) => setSearchOrderTerm(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSearchOrder()}
                                            />
                                            <button className="btn-modern primary" onClick={handleSearchOrder}>Find Order</button>
                                        </div>
                                    </div>

                                    <div className="order-results">
                                        {foundOrders.map(order => (
                                            <div key={order.id} className="order-result-card" onClick={() => handleSelectOrder(order)}>
                                                <div className="o-info">
                                                    <span className="o-id">Order #{order.id}</span>
                                                    <span className="o-cust">{order.full_name || order.username} • {order.phone}</span>
                                                </div>
                                                <div className="o-price">
                                                    <span>{parseInt(order.total_amount).toLocaleString()}₫</span>
                                                    <ChevronRight size={18} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="step-details">
                                    <button className="btn-back" onClick={() => setStep(1)}>
                                        <ArrowLeft size={16} /> Back to Search
                                    </button>

                                    <div className="return-items-table">
                                        <table className="table-modern">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Price</th>
                                                    <th className="text-center">Avail.</th>
                                                    <th style={{ width: '120px' }}>Return Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderItems.map(item => (
                                                    <tr key={item.product_id}>
                                                        <td>
                                                            <div className="p-cell">
                                                                <strong>{item.product_name}</strong>
                                                                <span>{item.sku}</span>
                                                            </div>
                                                        </td>
                                                        <td>{parseInt(item.price).toLocaleString()}₫</td>
                                                        <td className="text-center">{item.returnable_qty}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="modern-input center"
                                                                min="0"
                                                                max={item.returnable_qty}
                                                                value={returnItems[item.product_id] || ''}
                                                                onChange={(e) => handleQtyChange(item.product_id, parseInt(e.target.value) || 0, item.returnable_qty)}
                                                                disabled={item.returnable_qty <= 0}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="return-meta">
                                        <div className="filter-group">
                                            <label className="filter-label">Reason for Return</label>
                                            <textarea
                                                className="modern-input"
                                                rows="3"
                                                value={returnReason}
                                                onChange={(e) => setReturnReason(e.target.value)}
                                                placeholder="Describe why the customer is returning these items..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="refund-summary-card">
                                        <div className="warning-note">
                                            <AlertTriangle size={18} />
                                            <p>Restocking will update inventory and deduct points.</p>
                                        </div>
                                        <div className="total-refund">
                                            <span>Total Refund Amount</span>
                                            <strong>{calculateRefundTotal().toLocaleString()}₫</strong>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer-modern">
                            <button className="btn-modern secondary" onClick={resetModal}>Cancel</button>
                            {step === 2 && (
                                <button className="btn-modern danger-action" onClick={handleSubmitReturn}>
                                    <Check size={18} /> Process Refund
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReturns;