import { useEffect, useState, useRef } from 'react';
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
import { 
    FaShoppingBag, 
    FaMoneyBillWave, 
    FaClipboardList, 
    FaExchangeAlt, 
    FaExclamationTriangle,
    FaArrowUp,
    FaArrowDown,
    FaCalendarAlt
} from 'react-icons/fa'; // Import icons
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import './Dashboard.css';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, 
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const AdminDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7days');
    const chartRef = useRef(null);

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

    // Tạo Gradient cho biểu đồ
    const createGradient = (ctx, colorStart, colorEnd) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>{t('admin.loading')}</p>
            </div>
        );
    }

    const formatPrice = (price) => Number(price).toLocaleString('vi-VN') + t('common.currency');

    // --- CHART CONFIGURATIONS ---

    // 1. Revenue Chart (Line with Gradient)
    const revenueData = {
        labels: stats?.daily_revenue?.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }) || [],
        datasets: [{
            label: t('admin.revenue'),
            data: stats?.daily_revenue?.map(d => Number(d.revenue)) || [],
            borderColor: '#E11D2A',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                return createGradient(ctx, 'rgba(225, 29, 42, 0.4)', 'rgba(225, 29, 42, 0.0)');
            },
            borderWidth: 3,
            fill: true,
            tension: 0.4, // Smooth curve
            pointBackgroundColor: '#fff',
            pointBorderColor: '#E11D2A',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                boxPadding: 4,
                usePointStyle: true,
                callbacks: {
                    label: (context) => ` ${context.dataset.label}: ${Number(context.raw).toLocaleString('vi-VN')}`
                }
            }
        },
        scales: {
            y: {
                border: { dash: [4, 4], display: false },
                grid: { color: '#f3f4f6', drawBorder: false },
                ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: '#6b7280' }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 11, family: "'Inter', sans-serif" }, color: '#6b7280' }
            }
        }
    };

    // 2. Category Doughnut
    const categoryData = {
        labels: stats?.revenue_by_category?.map(c => c.category) || [],
        datasets: [{
            data: stats?.revenue_by_category?.map(c => Number(c.revenue)) || [],
            backgroundColor: ['#E11D2A', '#1E3A8A', '#F59E0B', '#10B981', '#6366F1'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
        }]
    };

    const doughnutOptions = {
        ...commonOptions,
        cutout: '75%', // Make it a thin ring
        plugins: {
            legend: {
                position: 'right',
                labels: { usePointStyle: true, padding: 20, font: { size: 12 } }
            }
        },
        scales: { x: { display: false }, y: { display: false } }
    };

    // 3. Status & Stock Bar Charts
    const barChartOptions = {
        ...commonOptions,
        borderRadius: 6, // Rounded bars
        barThickness: 24,
    };

    const stockData = {
        labels: [t('admin.lowStockItems'), t('admin.highStockItems'), t('admin.totalSKU')],
        datasets: [{
            label: t('admin.quantity'),
            data: [stats?.inventory_alert_count || 0, stats?.high_stock_count || 0, stats?.product_count || 0],
            backgroundColor: ['#EF4444', '#3B82F6', '#9CA3AF'],
        }]
    };

    const orderStatusData = {
        labels: stats?.order_status?.map(s => t(`admin.statusLabels.${s.status}`)) || [],
        datasets: [{
            label: t('admin.orders'),
            data: stats?.order_status?.map(s => Number(s.count)) || [],
            backgroundColor: stats?.order_status?.map(s => {
                switch(s.status) {
                    case 'completed': return '#10B981';
                    case 'cancelled': return '#EF4444';
                    case 'pending': return '#F59E0B';
                    default: return '#6366F1';
                }
            })
        }]
    };

    // --- COMPONENTS ---
    
    const StatCard = ({ title, value, subtext, icon, color, onClick, trend }) => (
        <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
            <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}20`, color: color }}>
                {icon}
            </div>
            <div className="stat-content">
                <p className="stat-title">{title}</p>
                <h3 className="stat-value">{value}</h3>
                {subtext && (
                    <div className={`stat-trend ${trend === 'down' ? 'trend-down' : 'trend-up'}`}>
                        {trend === 'down' ? <FaArrowDown /> : <FaArrowUp />}
                        <span>{subtext}</span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="dashboard-wrapper">
            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1>{t('admin.dashboard')}</h1>
                    <p className="subtitle">{t('admin.overview')}</p>
                </div>
                <div className="date-filter-group">
                    <FaCalendarAlt className="calendar-icon" />
                    {['today', '7days', '30days'].map(range => (
                        <button 
                            key={range}
                            className={`filter-btn ${dateRange === range ? 'active' : ''}`}
                            onClick={() => setDateRange(range)}
                        >
                            {range === 'today' ? 'Hôm nay' : range === '7days' ? '7 Ngày' : '30 Ngày'}
                        </button>
                    ))}
                </div>
            </header>

            {/* Stats Overview */}
            <div className="stats-grid">
                <StatCard 
                    title={t('admin.revenue')} 
                    value={formatPrice(stats?.revenue || 0)} 
                    subtext="12.5% vs kỳ trước"
                    icon={<FaMoneyBillWave />} 
                    color="#E11D2A"
                    onClick={() => navigate('/admin/reports')}
                />
                <StatCard 
                    title={t('admin.orders')} 
                    value={stats?.order_count || 0}
                    subtext="8.3% vs kỳ trước"
                    icon={<FaShoppingBag />} 
                    color="#2563EB"
                    onClick={() => navigate('/admin/orders')}
                />
                 <StatCard 
                    title={t('admin.avgOrderValue')} 
                    value={formatPrice(stats?.avg_order_value || 0)}
                    subtext="3.2% vs kỳ trước"
                    icon={<FaClipboardList />} 
                    color="#7C3AED"
                />
                <StatCard 
                    title={t('admin.returnRate')} 
                    value={`${(stats?.return_rate || 0).toFixed(1)}%`}
                    subtext="1.5% vs kỳ trước"
                    trend="down"
                    icon={<FaExchangeAlt />} 
                    color="#F59E0B"
                />
                <StatCard 
                    title={t('admin.inventoryAlerts')} 
                    value={stats?.inventory_alert_count || 0}
                    subtext="Cần xử lý ngay"
                    trend="down"
                    icon={<FaExclamationTriangle />} 
                    color="#DC2626"
                    onClick={() => navigate('/admin/inventory')}
                />
            </div>

            {/* Main Charts Area */}
            <div className="charts-grid-main">
                <div className="chart-box large">
                    <div className="chart-header">
                        <h3>{t('admin.revenueChart')}</h3>
                    </div>
                    <div className="chart-container-lg">
                        <Line data={revenueData} options={commonOptions} />
                    </div>
                </div>
                <div className="chart-box medium">
                    <div className="chart-header">
                        <h3>{t('admin.categoryRevenue')}</h3>
                    </div>
                    <div className="chart-container-lg">
                        <Doughnut data={categoryData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Secondary Charts Area */}
            <div className="charts-grid-secondary">
                <div className="chart-box">
                    <h3>{t('admin.stockStatus')}</h3>
                    <div className="chart-container-sm">
                        <Bar data={stockData} options={barChartOptions} />
                    </div>
                </div>
                <div className="chart-box">
                    <h3>{t('admin.orderStatus')}</h3>
                    <div className="chart-container-sm">
                        <Bar data={orderStatusData} options={barChartOptions} />
                    </div>
                </div>
                <div className="chart-box">
                    <h3>Top 5 {t('admin.topProducts')}</h3>
                    <div className="top-products-list">
                        {stats?.top_products?.slice(0, 5).map((p, i) => (
                            <div key={i} className="top-product-item">
                                <span className={`rank rank-${i+1}`}>{i+1}</span>
                                <div className="prod-info">
                                    <span className="prod-name">{p.name}</span>
                                    <span className="prod-sales">{p.total_sold} {t('admin.sold')}</span>
                                </div>
                                <div className="prod-bar">
                                    <div style={{width: `${(p.total_sold / stats.top_products[0].total_sold) * 100}%`}}></div>
                                </div>
                            </div>
                        ))}
                        {(!stats?.top_products || stats.top_products.length === 0) && (
                            <p className="no-data">{t('admin.noSalesData')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;