import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats.php');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <span>{t('admin.loading')}</span>
            </div>
        );
    }

    // Revenue Chart Data
    const revenueChartData = {
        labels: stats?.daily_revenue?.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }) || [],
        datasets: [
            {
                label: t('admin.revenueVnd'),
                data: stats?.daily_revenue?.map(d => Number(d.revenue)) || [],
                fill: true,
                backgroundColor: 'rgba(227, 30, 36, 0.1)',
                borderColor: '#E31E24',
                tension: 0.4,
                pointBackgroundColor: '#E31E24',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
            }
        ]
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return `${Number(context.raw).toLocaleString('vi-VN')}${t('common.currency')}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        }
                        return value.toLocaleString();
                    }
                }
            }
        }
    };

    // Order Status Pie Chart
    const statusColors = {
        pending: '#f1c40f',
        processing: '#3498db',
        completed: '#2ecc71',
        cancelled: '#e74c3c'
    };

    const orderStatusData = {
        labels: stats?.order_status?.map(s => t(`admin.statusLabels.${s.status}`)) || [],
        datasets: [
            {
                data: stats?.order_status?.map(s => Number(s.count)) || [],
                backgroundColor: stats?.order_status?.map(s => statusColors[s.status] || '#999') || [],
                borderWidth: 3,
                borderColor: '#fff',
            }
        ]
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                }
            }
        }
    };

    // Top Products Bar Chart
    const topProductsData = {
        labels: stats?.top_products?.map(p =>
            p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name
        ) || [],
        datasets: [
            {
                label: t('admin.sold'),
                data: stats?.top_products?.map(p => Number(p.total_sold)) || [],
                backgroundColor: [
                    'rgba(227, 30, 36, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                ],
                borderRadius: 8,
            }
        ]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    const getStatusClass = (status) => {
        return `order-status status-${status}`;
    };

    const formatPrice = (price) => {
        return Number(price).toLocaleString('vi-VN') + t('common.currency');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>📊 {t('admin.dashboard')}</h1>
                <p>{t('admin.overview')}</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card products">
                    <h3>📦 {t('admin.products')}</h3>
                    <p className="stat-value">{stats?.product_count || 0}</p>
                </div>
                <div className="stat-card orders">
                    <h3>🛒 {t('admin.orders')}</h3>
                    <p className="stat-value">{stats?.order_count || 0}</p>
                </div>
                <div className="stat-card customers">
                    <h3>👥 {t('admin.customers')}</h3>
                    <p className="stat-value">{stats?.customer_count || 0}</p>
                </div>
                <div className="stat-card revenue">
                    <h3>💰 {t('admin.revenue')}</h3>
                    <p className="stat-value">{formatPrice(stats?.revenue || 0)}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-card">
                    <h3>📈 {t('admin.revenueChart')}</h3>
                    <div className="chart-container">
                        {stats?.daily_revenue?.length > 0 ? (
                            <Line data={revenueChartData} options={revenueChartOptions} />
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📊</div>
                                <p>{t('admin.noRevenueData')}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="chart-card">
                    <h3>📋 {t('admin.orderStatus')}</h3>
                    <div className="chart-container">
                        {stats?.order_status?.length > 0 ? (
                            <Pie data={orderStatusData} options={pieOptions} />
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🛒</div>
                                <p>{t('admin.noOrders')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="bottom-section">
                {/* Recent Orders */}
                <div className="recent-orders-card">
                    <h3>🕐 {t('admin.recentOrders')}</h3>
                    {stats?.recent_orders?.length > 0 ? (
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>{t('admin.orderId')}</th>
                                    <th>{t('admin.customer')}</th>
                                    <th>{t('admin.totalAmount')}</th>
                                    <th>{t('admin.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="order-id">#{order.id}</td>
                                        <td>{order.customer_name || 'N/A'}</td>
                                        <td>{formatPrice(order.total_amount)}</td>
                                        <td>
                                            <span className={getStatusClass(order.status)}>
                                                {t(`admin.statusLabels.${order.status}`)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <p>{t('admin.noOrdersYet')}</p>
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div className="top-products-card">
                    <h3>🏆 {t('admin.topProducts')}</h3>
                    <div className="chart-container">
                        {stats?.top_products?.length > 0 ? (
                            <Bar data={topProductsData} options={barOptions} />
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📦</div>
                                <p>{t('admin.noSalesData')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
