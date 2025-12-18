import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { Line, Doughnut } from 'react-chartjs-2';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

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
                // Giả lập dữ liệu nếu API chưa sẵn sàng (để bạn thấy giao diện)
                // Xóa dòng này khi chạy thật
                // const mockData = { ... }; 
                
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

    const formatPrice = (price) => Number(price).toLocaleString('vi-VN') + ' đ';

    // 1. Cấu hình biểu đồ "Total Earning" (Giống hình mẫu: Đường cong mềm, Gradient đỏ)
    const revenueChartData = useMemo(() => ({
        labels: stats?.daily_revenue?.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }) || [],
        datasets: [{
            label: 'Doanh thu',
            data: stats?.daily_revenue?.map(d => Number(d.revenue)) || [],
            fill: true, // Quan trọng: Để hiện màu nền dưới đường
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(227, 30, 36, 0.2)'); // Màu đỏ nhạt
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                return gradient;
            },
            borderColor: '#E31E24',
            borderWidth: 4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#E31E24',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8,
            tension: 0.4, // Độ cong mềm mại
        }]
    }), [stats]);

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1b2559',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 14, weight: 'bold' },
                displayColors: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { borderDash: [5, 5], color: '#F3F4F6', drawBorder: false },
                ticks: { display: false } // Ẩn số trục Y cho sạch giống mẫu
            },
            x: {
                grid: { display: false },
                ticks: { color: '#A3AED0', font: { size: 11 } }
            }
        }
    };

    // 2. Cấu hình biểu đồ tròn (Category)
    const categoryData = useMemo(() => ({
        labels: stats?.revenue_by_category?.map(c => c.category) || [],
        datasets: [{
            data: stats?.revenue_by_category?.map(c => Number(c.revenue)) || [],
            backgroundColor: ['#4318FF', '#6AD2FF', '#E31E24', '#EFF4FB'],
            borderWidth: 0,
            hoverOffset: 5,
        }]
    }), [stats]);

    if (loading) return <div className="dashboard-loading"><div className="loading-spinner"></div>Loading...</div>;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.div 
            className="dashboard-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <div className="dashboard-header-row">
                <div className="dashboard-header">
                    <p>Hi, Admin</p>
                    <h1>Dashboard Overview</h1>
                </div>
                <div className="date-filter">
                    {['today', '7days', '30days'].map((range) => (
                        <button 
                            key={range}
                            className={dateRange === range ? 'active' : ''}
                            onClick={() => setDateRange(range)}
                        >
                            {range === 'today' ? 'Hôm nay' : range === '7days' ? 'Tuần này' : 'Tháng này'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards Section */}
            <div className="stats-grid-5">
                <StatCard 
                    title="Doanh thu" 
                    value={formatPrice(stats?.revenue || 0)} 
                    change="+12.5%" 
                    icon={<i className="fas fa-dollar-sign"></i>} 
                />
                <StatCard 
                    title="Đơn hàng" 
                    value={stats?.order_count || 0} 
                    change="+8.2%" 
                    icon={<i className="fas fa-shopping-cart"></i>} 
                />
                {/* Thẻ này làm nổi bật giống thẻ màu đỏ trong ảnh */}
                <StatCard 
                    title="Khách hàng mới" 
                    value="3,568" 
                    change="+2.4%" 
                    icon={<i className="fas fa-user"></i>}
                    isHighlight={true} 
                />
                <StatCard 
                    title="Tồn kho báo động" 
                    value={stats?.inventory_alert_count || 0} 
                    change="Cần xử lý" 
                    isNegative 
                    icon={<i className="fas fa-exclamation-triangle"></i>} 
                    onClick={() => navigate('/admin/inventory')}
                />
            </div>

            {/* Main Content: Chart & List */}
            <div className="dashboard-main-section">
                
                {/* Left: Big Chart (Total Earning) */}
                <motion.div className="chart-card" whileHover={{ y: -2 }}>
                    <div className="card-header">
                        <div>
                            <h3>${Number(stats?.revenue || 0).toLocaleString()}</h3>
                            <p style={{color: '#A3AED0', margin: 0, fontSize: '14px'}}>Tổng thu nhập</p>
                        </div>
                        <button className="view-all-btn" onClick={() => navigate('/admin/reports')}>
                            <i className="fas fa-chart-bar"></i> Báo cáo
                        </button>
                    </div>
                    <div className="chart-container" style={{height: '350px'}}>
                        <Line data={revenueChartData} options={revenueChartOptions} />
                    </div>
                </motion.div>

                {/* Right: Top Products List (Style like "Recent Sales") */}
                <motion.div className="chart-card" whileHover={{ y: -2 }}>
                    <div className="card-header">
                        <h3>Sản phẩm bán chạy</h3>
                        <button className="view-all-btn">Xem tất cả</button>
                    </div>
                    
                    <div className="list-container">
                        {stats?.top_products?.slice(0, 5).map((product, index) => (
                            <div className="list-item" key={index}>
                                <div className="item-info">
                                    {/* Placeholder ảnh nếu không có ảnh thật */}
                                    <img 
                                        src={product.image || `https://ui-avatars.com/api/?name=${product.name}&background=random`} 
                                        alt={product.name} 
                                        className="item-avatar" 
                                    />
                                    <div className="item-text">
                                        <h4>{product.name}</h4>
                                        <span>{product.category || 'Mobile'}</span>
                                    </div>
                                </div>
                                <div style={{textAlign: 'right'}}>
                                    <div className="item-value">{product.total_sold} đã bán</div>
                                    <span className={`status-badge ${index % 2 === 0 ? 'mobile' : 'tablet'}`}>
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Fallback nếu không có dữ liệu để demo giao diện */}
                        {(!stats?.top_products || stats.top_products.length === 0) && (
                            <>
                                <MockListItem name="iPhone 13 Pro" cat="Mobile" price="25.000.000đ" sold="1,200" />
                                <MockListItem name="Macbook Air M1" cat="Laptop" price="19.000.000đ" sold="850" />
                                <MockListItem name="Samsung S22" cat="Mobile" price="15.000.000đ" sold="600" />
                                <MockListItem name="iPad Pro 11" cat="Tablet" price="21.000.000đ" sold="430" />
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row: Secondary Charts */}
            <div className="dashboard-main-section" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="chart-card">
                    <div className="card-header"><h3>Danh mục</h3></div>
                    <div className="chart-container" style={{height: '200px'}}>
                        <Doughnut data={categoryData} options={{ maintainAspectRatio: false, cutout: '75%' }} />
                    </div>
                </div>
                {/* Bạn có thể thêm các chart khác ở đây */}
            </div>

        </motion.div>
    );
};

// Component con: KPI Card
const StatCard = ({ title, value, change, icon, onClick, isNegative, isHighlight }) => (
    <div 
        className={`stat-card ${isHighlight ? 'highlight-card' : ''}`} 
        onClick={onClick} 
        style={{cursor: onClick ? 'pointer' : 'default'}}
    >
        <div className="stat-header">
            <div className="icon-box">
                {icon}
            </div>
            {/* Nếu là thẻ highlight thì ẩn change hoặc đổi màu, ở đây ta giữ đơn giản */}
        </div>
        <div>
            <h3>{title}</h3>
            <div className="stat-value">{value}</div>
            <div className="stat-footer">
                <span className={`stat-change ${isNegative ? 'negative' : 'positive'}`} style={isHighlight ? {color: 'white'} : {}}>
                    {change}
                </span>
                <span className="stat-label" style={isHighlight ? {color: 'rgba(255,255,255,0.7)'} : {}}>so với tháng trước</span>
            </div>
        </div>
    </div>
);

// Component giả lập item danh sách để demo
const MockListItem = ({ name, cat, price, sold }) => (
    <div className="list-item">
        <div className="item-info">
            <img src={`https://ui-avatars.com/api/?name=${name}&background=random&color=fff`} className="item-avatar" alt="" />
            <div className="item-text">
                <h4>{name}</h4>
                <span>{cat}</span>
            </div>
        </div>
        <div style={{textAlign: 'right'}}>
            <div className="item-value">{sold} sold</div>
            <span className="status-badge mobile">{price}</span>
        </div>
    </div>
);

export default AdminDashboard;