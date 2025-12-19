import { useEffect, useState } from 'react';
import { X, Printer, Ban, Package, User, MapPin, CreditCard } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

const OrderDetailModal = ({ isOpen, onClose, orderId, onOrderUpdated }) => {
    const { error: showError, success: showSuccess } = useToast();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetails();
        } else {
            setOrder(null);
        }
    }, [isOpen, orderId]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/orders.php?id=${orderId}`);
            setOrder(res.data);
        } catch (err) {
            showError("Failed to load order details");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        // Confirmation handled by UI state

        setIsCancelling(true);
        try {
            await api.post('/admin/cancel_order.php', {
                order_id: orderId,
                reason: 'Cancelled by Admin'
            });
            showSuccess('Order cancelled successfully');
            fetchOrderDetails(); // Refresh local view
            if (onOrderUpdated) onOrderUpdated(); // Refresh parent list
        } catch (err) {
            console.error(err);
            showError(err.response?.data?.message || "Failed to cancel order");
        } finally {
            setIsCancelling(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px', width: '90%', borderRadius: '12px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                {/* Header */}
                <div className="modal-header" style={{ background: '#fff', padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111827' }}>Order #{orderId}</h2>
                            {order && (
                                <span className={`status-badge status-${order.status}`} style={{ fontSize: '0.875rem' }}>
                                    {order.status.toUpperCase()}
                                </span>
                            )}
                        </div>
                        <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                            Placed on {order ? new Date(order.created_at).toLocaleString('vi-VN') : '...'}
                        </p>
                    </div>
                    <button className="btn-icon" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f9fafb' }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading order details...</div>
                    ) : order ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                            {/* Left Column: Items */}
                            <div className="order-items-section">
                                <div className="card-box" style={{ background: '#fff', borderRadius: '8px', padding: '20px', border: '1px solid #e5e7eb' }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Package size={18} /> Order Items
                                    </h4>
                                    <table className="admin-table" style={{ marginTop: 0 }}>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th style={{ textAlign: 'center' }}>Qty</th>
                                                <th style={{ textAlign: 'right' }}>Price</th>
                                                <th style={{ textAlign: 'right' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            {item.image ? (
                                                                <img src={item.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                                                            )}
                                                            <div>
                                                                <div className="font-medium text-dark">{item.product_name}</div>
                                                                <small className="text-muted">SKU: {item.sku || 'N/A'}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>x{item.quantity}</td>
                                                    <td style={{ textAlign: 'right' }}>{parseInt(item.price).toLocaleString()}₫</td>
                                                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                                        {(item.quantity * item.price).toLocaleString()}₫
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'right', paddingTop: '16px', color: '#6b7280' }}>Subtotal:</td>
                                                <td style={{ textAlign: 'right', paddingTop: '16px', fontWeight: '500' }}>{parseInt(order.total_amount).toLocaleString()}₫</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'right', color: '#6b7280' }}>VAT (Included):</td>
                                                <td style={{ textAlign: 'right', fontWeight: '500' }}>0₫</td>
                                            </tr>
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'right', paddingTop: '12px', fontSize: '1.1rem', fontWeight: 'bold' }}>Total:</td>
                                                <td style={{ textAlign: 'right', paddingTop: '12px', fontSize: '1.1rem', fontWeight: 'bold', color: '#dc2626' }}>
                                                    {parseInt(order.total_amount).toLocaleString()}₫
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Right Column: Customer & Info */}
                            <div className="order-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="card-box" style={{ background: '#fff', borderRadius: '8px', padding: '20px', border: '1px solid #e5e7eb' }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={18} /> Customer Info
                                    </h4>
                                    <p style={{ fontWeight: '500', marginBottom: '4px' }}>{order.customer_name || order.username}</p>
                                    <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>{order.customer_email || order.email}</p>
                                </div>

                                <div className="card-box" style={{ background: '#fff', borderRadius: '8px', padding: '20px', border: '1px solid #e5e7eb' }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={18} /> Delivery Info
                                    </h4>
                                    <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.5', color: '#4b5563' }}>
                                        {(order.shipping_address || 'Store Pickup')}
                                    </p>
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e5e7eb' }}>
                                        <div className="text-xs text-muted uppercase font-bold mb-1">Store & Sales</div>
                                        <div>{order.store_name?.replace('Canifa - ', '') || `Store #${order.store_id}`}</div>
                                        {order.staff_name && (
                                            <div style={{ fontSize: '13px', color: '#6366f1', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <User size={12} /> {order.staff_name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card-box" style={{ background: '#fff', borderRadius: '8px', padding: '20px', border: '1px solid #e5e7eb' }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CreditCard size={18} /> Payment
                                    </h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                        <span className="text-muted">Status</span>
                                        <span style={{ fontWeight: 500 }} className={order.payment_status === 'paid' ? 'text-success' : 'text-warning'}>
                                            {order.payment_status ? order.payment_status.toUpperCase() : 'PENDING'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span className="text-muted">Method</span>
                                        <span>{order.payment_method || 'COD'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>Order not found</div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="modal-footer" style={{ padding: '20px 24px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                    <button
                        className="btn-secondary"
                        onClick={() => window.open(`http://localhost:8081/Final-ERP/api/invoice.php?order_id=${orderId}`, '_blank')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Printer size={16} /> Print Invoice
                    </button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {order && order.status !== 'cancelled' && order.status !== 'completed' && (
                            !showConfirmCancel ? (
                                <button
                                    className="btn-danger"
                                    onClick={() => setShowConfirmCancel(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#dc2626', border: '1px solid #fee2e2' }}
                                >
                                    <Ban size={16} /> Cancel Order
                                </button>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', padding: '4px 8px', borderRadius: '6px' }}>
                                    <span style={{ color: '#dc2626', fontSize: '13px', fontWeight: 500 }}>Confirm Cancel?</span>
                                    <button
                                        onClick={handleCancelOrder}
                                        disabled={isCancelling}
                                        className="btn-danger"
                                        style={{ padding: '4px 12px', fontSize: '12px' }}
                                    >
                                        {isCancelling ? '...' : 'Yes'}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmCancel(false)}
                                        className="btn-secondary"
                                        style={{ padding: '4px 12px', fontSize: '12px', background: '#fff' }}
                                    >
                                        No
                                    </button>
                                </div>
                            )
                        )}
                        <button className="btn-primary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
