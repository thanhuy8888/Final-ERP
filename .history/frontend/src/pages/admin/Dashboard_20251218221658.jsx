import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7days');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/admin/stats.php?range=${dateRange}`);
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [dateRange]);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <span>{t('admin.loading')}</span>
            </div>
        );
    }

    const formatPrice = (price) => {
        return Number(price).toLocaleString('vi-VN') + t('common.currency');
    };

    const handleCardClick = (path) => {
        navigate(path);
    };

    // Revenue Chart Data - Canifa Red Theme
    const revenueChartData = {
        labels: stats?.daily_revenue?.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }) || [],
        datasets: [
            {
                label: t('admin.revenue'),
                data: stats?.daily_revenue?.map(d => Number(d.revenue)) || [],
                backgroundColor: 'rgba(225, 29, 42, 0.12)',
                borderColor: '#E11D2A',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#E11D2A',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            }
        ]
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${Number(context.raw).toLocaleString('vi-VN')}${t('common.currency')}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#E5E7EB' },
                ticks: {
                    callback: (value) => {
                        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                        return value.toLocaleString();
                    },
                    font: { size: 10 }
                }
            },
            x: { grid: { display: false } }
        }
    };

    // Category Revenue Doughnut - Canifa Colors
    const categoryRevenueData = {
        labels: stats?.revenue_by_category?.map(c => c.category) || [],
        datasets: [{
            data: stats?.revenue_by_category?.map(c => Number(c.revenue)) || [],
            //backgroundColor: ['#E11D2A', '#1F2937', '#F59E0B'],
            backgroundColor: ['#1E3A8A', '#E11D48', '#FACC15'],
            borderWidth: 0,
        }]
    };

    const categoryOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 15, usePointStyle: true, font: { size: 11 } }
            }
        }
    };

    // Stock Status Bar Chart
    const stockStatusData = {
        labels: [t('admin.lowStockItems'), t('admin.highStockItems'), t('admin.totalSKU')],
        datasets: [{
            label: t('admin.quantity'),
            data: [
                stats?.inventory_alert_count || 0,
                stats?.high_stock_count || 0,
                stats?.product_count || 0
            ],
            backgroundColor: ['#DC2626', '#2563EB', '#9CA3AF'],
            borderRadius: 4,
        }]
    };

    const stockStatusOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
            x: { grid: { display: false } }
        }
    };

    // Order Status Bar Chart
    const statusColors = {
        pending: '#F97316',
        confirmed: '#2563EB',
        processing: '#4F46E5',
        completed: '#10B981',
        cancelled: '#B91C1C'
    };

    const orderStatusBarData = {
        labels: stats?.order_status?.map(s => t(`admin.statusLabels.${s.status}`)) || [],
        datasets: [{
            label: t('admin.orders'),
            data: stats?.order_status?.map(s => Number(s.count)) || [],
            backgroundColor: stats?.order_status?.map(s => statusColors[s.status] || '#999') || [],
            borderRadius: 4,
        }]
    };

    const orderStatusBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
            x: { grid: { display: false } }
        }
    };

    // Top 5 Products Bar Chart
    const topProductsData = {
        labels: stats?.top_products?.map(p => p.name).slice(0, 5) || [],
        datasets: [{
            label: t('admin.sold'),
            data: stats?.top_products?.map(p => Number(p.total_sold)).slice(0, 5) || [],
            backgroundColor: stats?.top_products?.map((_, index) => index === 0 ? '#E11D2A' : '#2563EB').slice(0, 5),
            borderRadius: 4,
        }]
    };

    const topProductsOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => `${t('admin.sold')}: ${context.raw}`
                }
            }
        },
        scales: {
            x: { beginAtZero: true, grid: { display: false } },
            y: { grid: { display: false } }
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header with Date Filter */}
            <div className="dashboard-header-row">
                <div className="dashboard-header">
                    <h1>📊 {t('admin.dashboard')}</h1>
                    <p>{t('admin.overview')}</p>
                </div>
                <div className="dashboard-actions">
                    <div className="date-filter">
                        <button
                            className={dateRange === 'today' ? 'active' : ''}
                            onClick={() => setDateRange('today')}
                        >
                            Hôm nay
                        </button>
                        <button
                            className={dateRange === '7days' ? 'active' : ''}
                            onClick={() => setDateRange('7days')}
                        >
                            7 Ngày
                        </button>
                        <button
                            className={dateRange === '30days' ? 'active' : ''}
                            onClick={() => setDateRange('30days')}
                        >
                            30 Ngày
                        </button>
                    </div>
                </div>
            </div>

            {/* 5 KPI Cards with % Change */}
            <div className="stats-grid-5">
                <div className="stat-card revenue clickable" onClick={() => handleCardClick('/admin/reports')}>
                    <h3>💰 {t('admin.revenue')}</h3>
                    <p className="stat-value">{formatPrice(stats?.revenue || 0)}</p>
                    <p className="stat-change positive">+12.5% vs kỳ trước</p>
                </div>
                <div className="stat-card orders clickable" onClick={() => handleCardClick('/admin/orders')}>
                    <h3>🛒 {t('admin.orders')}</h3>
                    <p className="stat-value">{stats?.order_count || 0}</p>
                    <p className="stat-change positive">+8.3% vs kỳ trước</p>
                </div>
                <div className="stat-card aov" title="Giá trị trung bình mỗi đơn hàng">
                    <h3>💵 {t('admin.avgOrderValue')}</h3>
                    <p className="stat-value">{formatPrice(stats?.avg_order_value || 0)}</p>
                    <p className="stat-change positive">+3.2% vs kỳ trước</p>
                </div>
                <div className="stat-card return-rate" title="Tỷ lệ đơn hàng bị hủy">
                    <h3>↩️ {t('admin.returnRate')}</h3>
                    <p className="stat-value">{(stats?.return_rate || 0).toFixed(1)}%</p>
                    <p className="stat-change negative">-1.5% vs kỳ trước</p>
                </div>
                <div className="stat-card alerts clickable" onClick={() => handleCardClick('/admin/inventory')}>
                    <h3>⚠️ {t('admin.inventoryAlerts')}</h3>
                    <p className="stat-value">{stats?.inventory_alert_count || 0}</p>
                    <p className="stat-change">Cần xử lý</p>
                </div>
            </div>

            {/* Charts Section 1 - Revenue (wider) & Category */}
            <div className="charts-section" style={{ gridTemplateColumns: '2fr 1fr' }}>
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
                    <h3>{t('admin.categoryRevenue')}</h3>
                    <div className="chart-container">
                        {stats?.revenue_by_category?.length > 0 ? (
                            <Doughnut data={categoryRevenueData} options={categoryOptions} />
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">👕</div>
                                <p>{t('admin.noSalesData')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Section 2 - Stock, Order Status & Top Products (3 columns) */}
            <div className="charts-section" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="chart-card">
                    <h3>⚠️ {t('admin.stockStatus')}</h3>
                    <div className="chart-container">
                        <Bar data={stockStatusData} options={stockStatusOptions} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>📋 {t('admin.orderStatus')}</h3>
                    <div className="chart-container">
                        {stats?.order_status?.length > 0 ? (
                            <Bar data={orderStatusBarData} options={orderStatusBarOptions} />
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">🛒</div>
                                <p>{t('admin.noOrders')}</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="chart-card">
                    <h3>🏆 Top 5 {t('admin.topProducts')}</h3>
                    <div className="chart-container">
                        {stats?.top_products?.length > 0 ? (
                            <Bar data={topProductsData} options={topProductsOptions} />
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
