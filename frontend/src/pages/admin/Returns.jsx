import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Plus, RefreshCw, X, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import './Orders.css'; // Reuse Orders styling for consistency

const AdminReturns = () => {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1); // 1: Find Order, 2: Select Items

    // Form State
    const [searchOrderTerm, setSearchOrderTerm] = useState('');
    const [foundOrders, setFoundOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [returnReason, setReturnReason] = useState('');
    const [returnItems, setReturnItems] = useState({}); // { productId: qty }

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

    // --- Modal Logic ---
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
            error("Failed to search orders");
        }
    };

    const handleSelectOrder = async (order) => {
        setSelectedOrder(order);
        try {
            const res = await api.get(`/admin/returns.php?order_details=${order.id}`);
            setOrderItems(res.data);
            setStep(2);
        } catch (err) {
            error("Failed to load order items");
        }
    };

    const handleQtyChange = (productId, qty, max) => {
        if (qty < 0) qty = 0;
        if (qty > max) qty = max;

        setReturnItems(prev => {
            const copy = { ...prev };
            if (qty > 0) copy[productId] = qty;
            else delete copy[productId];
            return copy;
        });
    };

    const calculateRefundTotal = () => {
        let total = 0;
        orderItems.forEach(item => {
            const qty = returnItems[item.product_id] || 0;
            total += qty * item.price;
        });
        return total;
    };

    const handleSubmitReturn = async () => {
        if (!returnReason) {
            error("Please provide a reason for return");
            return;
        }

        const itemsToReturn = Object.entries(returnItems).map(([pid, qty]) => ({
            product_id: pid,
            quantity: qty
        }));

        if (itemsToReturn.length === 0) {
            error("Please select at least one item to return");
            return;
        }

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
            error(err.response?.data?.error || "Failed to process return");
        }
    };

    const formatReason = (text) => {
        if (!text) return '';
        // "wrong_item" -> "Wrong Item"
        return text
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Returns Management</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Process refunds and restock inventory.</p>
                </div>
                <button className="btn-modern primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Return
                </button>
            </div>

            <div className="content-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading returns...</div>
                ) : (
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Return #</th>
                                <th>Order #</th>
                                <th>Reason</th>
                                <th>Refund Amount</th>
                                <th>Processed By</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.map(ret => (
                                <tr key={ret.id}>
                                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{ret.return_number}</td>
                                    <td>#{ret.order_ref}</td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            background: '#f1f5f9',
                                            color: '#475569',
                                            fontSize: '0.85rem',
                                            fontWeight: 500
                                        }}>
                                            {formatReason(ret.reason)}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600, color: '#dc2626' }}>
                                        {parseInt(ret.refund_amount).toLocaleString()}₫
                                        {parseInt(ret.refund_amount) > 1000000 && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                background: '#fef2f2',
                                                color: '#ef4444',
                                                border: '1px solid #fca5a5',
                                                borderRadius: '4px',
                                                padding: '2px 4px',
                                                marginLeft: '6px',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                High Value
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{ret.processed_by_display}</div>
                                    </td>
                                    <td style={{ color: '#64748b' }}>{new Date(ret.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className="badge-soft success">Completed</span>
                                    </td>
                                </tr>
                            ))}
                            {returns.length === 0 && (
                                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No returns found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Return Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px', width: '90%' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>Create Return</h2>
                            <button className="btn-icon" onClick={resetModal}><X size={24} /></button>
                        </div>

                        <div className="modal-body" style={{ padding: '20px' }}>
                            {step === 1 && (
                                <div>
                                    <label className="filter-label">Find Order by ID, Name or Phone</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                        <input
                                            type="text"
                                            className="modern-input"
                                            placeholder="e.g. 143, 0999..."
                                            value={searchOrderTerm}
                                            onChange={(e) => setSearchOrderTerm(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchOrder()}
                                        />
                                        <button className="btn-modern secondary" onClick={handleSearchOrder}>Search</button>
                                    </div>

                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {foundOrders.map(order => (
                                            <div key={order.id}
                                                onClick={() => handleSelectOrder(order)}
                                                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>Order #{order.id}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.full_name || order.username} - {order.phone}</div>
                                                </div>
                                                <div style={{ fontWeight: 600 }}>{parseInt(order.total_amount).toLocaleString()}₫</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                        <button className="btn-icon" onClick={() => setStep(1)}><ArrowLeft size={18} /></button>
                                        <h3 style={{ margin: 0 }}>Select Items from Order #{selectedOrder.id}</h3>
                                    </div>

                                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                                        <table className="table-modern">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Sold Price</th>
                                                    <th>Returnable</th>
                                                    <th>Return Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderItems.map(item => (
                                                    <tr key={item.product_id}>
                                                        <td>
                                                            <div className="font-medium">{item.product_name}</div>
                                                            <small className="text-muted">{item.sku}</small>
                                                        </td>
                                                        <td>{parseInt(item.price).toLocaleString()}₫</td>
                                                        <td>{item.returnable_qty}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="modern-input"
                                                                style={{ width: '80px', padding: '4px 8px' }}
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

                                    <div style={{ marginBottom: '20px' }}>
                                        <label className="filter-label">Reason for Return (Required)</label>
                                        <textarea
                                            className="modern-input"
                                            rows="3"
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            placeholder="e.g. Defective, Wrong Size..."
                                        ></textarea>
                                    </div>

                                    <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <AlertCircle size={20} />
                                            <span>
                                                <strong>Warning:</strong> This will restock items and deduct loyalty points.
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Refund</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#dc2626' }}>{calculateRefundTotal().toLocaleString()}₫</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer" style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn-modern secondary" onClick={resetModal}>Cancel</button>
                            {step === 2 && (
                                <button className="btn-modern primary" onClick={handleSubmitReturn} style={{ background: '#dc2626', borderColor: '#dc2626' }}>
                                    Confirm Return
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
