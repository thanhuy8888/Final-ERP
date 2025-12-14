import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';

const OrderDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/admin/orders.php?id=${id}`);
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
        try {
            await api.post('/admin/orders.php', { id, status: newStatus });
            fetchOrder();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const openInvoice = () => {
        window.open(`http://localhost:8081/Final-ERP/api/invoice.php?order_id=${id}`, '_blank');
    };

    if (loading) return <div>{t('common.loading')}</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>{t('orders.orderDetail')} #{id}</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={openInvoice} className="btn-primary" style={{ background: '#2ecc71' }}>
                        🧾 {t('admin.downloadInvoice')}
                    </button>
                    <button onClick={() => navigate('/admin/orders')} className="btn-primary">← Back</button>
                </div>
            </div>

            <div className="admin-card">
                <h3>{t('admin.customer')} Info</h3>
                <p><strong>Name:</strong> {order.username}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>{t('admin.date')}:</strong> {new Date(order.created_at).toLocaleString('vi-VN')}</p>

                <h3 style={{ marginTop: '20px' }}>{t('admin.status')}</h3>
                <p>Current: <strong>{t(`admin.statusLabels.${order.status}`)}</strong></p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => updateStatus('pending')} className="btn-primary">{t('admin.statusLabels.pending')}</button>
                    <button onClick={() => updateStatus('processing')} className="btn-primary">{t('admin.statusLabels.processing')}</button>
                    <button onClick={() => updateStatus('completed')} className="btn-primary">{t('admin.statusLabels.completed')}</button>
                    <button onClick={() => updateStatus('cancelled')} className="btn-danger">{t('admin.statusLabels.cancelled')}</button>
                </div>
            </div>

            <div className="admin-card" style={{ marginTop: '20px' }}>
                <h3>{t('orders.products')}</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.image')}</th>
                            <th>{t('admin.productName')}</th>
                            <th>{t('admin.price')}</th>
                            <th>{t('orders.quantity')}</th>
                            <th>{t('cart.subtotal')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map(item => (
                            <tr key={item.id}>
                                <td><img src={item.image || '/placeholder.jpg'} alt={item.product_name} /></td>
                                <td>{item.product_name}</td>
                                <td>{parseInt(item.price).toLocaleString()}{t('common.currency')}</td>
                                <td>{item.quantity}</td>
                                <td>{parseInt(item.price * item.quantity).toLocaleString()}{t('common.currency')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                    {t('orders.total')}: {parseInt(order.total_amount).toLocaleString()}{t('common.currency')}
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
