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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

    const formatPrice = (price) => Number(price).toLocaleString('vi-VN') + t('common.currency');

    // Chart Configurations
    const revenueChartData = useMemo(() => ({
        labels: stats?.daily_revenue?.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }) || [],
        datasets: [{
            label: t('admin.revenue'),
            data: stats?.daily_revenue?.map(d => Number(d.revenue)) || [],
            fill: true,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(227, 30, 36, 0.2)');
                gradient.addColorStop(1, 'rgba(227, 30, 36, 0)');
                return gradient;
            },
            borderColor: '#E31E24',
            borderWidth: 3,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#E31E24',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
        }]
    }), [stats, t]);

    const categoryData = useMemo(() => ({
        labels: stats?.revenue_by_category?.map(c => c.category) || [],
        datasets: [{
            data: stats?.revenue_by_category?.map(c => Number(c.revenue)) || [],
            backgroundColor: ['#4318FF', '#6AD2FF', '#EFF4FB'],
            hoverOffset: 10,
            borderWidth: 0,
        }]
    }), [stats]);

    if (loading) return (
        <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <span>{t('admin.loading')}</span>
        </div>
    );

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <motion.div 
            className="dashboard-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <div className="dashboard-header-row">
                <div className="dashboard-header">
                    <h1>📊 {t('admin.dashboard')}</h1>
                    <p>{t('admin.overview_subtitle') || 'Chào mừng trở lại, đây là tình hình kinh doanh của bạn.'}</p>
                </div>
                <div className="date-filter">
                    {['today', '7days', '30days'].map((range) => (
                        <button 
                            key={range}
                            className={dateRange === range ? 'active' : ''}
                            onClick={() => setDateRange(range)}
                        >
                            {range === 'today' ? 'Hôm nay' : range === '7days' ? '7 Ngày' : '30 Ngày'}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid-5">
                <StatCard 
                    variants={itemVariants}
                    title={t('admin.revenue')} 
                    value={formatPrice(stats?.revenue || 0)} 
                    change="+12.5%" 
                    icon="💰" 
                    onClick={() => navigate('/admin/reports')}
                />
                <StatCard 
                    variants={itemVariants}
                    title={t('admin.orders')} 
                    value={stats?.order_count || 0} 
                    change="+8.2%" 
                    icon="🛒" 
                    onClick={() => navigate('/admin/orders')}
                />
                <StatCard 
                    variants={itemVariants}
                    title={t('admin.avgOrderValue')} 
                    value={formatPrice(stats?.avg_order_value || 0)} 
                    change="+3.2%" 
                    icon="💵" 
                />
                <StatCard 
                    variants={itemVariants}
                    title={t('admin.returnRate')} 
                    value={`${(stats?.return_rate || 0).toFixed(1)}%`} 
                    change="-1.5%" 
                    isNegative 
                    icon="↩️" 
                />
                <StatCard 
                    variants={itemVariants}
                    title={t('admin.inventoryAlerts')} 
                    value={stats?.inventory_alert_count || 0} 
                    change="Cần xử lý" 
                    icon="⚠️" 
                    onClick={() => navigate('/admin/inventory')}
                />
            </div>

            {/* Main Charts */}
            <div className="charts-main-row">
                <motion.div variants={itemVariants} className="chart-card">
                    <h3>📈 {t('admin.revenueChart')}</h3>
                    <div className="chart-container">
                        <Line data={revenueChartData} options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { grid: { drawBorder: false, color: '#F3F4F6' } }, x: { grid: { display: false } } }
                        }} />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="chart-card">
                    <h3>🥧 {t('admin.categoryRevenue')}</h3>
                    <div className="chart-container">
                        <Doughnut data={categoryData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
                        }} />
                    </div>
                </motion.div>
            </div>

            {/* Secondary Charts */}
            <div className="charts-secondary-row">
                <motion.div variants={itemVariants} className="chart-card">
                    <h3>📋 {t('admin.orderStatus')}</h3>
                    <div className="chart-container" style={{height: '300px'}}>
                        <Bar data={{
                            labels: stats?.order_status?.map(s => t(`admin.statusLabels.${s.status}`)) || [],
                            datasets: [{
                                data: stats?.order_status?.map(s => s.count) || [],
                                backgroundColor: '#4318FF',
                                borderRadius: 8,
                            }]
                        }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="chart-card">
                    <h3>⚠️ {t('admin.stockStatus')}</h3>
                    <div className="chart-container" style={{height: '300px'}}>
                        <Bar data={{
                            labels: ['Thấp', 'Cao', 'Tổng'],
                            datasets: [{
                                data: [stats?.inventory_alert_count, stats?.high_stock_count, stats?.product_count],
                                backgroundColor: ['#ee5d50', '#05cd99', '#a3aed0'],
                                borderRadius: 8,
                            }]
                        }} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="chart-card">
                    <h3>🏆 Top 5 Sản phẩm</h3>
                    <div className="chart-container" style={{height: '300px'}}>
                        <Bar data={{
                            labels: stats?.top_products?.map(p => p.name.substring(0, 15) + '...') || [],
                            datasets: [{
                                label: 'Đã bán',
                                data: stats?.top_products?.map(p => p.total_sold) || [],
                                backgroundColor: '#6AD2FF',
                                borderRadius: 5,
                            }]
                        }} options={{ indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Sub-component for KPI Cards
const StatCard = ({ title, value, change, icon, onClick, isNegative, variants }) => (
    <motion.div 
        variants={variants}
        whileHover={{ y: -5 }}
        className="stat-card" 
        onClick={onClick}
    >
        <div className="icon-box">{icon}</div>
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        <div className={`stat-change ${isNegative ? 'negative' : 'positive'}`}>
            {change}
        </div>
    </motion.div>
);

export default AdminDashboard;