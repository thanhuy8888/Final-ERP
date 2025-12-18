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
    FaCalendarAlt,
    FaChartLine,
    FaTrophy,
    FaBoxOpen
} from 'react-icons/fa';
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

    const createGradient = (ctx, colorStart, colorEnd) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">{t('admin.loading')}</div>
                    <div className="loading-subtext">Đang tải dữ liệu dashboard...</div>
                </div>
            </div>
        );
    }

    const formatPrice = (price) => Number(price).toLocaleString('vi-VN') + t('common.currency');

    // --- ENHANCED CHART CONFIGURATIONS ---

    const revenueData = {
        labels: stats?.daily_revenue?.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }) || [],
        datasets: [{
            label: t('admin.revenue'),
            data: stats?.daily_revenue?.map(d => Number(d.revenue)) || [],
            borderColor: '#FF4757',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 350);
                gradient.addColorStop(0, 'rgba(255, 71, 87, 0.3)');
                gradient.addColorStop(0.5, 'rgba(255, 71, 87, 0.1)');
                gradient.addColorStop(1, 'rgba(255, 71, 87, 0)');
                return gradient;
            },
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#FF4757',
            pointBorderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: '#FF4757',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 3,
        }]
    };

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#fff',
                bodyColor: '#fff',
                titleFont: {
                    size: 13,
                    weight: '600',
                    family: "'Poppins', sans-serif"
                },
                bodyFont: {
                    size: 12,
                    family: "'Inter', sans-serif"
                },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: (context) => {
                        const label = context.dataset.label || '';
                        const value = Number(context.raw).toLocaleString('vi-VN');
                        return ` ${label}: ${value}`;
                    }
                }
            }
        },
        scales: {
            y: {
                border: { display: false },
                grid: { 
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                    drawTicks: false
                },
                ticks: { 
                    font: { 
                        size: 11, 
                        family: "'Inter', sans-serif",
                        weight: '500'
                    }, 
                    color: 'rgba(255, 255, 255, 0.6)',
                    padding: 10,
                    callback: function(value) {
                        if (value >= 1000000) {
                            return (value / 1000000) + 'M';
                        } else if (value >= 1000) {
                            return (value / 1000) + 'K';
                        }
                        return value;
                    }
                }
            },
            x: {
                border: { display: false },
                grid: { display: false },
                ticks: { 
                    font: { 
                        size: 11, 
                        family: "'Inter', sans-serif",
                        weight: '500'
                    }, 
                    color: 'rgba(255, 255, 255, 0.6)',
                    padding: 10
                }
            }
        }
    };

    const categoryData = {
        labels: stats?.revenue_by_category?.map(c => c.category) || [],
        datasets: [{
            data: stats?.revenue_by_category?.map(c => Number(c.revenue)) || [],
            backgroundColor: [
                '#FF4757',
                '#5F27CD',
                '#FFA502',
                '#1DD1A1',
                '#54A0FF',
                '#FF6B81',
            ],
            borderWidth: 0,
            hoverOffset: 20,
            hoverBorderColor: '#fff',
            hoverBorderWidth: 3
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'right',
                labels: { 
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: { 
                        size: 13,
                        family: "'Inter', sans-serif",
                        weight: '500'
                    },
                    color: 'rgba(255, 255, 255, 0.8)',
                    generateLabels: (chart) => {
                        const data = chart.data;
                        return data.labels.map((label, i) => ({
                            text: label,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            hidden: false,
                            index: i
                        }));
                    }
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#fff',
                bodyColor: '#fff',
                titleFont: {
                    size: 13,
                    weight: '600',
                    family: "'Poppins', sans-serif"
                },
                bodyFont: {
                    size: 12,
                    family: "'Inter', sans-serif"
                },
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => {
                        const value = Number(context.raw).toLocaleString('vi-VN');
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return ` ${value} VNĐ (${percentage}%)`;
                    }
                }
            }
        }
    };

    const barChartOptions = {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            legend: { display: false }
        },
        scales: {
            ...commonOptions.scales,
            x: {
                ...commonOptions.scales.x,
                grid: { display: false }
            }
        },
        borderRadius: 8,
        barThickness: 32,
    };

    const stockData = {
        labels: [t('admin.lowStockItems'), t('admin.highStockItems'), t('admin.totalSKU')],
        datasets: [{
            label: t('admin.quantity'),
            data: [stats?.inventory_alert_count || 0, stats?.high_stock_count || 0, stats?.product_count || 0],
            backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(99, 102, 241, 0.8)'
            ],
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    const orderStatusData = {
        labels: stats?.order_status?.map(s => t(`admin.statusLabels.${s.status}`)) || [],
        datasets: [{
            label: t('admin.orders'),
            data: stats?.order_status?.map(s => Number(s.count)) || [],
            backgroundColor: stats?.order_status?.map(s => {
                switch(s.status) {
                    case 'completed': return 'rgba(34, 197, 94, 0.8)';
                    case 'cancelled': return 'rgba(239, 68, 68, 0.8)';
                    case 'pending': return 'rgba(251, 191, 36, 0.8)';
                    default: return 'rgba(99, 102, 241, 0.8)';
                }
            }),
            borderRadius: 8,
            borderSkipped: false,
        }]
    };

    const StatCard = ({ title, value, subtext, icon, gradient, onClick, trend }) => (
        <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
            <div className="stat-card-inner" style={{ background: gradient }}>
                <div className="stat-icon-wrapper">
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
        </div>
    );

    return (
        <div className="dashboard-wrapper">
            {/* Animated Background */}
            <div className="dashboard-bg">
                <div className="bg-gradient-1"></div>
                <div className="bg-gradient-2"></div>
                <div className="bg-gradient-3"></div>
            </div>

            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="header-icon">
                        <FaChartLine />
                    </div>
                    <div>
                        <h1>{t('admin.dashboard')}</h1>
                        <p className="subtitle">{t('admin.overview')}</p>
                    </div>
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
                    gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    onClick={() => navigate('/admin/reports')}
                />
                <StatCard 
                    title={t('admin.orders')} 
                    value={stats?.order_count || 0}
                    subtext="8.3% vs kỳ trước"
                    icon={<FaShoppingBag />} 
                    gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    onClick={() => navigate('/admin/orders')}
                />
                <StatCard 
                    title={t('admin.avgOrderValue')} 
                    value={formatPrice(stats?.avg_order_value || 0)}
                    subtext="3.2% vs kỳ trước"
                    icon={<FaClipboardList />} 
                    gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                />
                <StatCard 
                    title={t('admin.returnRate')} 
                    value={`${(stats?.return_rate || 0).toFixed(1)}%`}
                    subtext="1.5% vs kỳ trước"
                    trend="down"
                    icon={<FaExchangeAlt />} 
                    gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                />
                <StatCard 
                    title={t('admin.inventoryAlerts')} 
                    value={stats?.inventory_alert_count || 0}
                    subtext="Cần xử lý ngay"
                    trend="down"
                    icon={<FaExclamationTriangle />} 
                    gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                    onClick={() => navigate('/admin/inventory')}
                />
            </div>

            {/* Main Charts Area */}
            <div className="charts-grid-main">
                <div className="chart-box large">
                    <div className="chart-header">
                        <div>
                            <h3>{t('admin.revenueChart')}</h3>
                            <p className="chart-subtitle">Theo dõi doanh thu theo ngày</p>
                        </div>
                        <div className="chart-badge">
                            <FaChartLine />
                            <span>Tăng trưởng</span>
                        </div>
                    </div>
                    <div className="chart-container-lg">
                        <Line data={revenueData} options={commonOptions} />
                    </div>
                </div>
                <div className="chart-box medium">
                    <div className="chart-header">
                        <div>
                            <h3>{t('admin.categoryRevenue')}</h3>
                            <p className="chart-subtitle">Phân bổ theo danh mục</p>
                        </div>
                    </div>
                    <div className="chart-container-lg">
                        <Doughnut data={categoryData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Secondary Charts Area */}
            <div className="charts-grid-secondary">
                <div className="chart-box">
                    <div className="chart-header">
                        <div>
                            <h3><FaBoxOpen className="inline-icon" /> {t('admin.stockStatus')}</h3>
                            <p className="chart-subtitle">Tình trạng kho hàng</p>
                        </div>
                    </div>
                    <div className="chart-container-sm">
                        <Bar data={stockData} options={barChartOptions} />
                    </div>
                </div>
                <div className="chart-box">
                    <div className="chart-header">
                        <div>
                            <h3><FaClipboardList className="inline-icon" /> {t('admin.orderStatus')}</h3>
                            <p className="chart-subtitle">Trạng thái đơn hàng</p>
                        </div>
                    </div>
                    <div className="chart-container-sm">
                        <Bar data={orderStatusData} options={barChartOptions} />
                    </div>
                </div>
                <div className="chart-box">
                    <div className="chart-header">
                        <div>
                            <h3><FaTrophy className="inline-icon" /> Top 5 {t('admin.topProducts')}</h3>
                            <p className="chart-subtitle">Sản phẩm bán chạy nhất</p>
                        </div>
                    </div>
                    <div className="top-products-list">
                        {stats?.top_products?.slice(0, 5).map((p, i) => (
                            <div key={i} className="top-product-item">
                                <span className={`rank rank-${i+1}`}>
                                    {i === 0 && <FaTrophy />}
                                    {i !== 0 && (i+1)}
                                </span>
                                <div className="prod-info">
                                    <span className="prod-name">{p.name}</span>
                                    <span className="prod-sales">{p.total_sold} {t('admin.sold')}</span>
                                </div>
                                <div className="prod-bar">
                                    <div 
                                        className="prod-bar-fill"
                                        style={{width: `${(p.total_sold / stats.top_products[0].total_sold) * 100}%`}}
                                    ></div>
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