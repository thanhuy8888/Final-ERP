import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SaleLayout from '../../components/SaleLayout';
import { useTranslation } from '../../hooks/useTranslation';
import './Orders.css';

const SaleOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/sale/orders.php');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.post('/sale/orders.php', {
                action: 'update_status',
                order_id: orderId,
                status: newStatus
            });
            fetchOrders();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const formatCurrency = (value) => {
        return parseInt(value || 0).toLocaleString() + 'đ';
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const statusOptions = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];

    if (loading) {
        return (
            <SaleLayout>
                <div className="sale-loading">
                    <div className="loading-spinner"></div>
                    <p>{t('common.loading')}</p>
                </div>
            </SaleLayout>
        );
    }

    return (
        <SaleLayout>
            <div className="sale-orders">
                <div className="orders-header">
                    <h1>🛒 {t('sale.myOrders')}</h1>
                    <Link to="/sale/new-order" className="btn-new-order">
                        ➕ {t('sale.createOrder')}
                    </Link>
                </div>

                <div className="orders-filters">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        {t('sale.all')} ({orders.length})
                    </button>
                    {statusOptions.map(status => {
                        const count = orders.filter(o => o.status === status).length;
                        return (
                            <button
                                key={status}
                                className={filter === status ? 'active' : ''}
                                onClick={() => setFilter(status)}
                            >
                                {t(`orders.status.${status}`)} ({count})
                            </button>
                        );
                    })}
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="no-orders">
                        <p>{t('sale.noOrders')}</p>
                    </div>
                ) : (
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>{t('orders.id')}</th>
                                <th>{t('sale.customer')}</th>
                                <th>{t('orders.items')}</th>
                                <th>{t('orders.total')}</th>
                                <th>{t('orders.status')}</th>
                                <th>{t('orders.date')}</th>
                                <th>{t('orders.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>
                                        <div className="customer-info">
                                            <span className="name">{order.customer_name || order.username || 'N/A'}</span>
                                            {order.customer_phone && (
                                                <span className="phone">{order.customer_phone}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{order.item_count || 0} {t('sale.items')}</td>
                                    <td className="amount">{formatCurrency(order.total_amount)}</td>
                                    <td>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className={`status-select ${order.status}`}
                                        >
                                            {statusOptions.map(s => (
                                                <option key={s} value={s}>
                                                    {t(`orders.status.${s}`)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>{formatDate(order.created_at)}</td>
                                    <td>
                                        <Link to={`/sale/orders/${order.id}`} className="btn-view">
                                            {t('common.view')}
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </SaleLayout>
    );
};

export default SaleOrders;
