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

    // --- CHART CONFIGURATIONS ---

    // 1. Revenue Line Chart (Modern Red Theme)
    const revenueChartData = {
        labels: stats?.daily_revenue?.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }) || [],
        datasets: [
            {
                label: t('admin.revenue'),
                data: stats?.daily_revenue?.map(d => Number(d.revenue)) || [],
                backgroundColor: 'rgba(227, 30, 36, 0.08)',
                borderColor: '#E31E24',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#E31E24',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1a1a2e',
                padding: 12,
                callbacks: {
                    label: (context) => ` ${t('admin.revenue')}: ${Number(context.raw).toLocaleString('vi-VN')}${t('common.currency')}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f0f0f0', drawBorder: false },
                ticks: {
                    callback: (value) => value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value.toLocaleString(),
                    font: { size: 11 }
                }
            },
            x: { grid: { display: false } }
        }
    };

    // 2. Category Doughnut (Professional Palette)
    const categoryRevenueData = {
        labels: stats?.revenue_by_category?.map(c => c.category) || [],
        datasets: [{
            data: stats?.revenue_by_category?.map(c => Number(c.revenue)) || [],
            backgroundColor: ['#E31E24', '#1a1a2e', '#3498db', '#2ecc71', '#f1c40f'],
            borderWidth: 4,
            borderColor: '#ffffff',
            hoverOffset: 15
        }]
    };

    const categoryOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 20, usePointStyle: true, font: { size: 12, weight: '600' } }
            }
        },
        cutout: '70%'
    };

    // 3. Stock Status Bar
    const stockStatusData = {
        labels: [t('admin.lowStockItems'), t('admin.highStockItems'), t('admin.totalSKU')],
        datasets: [{
            label: t('admin.quantity'),
            data: [
                stats?.inventory_alert_count || 0,
                stats?.high_stock_count || 0,
                stats?.product_count || 0
            ],
            backgroundColor: ['#e74c3c', '#3498db', '#95a5a6'],
            borderRadius: 8,
            barThickness: 30
        }]
    };

    // 4. Order Status Bar
    const statusColors = {
        pending: '#f39c12',
        confirmed: '#3498db',
        processing: '#9b59b6',
        completed: '#2ecc71',
        cancelled: '#e74c3c'
    };

    const orderStatusBarData = {
        labels: stats?.order_status?.map(s => t(`admin.statusLabels.${s.status}`)) || [],
        datasets: [{
            label: t('admin.orders'),
            data: stats?.order_status?.map(s => Number(s.count)) || [],
            backgroundColor: stats?.order_status?.map(s => statusColors[s.status] || '#999') || [],
            borderRadius: 8,
            barThickness: 30
        }]
    };

    // 5. Top 5 Products (Horizontal Bar)
    const topProductsData = {
        labels: stats?.top_products?.map(p => p.name).slice(0, 5) || [],
        datasets: [{
            label: t('admin.sold'),
            data: stats?.top_products?.map(p => Number(p.total_sold)).slice(0, 5) || [],
            backgroundColor: '#E31E24',
            borderRadius: 5,
            barThickness: 20
        }]
    };

    const commonBarOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f5f5f5' } },
            x: { grid: { display: false } }
        }
    };

    const horizontalBarOptions = {
        ...commonBarOptions,
        indexAxis: 'y',
        scales: {
            x: { beginAtZero: true, grid: { display: false } },
            y: { grid: { display: false }, ticks: { font: { size: 10 } } }
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header with Date Filter */}
            <div className="dashboard-header-row">
                <div className="dashboard-header">
                    <h1>{t('admin.dashboard')}</h1>
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

            {/* 5 KPI Cards */}
            <div className="stats-grid-5">
                <div className="stat-card revenue clickable" onClick={() => handleCardClick('/admin/reports')}>
                    <h3>💰 {t('admin.revenue')}</h3>
                    <p className="stat-value">{formatPrice(stats?.revenue || 0)}</p>
                    <p className="stat-change positive">↑ 12.5% <span style={{color:'#999', fontWeight:400, fontSize:'11px'}}>vs kỳ trước</span></p>
                </div>
                <div className="stat-card orders clickable" onClick={() => handleCardClick('/admin/orders')}>
                    <h3>🛒 {t('admin.orders')}</h3>
                    <p className="stat-value">{stats?.order_count || 0}</p>
                    <p className="stat-change positive">↑ 8.3%</p>
                </div>
                <div className="stat-card aov">
                    <h3>💵 {t('admin.avgOrderValue')}</h3>
                    <p className="stat-value">{formatPrice(stats?.avg_order_value || 0)}</p>
                    <p className="stat-change positive">↑ 3.2%</p>
                </div>
                <div className="stat-card return-rate">
                    <h3>↩️ {t('admin.returnRate')}</h3>
                    <p className="stat-value">{(stats?.return_rate || 0).toFixed(1)}%</p>
                    <p className="stat-change negative">↓ 1.5%</p>
                </div>
                <div className="stat-card alerts clickable" onClick={() => handleCardClick('/admin/inventory')}>
                    <h3>⚠️ {t('admin.inventoryAlerts')}</h3>
                    <p className="stat-value">{stats?.inventory_alert_count || 0}</p>
                    <p className="stat-change" style={{color: '#636e72'}}>Cần kiểm tra</p>
                </div>
            </div>

            {/* Main Charts Section */}
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
                    <h3>👕 {t('admin.categoryRevenue')}</h3>
                    <div className="chart-container">
                        {stats?.revenue_by_category?.length > 0 ? (
                            <Doughnut data={categoryRevenueData} options={categoryOptions} />
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">👗</div>
                                <p>{t('admin.noSalesData')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Secondary Charts Section */}
            <div className="charts-section" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="chart-card">
                    <h3>📦 {t('admin.stockStatus')}</h3>
                    <div className="chart-container">
                        <Bar data={stockStatusData} options={commonBarOptions} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>📋 {t('admin.orderStatus')}</h3>
                    <div className="chart-container">
                        {stats?.order_status?.length > 0 ? (
                            <Bar data={orderStatusBarData} options={commonBarOptions} />
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
                            <Bar data={topProductsData} options={horizontalBarOptions} />
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