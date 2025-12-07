import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import SaleLayout from '../../components/SaleLayout';
import { useTranslation } from '../../hooks/useTranslation';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const SaleDashboard = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/sale/stats.php');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return parseInt(value || 0).toLocaleString() + 'đ';
    };

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

    // Chart data for daily revenue
    const dailyChartData = {
        labels: stats?.daily_last_7_days?.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' });
        }) || [],
        datasets: [{
            label: t('sale.revenue'),
            data: stats?.daily_last_7_days?.map(d => d.revenue) || [],
            backgroundColor: 'rgba(52, 152, 219, 0.8)',
            borderColor: '#3498db',
            borderWidth: 2,
            borderRadius: 8,
        }]
    };

    // Chart data for monthly revenue
    const monthlyChartData = {
        labels: stats?.monthly_last_6_months?.map(d => d.month) || [],
        datasets: [{
            label: t('sale.revenue'),
            data: stats?.monthly_last_6_months?.map(d => d.revenue) || [],
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            tension: 0.4,
            fill: true,
        }]
    };

    // Order status doughnut
    const statusChartData = {
        labels: stats?.by_status?.map(s => t(`orders.status.${s.status}`)) || [],
        datasets: [{
            data: stats?.by_status?.map(s => s.count) || [],
            backgroundColor: [
                '#f39c12', // pending
                '#3498db', // confirmed
                '#9b59b6', // processing
                '#1abc9c', // shipping
                '#27ae60', // delivered
                '#e74c3c', // cancelled
            ],
        }]
    };

    return (
        <SaleLayout>
            <div className="sale-dashboard">
                <h1>📊 {t('sale.dashboard')}</h1>

                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card today">
                        <div className="stat-icon">📅</div>
                        <div className="stat-info">
                            <span className="stat-label">{t('sale.todayRevenue')}</span>
                            <span className="stat-value">{formatCurrency(stats?.today?.revenue)}</span>
                            <span className="stat-sub">{stats?.today?.orders || 0} {t('sale.orders')}</span>
                        </div>
                    </div>

                    <div className="stat-card week">
                        <div className="stat-icon">📆</div>
                        <div className="stat-info">
                            <span className="stat-label">{t('sale.weekRevenue')}</span>
                            <span className="stat-value">{formatCurrency(stats?.this_week?.revenue)}</span>
                            <span className="stat-sub">{stats?.this_week?.orders || 0} {t('sale.orders')}</span>
                        </div>
                    </div>

                    <div className="stat-card month">
                        <div className="stat-icon">📈</div>
                        <div className="stat-info">
                            <span className="stat-label">{t('sale.monthRevenue')}</span>
                            <span className="stat-value">{formatCurrency(stats?.this_month?.revenue)}</span>
                            <span className="stat-sub">{stats?.this_month?.orders || 0} {t('sale.orders')}</span>
                        </div>
                    </div>

                    <div className="stat-card total">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <span className="stat-label">{t('sale.totalRevenue')}</span>
                            <span className="stat-value">{formatCurrency(stats?.all_time?.total_revenue)}</span>
                            <span className="stat-sub">{stats?.all_time?.total_orders || 0} {t('sale.totalOrders')}</span>
                        </div>
                    </div>
                </div>

                {/* Target Progress */}
                {stats?.target && (
                    <div className="target-section">
                        <h3>🎯 {t('sale.monthlyTarget')}</h3>
                        <div className="target-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min(stats.target.progress_percent, 100)}%` }}
                                ></div>
                            </div>
                            <span className="progress-text">
                                {formatCurrency(stats.this_month?.revenue)} / {formatCurrency(stats.target.target_amount)}
                                ({stats.target.progress_percent}%)
                            </span>
                        </div>
                    </div>
                )}

                {/* Charts */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>📊 {t('sale.last7Days')}</h3>
                        <Bar data={dailyChartData} options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true } }
                        }} />
                    </div>

                    <div className="chart-card">
                        <h3>📈 {t('sale.last6Months')}</h3>
                        <Line data={monthlyChartData} options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true } }
                        }} />
                    </div>

                    <div className="chart-card small">
                        <h3>📋 {t('sale.orderStatus')}</h3>
                        <Doughnut data={statusChartData} options={{
                            responsive: true,
                            plugins: { legend: { position: 'bottom' } }
                        }} />
                    </div>
                </div>

                {/* Recent Orders & Top Products */}
                <div className="bottom-grid">
                    <div className="recent-orders">
                        <h3>🕒 {t('sale.recentOrders')}</h3>
                        {stats?.recent_orders?.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('orders.id')}</th>
                                        <th>{t('sale.customer')}</th>
                                        <th>{t('orders.total')}</th>
                                        <th>{t('orders.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recent_orders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id}</td>
                                            <td>{order.customer_name || 'N/A'}</td>
                                            <td>{formatCurrency(order.total_amount)}</td>
                                            <td>
                                                <span className={`status-badge ${order.status}`}>
                                                    {t(`orders.status.${order.status}`)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="no-data">{t('sale.noOrders')}</p>
                        )}
                        <Link to="/sale/orders" className="view-all">{t('common.viewAll')} →</Link>
                    </div>

                    <div className="top-products">
                        <h3>🏆 {t('sale.topProducts')}</h3>
                        {stats?.top_products?.length > 0 ? (
                            <ul>
                                {stats.top_products.map((product, index) => (
                                    <li key={product.id}>
                                        <span className="rank">#{index + 1}</span>
                                        <span className="name">{product.name}</span>
                                        <span className="qty">{product.total_quantity} {t('sale.sold')}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-data">{t('sale.noProducts')}</p>
                        )}
                    </div>
                </div>
            </div>
        </SaleLayout>
    );
};

export default SaleDashboard;
