import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Search, Plus, X, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import './Inventory.css'; // Sử dụng file CSS chung

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
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h1>Returns Management</h1>
                    <p className="subtitle">Process refunds and restock inventory.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Return
                </button>
            </div>

            <div className="content-card">
                <div className="toolbar" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn-refresh" onClick={fetchReturns}>
                        <RefreshCw size={18} /> Refresh List
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading returns...</div>
                ) : (
                    <table className="admin-table">
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
                                    <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#3b82f6' }}>{ret.return_number}</td>
                                    <td>#{ret.order_ref}</td>
                                    <td>
                                        <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                                            {formatReason(ret.reason)}
                                        </span>
                                    </td>
                                    <td style={{ color: '#dc2626', fontWeight: 700 }}>
                                        {parseInt(ret.refund_amount).toLocaleString()}₫
                                    </td>
                                    <td>{ret.processed_by_display}</td>
                                    <td style={{ color: '#64748b' }}>{new Date(ret.created_at).toLocaleDateString()}</td>
                                    <td><span className="status-badge badge-green">Completed</span></td>
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
                    <div className="modal-content" style={{ maxWidth: '650px' }}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Create Return</h3>
                            <button className="btn-icon" onClick={resetModal}><X size={24} /></button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            {step === 1 && (
                                <>
                                    <label className="form-label">Find Order</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', marginTop: '8px' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Order ID, Name or Phone..."
                                            value={searchOrderTerm}
                                            onChange={(e) => setSearchOrderTerm(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchOrder()}
                                        />
                                        <button className="btn-primary" onClick={handleSearchOrder} style={{ width: 'auto' }}>Search</button>
                                    </div>

                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {foundOrders.map(order => (
                                            <div key={order.id} 
                                                onClick={() => handleSelectOrder(order)}
                                                style={{ 
                                                    padding: '16px', 
                                                    border: '1px solid #e2e8f0', 
                                                    borderRadius: '12px', 
                                                    marginBottom: '10px', 
                                                    cursor: 'pointer', 
                                                    background: '#f8fafc', 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#E31E24'}
                                                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>Order #{order.id}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{order.full_name || order.username} - {order.phone}</div>
                                                </div>
                                                <div style={{ fontWeight: 700, color: '#E31E24' }}>{parseInt(order.total_amount).toLocaleString()}₫</div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                        <button className="btn-icon" onClick={() => setStep(1)}><ArrowLeft size={18} /></button>
                                        <h4 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Select Items from Order #{selectedOrder.id}</h4>
                                    </div>

                                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                                        <table className="admin-table">
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
                                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.product_name}</div>
                                                            <small style={{ color: '#64748b', fontFamily: 'monospace' }}>{item.sku}</small>
                                                        </td>
                                                        <td>{parseInt(item.price).toLocaleString()}₫</td>
                                                        <td>{item.returnable_qty}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-input"
                                                                style={{ width: '80px', padding: '8px' }}
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

                                    <div style={{ marginBottom: '24px' }}>
                                        <label className="form-label">Reason for Return</label>
                                        <textarea
                                            className="form-textarea"
                                            rows="3"
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            placeholder="e.g. Defective, Wrong Size..."
                                        ></textarea>
                                    </div>

                                    <div className="preview-alert">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <AlertCircle size={20} />
                                            <span><strong>Warning:</strong> Items will be restocked.</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: '#9a3412' }}>Total Refund</div>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#dc2626' }}>{calculateRefundTotal().toLocaleString()}₫</div>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button className="btn-cancel" onClick={resetModal}>Cancel</button>
                                        <button className="btn-submit-preview" onClick={handleSubmitReturn}>
                                            Confirm Return
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReturns;