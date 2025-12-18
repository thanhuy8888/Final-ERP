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

// Đăng ký các thành phần của Chart.js
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

    // --- CẤU HÌNH FONT & MÀU SẮC CHUNG ---
    const chartFont = {
        family: "'Inter', 'Segoe UI', sans-serif",
        size: 12,
        weight: '500'
    };

    // 1. Biểu đồ Doanh thu (Line Chart)
    const revenueChartData = {
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
            pointHoverRadius: 8,
        }]
    };

    const revenueChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                padding: 15,
                backgroundColor: '#1a1a2e',
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
                cornerRadius: 10,
                displayColors: false
            }
        },
        scales: {
            y: {
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { 
                    font: chartFont,
                    callback: (value) => value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value.toLocaleString()
                }
            },
            x: { grid: { display: false }, ticks: { font: chartFont } }
        }
    };

    // 2. Biểu đồ Danh mục (Doughnut)
    const categoryRevenueData = {
        labels: stats?.revenue_by_category?.map(c => c.category) || [],
        datasets: [{
            data: stats?.revenue_by_category?.map(c => Number(c.revenue)) || [],
            backgroundColor: ['#E31E24', '#1a1a2e', '#3498db', '#2ecc71', '#f1c40f'],
            borderWidth: 5,
            borderColor: '#ffffff',
            hoverOffset: 20
        }]
    };

    // 3. Biểu đồ Cột (Bar Charts)
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: chartFont } },
            x: { grid: { display: false }, ticks: { font: chartFont } }
        },
        borderRadius: 8
    };

    const stockStatusData = {
        labels: [t('admin.lowStockItems'), t('admin.highStockItems'), t('admin.totalSKU')],
        datasets: [{
            data: [stats?.inventory_alert_count || 0, stats?.high_stock_count || 0, stats?.product_count || 0],
            backgroundColor: ['#e74c3c', '#3498db', '#94a3b8'],
            barThickness: 40
        }]
    };

    const statusColors = { pending: '#f39c12', confirmed: '#3498db', processing: '#9b59b6', completed: '#2ecc71', cancelled: '#e74c3c' };
    const orderStatusBarData = {
        labels: stats?.order_status?.map(s => t(`admin.statusLabels.${s.status}`)) || [],
        datasets: [{
            data: stats?.order_status?.map(s => Number(s.count)) || [],
            backgroundColor: stats?.order_status?.map(s => statusColors[s.status] || '#999') || [],
            barThickness: 35
        }]
    };

    const topProductsData = {
        labels: stats?.top_products?.map(p => p.name).slice(0, 5) || [],
        datasets: [{
            label: t('admin.sold'),
            data: stats?.top_products?.map(p => Number(p.total_sold)).slice(0, 5) || [],
            backgroundColor: '#E31E24',
            barThickness: 25
        }]
    };

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <div className="dashboard-header-row">
                <div className="dashboard-header">
                    <h1>{t('admin.dashboard')}</h1>
                    <p>Chào mừng trở lại! Đây là tổng quan hoạt động kinh doanh của bạn.</p>
                </div>
                <div className="dashboard-actions">
                    <div className="date-filter">
                        <button className={dateRange === 'today' ? 'active' : ''} onClick={() => setDateRange('today')}>Hôm nay</button>
                        <button className={dateRange === '7days' ? 'active' : ''} onClick={() => setDateRange('7days')}>7 Ngày</button>
                        <button className={dateRange === '30days' ? 'active' : ''} onClick={() => setDateRange('30days')}>30 Ngày</button>
                    </div>
                </div>
            </div>

            {/* KPI Stats Grid */}
            <div className="stats-grid-5">
                <div className="stat-card revenue clickable" onClick={() => handleCardClick('/admin/reports')}>
                    <h3>💰 {t('admin.revenue')}</h3>
                    <p className="stat-value">{formatPrice(stats?.revenue || 0)}</p>
                    <p className="stat-change positive">↑ 12.5% <span style={{fontWeight: 400, color: '#94a3b8', fontSize: '12px'}}>vs kỳ trước</span></p>
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
                    <p style={{color: '#e74c3c', fontSize: '12px', marginTop: '8px', fontWeight: 600}}>Cần kiểm tra kho</p>
                </div>
            </div>

            {/* Main Charts Row (Large) */}
            <div className="charts-section" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
                <div className="chart-card">
                    <h3>📈 Biểu đồ doanh thu</h3>
                    <div className="chart-container">
                        {stats?.daily_revenue?.length > 0 ? (
                            <Line data={revenueChartData} options={revenueChartOptions} />
                        ) : (
                            <div className="empty-state">Không có dữ liệu doanh thu</div>
                        )}
                    </div>
                </div>
                <div className="chart-card">
                    <h3>👕 Doanh thu theo danh mục</h3>
                    <div className="chart-container">
                        <Doughnut data={categoryRevenueData} options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: { 
                                legend: { position: 'bottom', labels: { font: chartFont, padding: 25, usePointStyle: true } } 
                            }
                        }} />
                    </div>
                </div>
            </div>

            {/* Secondary Charts Row */}
            <div className="charts-section" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="chart-card">
                    <h3>📦 Tình trạng tồn kho</h3>
                    <div className="chart-container-small">
                        <Bar data={stockStatusData} options={barOptions} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>📋 Phân loại đơn hàng</h3>
                    <div className="chart-container-small">
                        <Bar data={orderStatusBarData} options={barOptions} />
                    </div>
                </div>
                <div className="chart-card">
                    <h3>🏆 Top 5 sản phẩm bán chạy</h3>
                    <div className="chart-container-small">
                        <Bar data={topProductsData} options={{ 
                            ...barOptions, 
                            indexAxis: 'y',
                            scales: { x: { beginAtZero: true }, y: { grid: { display: false } } }
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;