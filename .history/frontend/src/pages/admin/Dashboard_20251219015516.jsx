import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
    FaShoppingBag, FaMoneyBillWave, FaUsers, FaBoxOpen, 
    FaArrowUp, FaArrowDown, FaCalendarAlt, FaEllipsisH
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

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Giả lập data nếu API chưa sẵn sàng hoặc fetch thật
                const response = await api.get(`/admin/stats.php?range=${dateRange}`);
                setStats(response.data);
            } catch (error) {
                console.error("Fetch error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [dateRange]);

    // --- CHART STYLING FUNCTIONS ---
    const createGradient = (context, colorStart, colorEnd) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    };

    const formatPrice = (price) => Number(price).toLocaleString('vi-VN') + ' đ';

    if (loading) return <div className="dashboard-loading"><div className="spinner"></div></div>;

    // --- CHART DATA & OPTIONS ---

    // 1. Main Revenue Chart (Smooth Curve + Gradient like sample)
    const revenueData = {
        labels: stats?.daily_revenue?.map(d => new Date(d.date).getDate() + '/' + (new Date(d.date).getMonth() + 1)) || [],
        datasets: [{
            label: 'Doanh thu',
            data: stats?.daily_revenue?.map(d => d.revenue) || [],
            borderColor: '#3B82F6', // Blue like the Hospital sample
            backgroundColor: (context) => createGradient(context, 'rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.0)'),
            borderWidth: 3,
            fill: true,
            tension: 0.45, // Siêu mượt (Spline)
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#FFFFFF',
            pointBorderColor: '#3B82F6',
            pointBorderWidth: 2,
        }]
    };

    const mainChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1F2937',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 13, weight: 'bold' },
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (ctx) => `${formatPrice(ctx.raw)}`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#9CA3AF', font: { size: 11 } }
            },
            y: {
                border: { display: false },
                grid: { color: '#F3F4F6', borderDash: [5, 5] },
                ticks: { 
                    color: '#9CA3AF', 
                    callback: (value) => value >= 1000000 ? `${value/1000000}M` : value 
                }
            }
        }
    };

    // 2. Bar Chart (Rounded bars)
    const barData = {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], // Giả lập ngày trong tuần
        datasets: [
            {
                label: 'Đơn hàng',
                data: [12, 19, 15, 25, 22, 30, 28], // Dữ liệu mẫu nếu stats thiếu
                backgroundColor: '#10B981',
                borderRadius: 4,
                barThickness: 16,
            },
            {
                label: 'Khách cũ',
                data: [8, 12, 10, 15, 18, 20, 24],
                backgroundColor: '#3B82F6',
                borderRadius: 4,
                barThickness: 16,
            }
        ]
    };

    // 3. Doughnut (Ring style)
    const doughnutData = {
        labels: stats?.revenue_by_category?.map(c => c.category) || [],
        datasets: [{
            data: stats?.revenue_by_category?.map(c => c.revenue) || [],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
            borderWidth: 0,
        }]
    };
    
    const doughnutOptions = {
        cutout: '75%',
        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
    };

    // --- COMPONENTS ---
    const StatCard = ({ title, value, icon, variant, trendValue, trendDir, onClick }) => (
        <div className={`stat-card variant-${variant}`} onClick={onClick} style={{cursor: onClick ? 'pointer' : 'default'}}>
            <div className="card-header-flex">
                <div className="stat-info">
                    <p className="stat-title">{title}</p>
                    <h3>{value}</h3>
                </div>
                <div className="stat-icon-bg">
                    {icon}
                </div>
            </div>
            <div className="stat-footer">
                <span className={`trend-badge ${trendDir === 'up' ? 'trend-up' : 'trend-down'}`}>
                    {trendDir === 'up' ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                    {trendValue}
                </span>
                <span style={{color: '#9CA3AF', fontWeight: 400}}>so với hôm qua</span>
            </div>
        </div>
    );

    return (
        <div className="dashboard-wrapper">
            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1>{t('admin.dashboard')}</h1>
                    <p className="subtitle">Chào mừng trở lại, đây là báo cáo hôm nay.</p>
                </div>
                <div className="date-filter-group">
                    {['today', '7days', '30days'].map(range => (
                        <button 
                            key={range}
                            className={`filter-btn ${dateRange === range ? 'active' : ''}`}
                            onClick={() => setDateRange(range)}
                        >
                            {range === 'today' ? 'Hôm nay' : range === '7days' ? 'Tuần này' : 'Tháng này'}
                        </button>
                    ))}
                    <button className="filter-btn"><FaCalendarAlt /></button>
                </div>
            </header>

            {/* Stats Cards - Colored Variants */}
            <div className="stats-grid">
                <StatCard 
                    title="Doanh thu"
                    value={formatPrice(stats?.revenue || 0)}
                    icon={<FaMoneyBillWave />}
                    variant="yellow"
                    trendValue="12.5%" trendDir="up"
                />
                <StatCard 
                    title="Đơn hàng mới"
                    value={stats?.order_count || 0}
                    icon={<FaShoppingBag />}
                    variant="red"
                    trendValue="8.2%" trendDir="down"
                />
                <StatCard 
                    title="Khách hàng"
                    value={stats?.user_count || 150}
                    icon={<FaUsers />}
                    variant="blue"
                    trendValue="2.4%" trendDir="up"
                />
                <StatCard 
                    title="Sản phẩm tồn kho"
                    value={stats?.product_count || 320}
                    icon={<FaBoxOpen />}
                    variant="green"
                    trendValue="Ổn định" trendDir="up"
                />
            </div>

            {/* Main Charts Area */}
            <div className="charts-grid-main">
                <div className="chart-box">
                    <div className="chart-header">
                        <h3>Biểu đồ doanh thu</h3>
                        <FaEllipsisH style={{color: '#9CA3AF', cursor: 'pointer'}} />
                    </div>
                    <div className="chart-container-lg">
                        <Line data={revenueData} options={mainChartOptions} />
                    </div>
                </div>

                <div className="chart-box">
                    <div className="chart-header">
                        <h3>Top Sản Phẩm</h3>
                    </div>
                    <div className="top-products-list">
                        {stats?.top_products?.slice(0, 5).map((p, i) => (
                            <div key={i} className="top-product-item">
                                <div className="prod-icon">
                                    {p.name.charAt(0)}
                                </div>
                                <div className="prod-info">
                                    <span className="prod-name">{p.name}</span>
                                    <span className="prod-sub">Đã bán: {p.total_sold}</span>
                                </div>
                                <span className="prod-value">{formatPrice(p.revenue)}</span>
                            </div>
                        ))}
                         {(!stats?.top_products || stats.top_products.length === 0) && 
                            <p style={{textAlign: 'center', color: '#9CA3AF', marginTop: 20}}>Chưa có dữ liệu</p>
                        }
                    </div>
                </div>
            </div>

            {/* Secondary Charts */}
            <div className="charts-grid-secondary">
                <div className="chart-box">
                    <h3>Thống kê đơn hàng</h3>
                    <div className="chart-container-sm" style={{marginTop: 20}}>
                         <Bar data={barData} options={{...mainChartOptions, plugins: {legend: {display: false}}}} />
                    </div>
                </div>
                <div className="chart-box">
                    <h3>Phân loại danh mục</h3>
                    <div className="chart-container-sm" style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
                <div className="chart-box">
                    <h3>Ghi chú nhanh</h3>
                    <div style={{color: '#6B7280', fontSize: 14, marginTop: 10, lineHeight: 1.6}}>
                        <p>• Kiểm tra đơn hàng hoàn trả.</p>
                        <p>• Nhập thêm hàng cho danh mục Điện tử.</p>
                        <p>• Cập nhật banner khuyến mãi tháng 12.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;