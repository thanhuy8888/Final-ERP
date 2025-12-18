import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Plus, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import './Order.css'; // Import CSS chung

const AdminReturns = () => {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [searchOrderTerm, setSearchOrderTerm] = useState('');
    const [foundOrders, setFoundOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [returnReason, setReturnReason] = useState('');
    const [returnItems, setReturnItems] = useState({});

    useEffect(() => { fetchReturns(); }, []);

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/returns.php');
            setReturns(res.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
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
        } catch (err) { error("Failed to search orders"); }
    };

    const handleSelectOrder = async (order) => {
        setSelectedOrder(order);
        try {
            const res = await api.get(`/admin/returns.php?order_details=${order.id}`);
            setOrderItems(res.data);
            setStep(2);
        } catch (err) { error("Failed to load order items"); }
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
        return orderItems.reduce((total, item) => {
            const qty = returnItems[item.product_id] || 0;
            return total + (qty * item.price);
        }, 0);
    };

    const handleSubmitReturn = async () => {
        if (!returnReason) return error("Please provide a reason for return");
        const itemsToReturn = Object.entries(returnItems).map(([pid, qty]) => ({ product_id: pid, quantity: qty }));
        if (itemsToReturn.length === 0) return error("Please select at least one item");

        try {
            await api.post('/admin/returns.php', {
                order_id: selectedOrder.id,
                items: itemsToReturn,
                reason: returnReason
            });
            success("Return processed successfully");
            fetchReturns();
            resetModal();
        } catch (err) { error(err.response?.data?.error || "Failed to process return"); }
    };

    const formatReason = (text) => text ? text.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <div>
                    <h1>Returns Management</h1>
                    <p className="text-muted">Process refunds and restock inventory.</p>
                </div>
                <button className="btn-modern primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Return
                </button>
            </div>

            <div className="content-card">
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
                                    <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{ret.return_number}</td>
                                    <td>#{ret.order_ref}</td>
                                    <td>
                                        <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {formatReason(ret.reason)}
                                        </span>
                                    </td>
                                    <td className="price-text" style={{ color: '#dc2626' }}>
                                        {parseInt(ret.refund_amount).toLocaleString()}₫
                                    </td>
                                    <td>{ret.processed_by_display}</td>
                                    <td style={{ color: '#64748b' }}>{new Date(ret.created_at).toLocaleDateString()}</td>
                                    <td><span className="badge-soft completed">Completed</span></td>
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
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Create Return</h2>
                            <button className="btn-icon" onClick={resetModal}><X size={24} /></button>
                        </div>

                        <div className="modal-body">
                            {step === 1 && (
                                <>
                                    <label className="filter-label">Find Order</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', marginTop: '8px' }}>
                                        <input
                                            type="text"
                                            className="modern-input"
                                            placeholder="Order ID, Name or Phone..."
                                            value={searchOrderTerm}
                                            onChange={(e) => setSearchOrderTerm(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchOrder()}
                                        />
                                        <button className="btn-modern secondary" onClick={handleSearchOrder}>Search</button>
                                    </div>

                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {foundOrders.map(order => (
                                            <div key={order.id} className="search-result-item" onClick={() => handleSelectOrder(order)}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>Order #{order.id}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{order.full_name || order.username} - {order.phone}</div>
                                                </div>
                                                <div style={{ fontWeight: 700 }}>{parseInt(order.total_amount).toLocaleString()}₫</div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                        <button className="btn-icon" onClick={() => setStep(1)}><ArrowLeft size={18} /></button>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Select Items from Order #{selectedOrder.id}</h3>
                                    </div>

                                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                                        <table className="table-modern">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Price</th>
                                                    <th>Returnable</th>
                                                    <th>Return Qty</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderItems.map(item => (
                                                    <tr key={item.product_id}>
                                                        <td>
                                                            <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                                                            <small className="text-muted">{item.sku}</small>
                                                        </td>
                                                        <td>{parseInt(item.price).toLocaleString()}₫</td>
                                                        <td>{item.returnable_qty}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="modern-input"
                                                                style={{ width: '80px', height: '36px' }}
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
                                        <label className="filter-label">Reason for Return</label>
                                        <textarea
                                            className="modern-input"
                                            style={{ height: 'auto', padding: '12px', marginTop: '8px' }}
                                            rows="3"
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            placeholder="e.g. Defective, Wrong Size..."
                                        ></textarea>
                                    </div>

                                    <div className="alert-box">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <AlertCircle size={20} />
                                            <span><strong>Warning:</strong> Items will be restocked.</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>Total Refund</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#dc2626' }}>{calculateRefundTotal().toLocaleString()}₫</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modern secondary" onClick={resetModal}>Cancel</button>
                            {step === 2 && (
                                <button className="btn-modern danger" onClick={handleSubmitReturn}>
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