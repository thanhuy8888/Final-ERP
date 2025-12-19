import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
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

    if (loading) return (
        <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <span>{t('admin.loading')}</span>
        </div>
    );

    const formatPrice = (p) => Number(p).toLocaleString('vi-VN') + t('common.currency');

    // Cấu hình biểu đồ doanh thu (Line Chart with Gradient)
    const revenueData = {
        labels: stats?.daily_revenue?.map(d => new Date(d.date).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})) || [],
        datasets: [{
            label: t('admin.revenue'),
            data: stats?.daily_revenue?.map(d => Number(d.revenue)) || [],
            borderColor: '#E31E24',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(227, 30, 36, 0.2)');
                gradient.addColorStop(1, 'rgba(227, 30, 36, 0)');
                return gradient;
            },
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#E31E24'
        }]
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header-row">
                <div className="dashboard-header">
                    <h1>📊 {t('admin.dashboard')}</h1>
                    <p>{t('admin.overview')}</p>
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
                <StatCard title={t('admin.revenue')} value={formatPrice(stats?.revenue || 0)} change="+12.5%" type="positive" icon="💰" onClick={() => navigate('/admin/reports')} />
                <StatCard title={t('admin.orders')} value={stats?.order_count || 0} change="+8.3%" type="positive" icon="🛒" onClick={() => navigate('/admin/orders')} />
                <StatCard title={t('admin.avgOrderValue')} value={formatPrice(stats?.avg_order_value || 0)} change="+3.2%" type="positive" icon="💵" />
                <StatCard title={t('admin.returnRate')} value={`${(stats?.return_rate || 0).toFixed(1)}%`} change="-1.5%" type="negative" icon="↩️" />
                <StatCard title={t('admin.inventoryAlerts')} value={stats?.inventory_alert_count || 0} change="Cần kiểm tra" type="neutral" icon="⚠️" onClick={() => navigate('/admin/inventory')} />
            </div>

            {/* Main Charts */}
            <div className="charts-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <ChartCard title={`📈 ${t('admin.revenueChart')}`}>
                    <Line data={revenueData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </ChartCard>
                <ChartCard title={`👕 ${t('admin.categoryRevenue')}`}>
                    <Doughnut 
                        data={{
                            labels: stats?.revenue_by_category?.map(c => c.category) || [],
                            datasets: [{
                                data: stats?.revenue_by_category?.map(c => Number(c.revenue)) || [],
                                backgroundColor: ['#E31E24', '#1e293b', '#facc15', '#10b981'],
                                borderWidth: 0
                            }]
                        }}
                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                    />
                </ChartCard>
            </div>

            {/* Secondary Charts */}
            <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                <ChartCard title={`📋 ${t('admin.orderStatus')}`}>
                    <Bar 
                        data={{
                            labels: stats?.order_status?.map(s => t(`admin.statusLabels.${s.status}`)) || [],
                            datasets: [{ data: stats?.order_status?.map(s => s.count) || [], backgroundColor: '#3b82f6', borderRadius: 6 }]
                        }}
                        options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                    />
                </ChartCard>
                <ChartCard title={`🏆 Top 5 ${t('admin.topProducts')}`}>
                    <Bar 
                        data={{
                            labels: stats?.top_products?.slice(0, 5).map(p => p.name) || [],
                            datasets: [{ data: stats?.top_products?.slice(0, 5).map(p => p.total_sold) || [], backgroundColor: '#10b981', borderRadius: 6 }]
                        }}
                        options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                    />
                </ChartCard>
            </div>
        </div>
    );
};

// Component con để tái sử dụng
const StatCard = ({ title, value, change, type, icon, onClick }) => (
    <div className={`stat-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
        <h3>{icon} {title}</h3>
        <p className="stat-value">{value}</p>
        <span className={`stat-change ${type}`}>{change}</span>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="chart-card">
        <h3>{title}</h3>
        <div className="chart-container">{children}</div>
    </div>
);

export default AdminDashboard;