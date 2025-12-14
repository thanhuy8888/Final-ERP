import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import './Orders.css'; // Reusing orders styles

const OrderDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/sale/orders.php?id=${id}`);
            setOrder(response.data);
        } catch (error) {
            console.error("Failed to fetch order", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const updateStatus = async (newStatus) => {
        if (!window.confirm(t('common.confirm') + '?')) return;
        try {
            await api.post('/sale/orders.php', {
                action: 'update_status',
                order_id: id,
                status: newStatus
            });
            fetchOrder();
        } catch (error) {
            console.error("Failed to update status", error);
            alert(t('common.error'));
        }
    };

    const openInvoice = () => {
        window.open(`http://localhost:8081/Final-ERP/api/invoice.php?order_id=${id}`, '_blank');
    };

    const formatCurrency = (val) => parseInt(val || 0).toLocaleString() + 'đ';

    if (loading) return <div className="sale-loading"><div className="loading-spinner"></div></div>;
    if (!order || order.error) return <div className="no-orders">{t('product.notFound') || 'Order not found'}</div>;

    return (
        <div className="sale-orders">
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => navigate('/sale/orders')}
                    className="btn-back"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#2c3e50',
                        fontWeight: '500',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                    }}
                >
                    <span>←</span> {t('sale.backOrders') || 'Quay lại danh sách'}
                </button>
            </div>

            <div className="orders-header">
                <h1>{t('orders.orderDetail')} #{id}</h1>
                <button onClick={openInvoice} className="btn-new-order">
                    🖨️ {t('orders.viewInvoice') || 'Xem & In hóa đơn'}
                </button>
            </div>

            <div className="orders-filters" style={{ display: 'block' }}> {/* Card style reuse */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <h3>{t('sale.customer')}</h3>
                        <p><strong>{t('checkout.fullName')}:</strong> {order.customer_name || 'Khách lẻ'}</p>
                        <p><strong>{t('checkout.phone')}:</strong> {order.customer_phone || 'N/A'}</p>
                        <p><strong>{t('checkout.address')}:</strong> {order.shipping_address || 'N/A'}</p>
                    </div>
                    <div>
                        <h3>{t('orders.orderId')}</h3>
                        <p><strong>{t('admin.date')}:</strong> {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                        <p><strong>{t('admin.status')}:</strong> <span className={`status-badge ${order.status}`}>{t(`orders.status.${order.status}`) || order.status}</span></p>

                        <div style={{ marginTop: '10px' }}>
                            <label>{t('admin.updateStatus')}: </label>
                            <select
                                value={order.status}
                                onChange={(e) => updateStatus(e.target.value)}
                                className="status-select"
                            >
                                <option value="pending">{t('orders.status.pending')}</option>
                                <option value="confirmed">{t('orders.status.confirmed')}</option>
                                <option value="processing">{t('orders.status.processing')}</option>
                                <option value="shipping">{t('orders.status.shipping')}</option>
                                <option value="delivered">{t('orders.status.delivered')}</option>
                                <option value="cancelled">{t('orders.status.cancelled')}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '20px', background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
                <h3>{t('orders.products')}</h3>
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>{t('sale.items')}</th>
                            <th>{t('product.image')}</th>
                            <th>{t('admin.price')}</th>
                            <th>{t('orders.quantity')}</th>
                            <th>{t('cart.subtotal')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.product_name}</td>
                                <td>
                                    {item.image && <img src={item.image} alt={item.product_name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />}
                                </td>
                                <td>{formatCurrency(item.price)}</td>
                                <td>{item.quantity}</td>
                                <td className="amount">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ minWidth: '250px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                            <span>{t('sale.subtotal')}:</span>
                            <strong>{formatCurrency(parseFloat(order.total_amount) + parseFloat(order.discount_amount))}</strong>
                        </div>
                        {parseFloat(order.discount_amount) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#E31E24' }}>
                                <span>{t('sale.discount')}:</span>
                                <strong>-{formatCurrency(order.discount_amount)}</strong>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #eee', fontSize: '18px', color: '#E31E24' }}>
                            <span>{t('sale.total')}:</span>
                            <strong>{formatCurrency(order.total_amount)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
