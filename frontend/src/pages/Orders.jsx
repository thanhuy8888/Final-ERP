import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import './Orders.css';

const Orders = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders.php');
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetail = async (orderId) => {
        try {
            const response = await api.get(`/orders.php?id=${orderId}`);
            setSelectedOrder(response.data);
        } catch (error) {
            console.error("Failed to fetch order", error);
        }
    };

    const getStatusBadge = (status) => {
        const statusKey = `orders.status.${status}`;
        const label = t(statusKey);
        return <span className={`status-badge ${status}`}>{label}</span>;
    };

    if (!user) {
        return (
            <div className="orders-page">
                <Navbar />
                <div className="orders-container">
                    <div className="login-required">
                        <h2>🔐 {t('orders.loginRequired')}</h2>
                        <p>{t('orders.loginRequiredMsg')}</p>
                        <Link to="/login" className="btn-login">{t('orders.loginNow')}</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="orders-page">
                <Navbar />
                <div className="orders-loading">
                    <div className="loading-spinner"></div>
                    <p>{t('orders.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <Navbar />

            <div className="orders-container">
                <h1>📦 {t('orders.title')}</h1>

                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <div className="empty-icon">📦</div>
                        <h2>{t('orders.empty')}</h2>
                        <p>{t('orders.emptyMsg')}</p>
                        <Link to="/" className="btn-shop">{t('orders.shopNow')}</Link>
                    </div>
                ) : (
                    <div className="orders-content">
                        <div className="orders-list">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    className={`order-card ${selectedOrder?.id === order.id ? 'active' : ''}`}
                                    onClick={() => fetchOrderDetail(order.id)}
                                >
                                    <div className="order-header">
                                        <span className="order-id">{t('orders.orderId')} #{order.id}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div className="order-info">
                                        <p className="order-date">
                                            📅 {new Date(order.created_at).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p className="order-items-count">{order.item_count} {t('common.products')}</p>
                                    </div>
                                    <div className="order-total">
                                        {parseInt(order.total_amount).toLocaleString()}{t('common.currency')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-detail-panel">
                            {selectedOrder ? (
                                <>
                                    <div className="detail-header">
                                        <h2>{t('orders.orderDetail')} #{selectedOrder.id}</h2>
                                        {getStatusBadge(selectedOrder.status)}
                                    </div>

                                    <div className="detail-items">
                                        <h3>{t('orders.products')}</h3>
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="detail-item">
                                                <img src={item.product_image || '/placeholder.jpg'} alt={item.product_name} />
                                                <div className="item-info">
                                                    <span className="item-name">{item.product_name}</span>
                                                    <span className="item-qty">{t('orders.quantity')}: {item.quantity}</span>
                                                </div>
                                                <span className="item-price">
                                                    {(parseInt(item.price) * item.quantity).toLocaleString()}{t('common.currency')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="detail-summary">
                                        <div className="summary-row">
                                            <span>{t('orders.paymentMethod')}</span>
                                            <span>{selectedOrder.payment_method === 'cod' ? t('orders.codPayment') : t('orders.bankPayment')}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>{t('orders.total')}</span>
                                            <span>{parseInt(selectedOrder.total_amount).toLocaleString()}{t('common.currency')}</span>
                                        </div>
                                    </div>

                                    {selectedOrder.notes && (
                                        <div className="detail-notes">
                                            <h3>{t('orders.notes')}</h3>
                                            <p>{selectedOrder.notes}</p>
                                        </div>
                                    )}

                                    <button
                                        className="btn-invoice"
                                        onClick={() => window.open(`http://localhost/Final-ERP/api/invoice.php?order_id=${selectedOrder.id}`, '_blank')}
                                    >
                                        🧾 {t('orders.viewInvoice')}
                                    </button>
                                </>
                            ) : (
                                <div className="no-selection">
                                    <p>👈 {t('orders.selectOrder')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
