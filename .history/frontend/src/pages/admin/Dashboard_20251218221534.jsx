import React, { useEffect, useState } from 'react';
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

    const chartFont = { family: "'Inter', sans-serif", size: 12, weight: '500' };

    return (
        <div className="dashboard-container">
            {/* HEADER ROW */}
            <div className="dashboard-header-row">
                <div className="dashboard-header">
                    <h1>{t('admin.dashboard')}</h1>
                    <p>{t('admin.welcome_msg')}</p>
                </div>
                
                <div className="dashboard-actions">
                    <div className="date-filter">
                        <button className={dateRange === 'today' ? 'active' : ''} onClick={() => setDateRange('today')}>
                            {t('admin.filter.today')}
                        </button>
                        <button className={dateRange === '7days' ? 'active' : ''} onClick={() => setDateRange('7days')}>
                            {t('admin.filter.7days')}
                        </button>
                        <button className={dateRange === '30days' ? 'active' : ''} onClick={() => setDateRange('30days')}>
                            {t('admin.filter.30days')}
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="stats-grid-5">
                <div className="stat-card revenue clickable" onClick={() => navigate('/admin/reports')}>
                    <h3>💰 {t('admin.revenue')}</h3>
                    <p className="stat-value">{formatPrice(stats?.revenue || 0)}</p>
                    <p className="stat-change positive">↑ 12.5% <span style={{fontWeight:400, color:'#94a3b8', fontSize:'11px'}}>{t('admin.vs_last_period')}</span></p>
                </div>
                <div className="stat-card orders clickable" onClick={() => navigate('/admin/orders')}>
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
                <div className="stat-card alerts clickable" onClick={() => navigate('/admin/inventory')}>
                    <h3>⚠️ {t('admin.inventoryAlerts')}</h3>
                    <p className="stat-value">{stats?.inventory_alert_count || 0}</p>
                    <p style={{color:'#e74c3c', fontSize:'11px', marginTop:'5px', fontWeight:700}}>{t('admin.check_stock')}</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="charts-section" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
                <div className="chart-card">
                    <h3>📈 {t('admin.revenue_chart')}</h3>
                    <div className="chart-container" style={{height: '350px'}}>
                        <Line 
                            data={{
                                labels: stats?.daily_revenue?.map(d => {
                                    const date = new Date(d.date);
                                    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                                }) || [],
                                datasets: [{
                                    label: t('admin.revenue'),
                                    data: stats?.daily_revenue?.map(d => Number(d.revenue)) || [],
                                    backgroundColor: 'rgba(227, 30, 36, 0.08)',
                                    borderColor: '#E31E24',
                                    borderWidth: 4,
                                    fill: true,
                                    tension: 0.4,
                                    pointBackgroundColor: '#fff',
                                    pointBorderColor: '#E31E24',
                                    pointBorderWidth: 2,
                                    pointRadius: 5,
                                }]
                            }} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { ticks: { font: chartFont } }, x: { ticks: { font: chartFont } } }
                            }} 
                        />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>👕 {t('admin.category_chart')}</h3>
                    <div className="chart-container" style={{height: '350px'}}>
                        <Doughnut data={{
                            labels: stats?.revenue_by_category?.map(c => c.category) || [],
                            datasets: [{
                                data: stats?.revenue_by_category?.map(c => Number(c.revenue)) || [],
                                backgroundColor: ['#E31E24', '#1a1a2e', '#3498db', '#2ecc71', '#f1c40f'],
                                borderWidth: 5, borderColor: '#ffffff'
                            }]
                        }} options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: { legend: { position: 'bottom', labels: { font: chartFont, usePointStyle: true, padding: 20 } } }
                        }} />
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="charts-section" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginTop: '25px' }}>
                <div className="chart-card">
                    <h3>📦 {t('admin.inventory_status')}</h3>
                    <div className="chart-container" style={{height: '280px'}}>
                        <Bar data={{
                            labels: [t('admin.low'), t('admin.high'), t('admin.total')],
                            datasets: [{
                                data: [stats?.inventory_alert_count || 0, stats?.high_stock_count || 0, stats?.product_count || 0],
                                backgroundColor: ['#e74c3c', '#3498db', '#94a3b8'],
                                borderRadius: 8
                            }]
                        }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>📋 {t('admin.order_status_chart')}</h3>
                    <div className="chart-container" style={{height: '280px'}}>
                        <Bar data={{
                            labels: stats?.order_status?.map(s => t(`admin.statusLabels.${s.status}`)) || [],
                            datasets: [{
                                data: stats?.order_status?.map(s => Number(s.count)) || [],
                                backgroundColor: ['#f39c12', '#3498db', '#9b59b6', '#2ecc71', '#e74c3c'],
                                borderRadius: 8
                            }]
                        }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>🏆 {t('admin.top_products_title')}</h3>
                    <div className="chart-container" style={{height: '280px'}}>
                        <Bar data={{
                            labels: stats?.top_products?.map(p => p.name).slice(0, 5) || [],
                            datasets: [{
                                data: stats?.top_products?.map(p => Number(p.total_sold)).slice(0, 5) || [],
                                backgroundColor: '#E31E24', borderRadius: 5
                            }]
                        }} options={{ 
                            indexAxis: 'y', 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            plugins: { legend: { display: false } } 
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;