import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Plus, X, AlertCircle, ArrowLeft, RefreshCw, FileText } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import './Orders.css';

const AdminReturns = () => {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1);

    // Form State
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
        } catch (err) { error("Failed to load items"); }
    };

    const handleQtyChange = (productId, qty, max) => {
        const value = Math.min(Math.max(0, qty), max);
        setReturnItems(prev => {
            const copy = { ...prev };
            if (value > 0) copy[productId] = value;
            else delete copy[productId];
            return copy;
        });
    };

    const handleSubmitReturn = async () => {
        if (!returnReason) return error("Please provide a reason");
        const itemsToReturn = Object.entries(returnItems).map(([pid, qty]) => ({ product_id: pid, quantity: qty }));
        if (itemsToReturn.length === 0) return error("Select at least one item");

        try {
            await api.post('/admin/returns.php', {
                order_id: selectedOrder.id,
                items: itemsToReturn,
                reason: returnReason
            });
            success("Return processed successfully");
            fetchReturns();
            resetModal();
        } catch (err) { error(err.response?.data?.error || "Error"); }
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>Returns Management</h1>
                    <p className="text-muted" style={{ marginTop: '4px' }}>Analyze and manage product returns & refunds.</p>
                </div>
                <button className="btn-modern primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> New Return
                </button>
            </div>

            <div className="content-card">
                {loading ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                        <RefreshCw className="animate-spin" size={24} style={{ marginBottom: '12px' }} />
                        <p>Loading records...</p>
                    </div>
                ) : (
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Return No.</th>
                                <th>Order Ref</th>
                                <th>Reason</th>
                                <th>Refund Amount</th>
                                <th>Processed By</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.map(ret => (
                                <tr key={ret.id}>
                                    <td style={{ fontWeight: '700', color: 'var(--primary)', fontFamily: 'monospace' }}>{ret.return_number}</td>
                                    <td style={{ fontWeight: '500' }}>#{ret.order_ref}</td>
                                    <td>
                                        <span style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                                            {ret.reason?.replace(/_/g, ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '700', color: 'var(--danger)' }}>
                                        {parseInt(ret.refund_amount).toLocaleString()}₫
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{ret.processed_by_display}</div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(ret.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 style={{ fontWeight: '700' }}>Create New Return</h2>
                            <button className="btn-modern secondary" style={{ padding: '8px' }} onClick={resetModal}><X size={20}/></button>
                        </div>
                        <div className="modal-body">
                            {step === 1 ? (
                                <div>
                                    <label className="filter-label">Search Order</label>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', marginBottom: '24px' }}>
                                        <input 
                                            className="modern-input" 
                                            placeholder="Enter Order ID or Customer Phone..." 
                                            value={searchOrderTerm} 
                                            onChange={e => setSearchOrderTerm(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSearchOrder()}
                                        />
                                        <button className="btn-modern primary" onClick={handleSearchOrder}>Search</button>
                                    </div>
                                    <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                        {foundOrders.map(order => (
                                            <div key={order.id} className="order-item-row" onClick={() => handleSelectOrder(order)} 
                                                style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: '700' }}>Order #{order.id}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{order.phone} • {order.full_name}</div>
                                                </div>
                                                <div style={{ fontWeight: '700' }}>{parseInt(order.total_amount).toLocaleString()}₫</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                        <button className="btn-modern secondary" style={{ padding: '8px' }} onClick={() => setStep(1)}><ArrowLeft size={18}/></button>
                                        <h3 style={{ fontWeight: '700', margin: 0 }}>Items in Order #{selectedOrder.id}</h3>
                                    </div>
                                    <table className="table-modern" style={{ marginBottom: '20px' }}>
                                        <thead style={{ background: '#f8fafc' }}>
                                            <tr>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Return Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderItems.map(item => (
                                                <tr key={item.product_id}>
                                                    <td>
                                                        <div style={{ fontWeight: '600' }}>{item.product_name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.sku}</div>
                                                    </td>
                                                    <td>{item.returnable_qty}</td>
                                                    <td style={{ width: '100px' }}>
                                                        <input 
                                                            type="number" className="modern-input" style={{ height: '36px' }}
                                                            max={item.returnable_qty} min="0"
                                                            value={returnItems[item.product_id] || ''}
                                                            onChange={e => handleQtyChange(item.product_id, parseInt(e.target.value) || 0, item.returnable_qty)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <label className="filter-label">Reason for Return</label>
                                    <textarea 
                                        className="modern-input" style={{ height: '80px', paddingTop: '10px', marginTop: '8px' }}
                                        placeholder="Reason (e.g., Defective, Wrong size...)"
                                        value={returnReason} onChange={e => setReturnReason(e.target.value)}
                                    />
                                    <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', marginTop: '20px', border: '1px solid #fee2e2' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '0.85rem' }}>
                                            <AlertCircle size={16}/> <strong>Restock Warning:</strong> This will adjust inventory and loyalty points.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-modern secondary" onClick={resetModal}>Cancel</button>
                            {step === 2 && <button className="btn-modern primary" style={{ background: 'var(--danger)' }} onClick={handleSubmitReturn}>Confirm Return</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReturns;