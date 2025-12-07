import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';

const AdminOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/admin/orders.php');
                setOrders(response.data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusClass = (status) => {
        const map = {
            'pending': 'status-pending',
            'processing': 'status-processing',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled'
        };
        return map[status] || '';
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>{t('admin.orderList')}</h1>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('admin.customer')}</th>
                            <th>{t('admin.totalAmount')}</th>
                            <th>{t('admin.status')}</th>
                            <th>{t('admin.date')}</th>
                            <th>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.username}</td>
                                <td>{parseInt(order.total_amount).toLocaleString()}{t('common.currency')}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                                        {t(`admin.statusLabels.${order.status}`)}
                                    </span>
                                </td>
                                <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <Link to={`/admin/orders/${order.id}`} className="btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                                        {t('admin.viewDetail')}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
