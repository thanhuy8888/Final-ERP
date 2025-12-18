import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const SaleDashboard = () => {
    const { t } = useTranslation();
    const [timePeriod, setTimePeriod] = useState('today');
    const [activeTab, setActiveTab] = useState('overview');

    // Data Mock
    const performance = {
        revenue: 2500000,
        orders: 15,
        aov: 166667,
        itemsSold: 45,
        kpiProgress: 68,
        target: 3500000,
        revChange: +13.6,
        orderChange: +25
    };

    const formatVND = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

    const getLineData = () => {
        const labels = timePeriod === 'today' ? ['8h', '10h', '12h', '14h', '16h', '18h', '20h'] : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const data = timePeriod === 'today' ? [12, 25, 45, 29, 52, 35, 15] : [180, 210, 195, 230, 250, 220, 160];
        
        return {
            labels,
            datasets: [{
                label: t('dashboard.revenue'),
                data: data,
                borderColor: '#E30019',
                backgroundColor: 'rgba(227, 0, 25, 0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 3
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { padding: 15, backgroundColor: '#2d3436', titleFont: { size: 14 } }
        },
        scales: {
            y: { grid: { color: '#f0f0f0' }, border: { display: false } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                {/* 1. Header Navigation */}
                <nav className="dashboard-tabs">
                    {['overview', 'performance', 'goals'].map((id) => (
                        <button 
                            key={id}
                            className={`dashboard-tab ${activeTab === id ? 'active' : ''}`}
                            onClick={() => setActiveTab(id)}
                        >
                            {id === 'overview' && '📊'}
                            {id === 'performance' && '📈'}
                            {id === 'goals' && '🎯'}
                            {t(`dashboard.${id}`)}
                        </button>
                    ))}
                </nav>

                {activeTab === 'overview' && (
                    <div className="fade-in-up">
                        {/* 2. KPI Cards Section */}
                        <section className="kpi-grid">
                            <StatCard icon="💰" label={t('dashboard.revenue')} value={formatVND(performance.revenue)} trend={performance.revChange} />
                            <StatCard icon="📦" label={t('dashboard.orders')} value={performance.orders} trend={performance.orderChange} />
                            <StatCard icon="💵" label={t('dashboard.aov')} value={formatVND(performance.aov)} />
                            <StatCard icon="🛍️" label={t('dashboard.itemsSold')} value={performance.itemsSold} />
                        </section>

                        {/* 3. Global Progress */}
                        <section className="kpi-progress-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                                <span>{t('dashboard.kpiProgress')}</span>
                                <span style={{ color: '#E30019' }}>{performance.kpiProgress}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${performance.kpiProgress}%` }}></div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#636e72' }}>
                                {formatVND(performance.revenue)} / <strong>{formatVND(performance.target)}</strong>
                            </div>
                        </section>

                        {/* 4. Chart & List Section */}
                        <div className="main-content-grid">
                            <div className="chart-box">
                                <header className="chart-header">
                                    <h3 style={{ fontWeight: 800 }}>{t('dashboard.revenueTrend')}</h3>
                                    <div className="time-pill-selector">
                                        {['today', 'last7days'].map(p => (
                                            <button 
                                                key={p} 
                                                className={`time-pill ${timePeriod === p ? 'active' : ''}`}
                                                onClick={() => setTimePeriod(p)}
                                            >
                                                {t(`dashboard.${p}`)}
                                            </button>
                                        ))}
                                    </div>
                                </header>
                                <div className="chart-container-large">
                                    <Line data={getLineData()} options={chartOptions} />
                                </div>
                            </div>

                            <div className="stock-alert-box">
                                <h3 style={{ fontWeight: 800 }}>⚠️ {t('dashboard.lowStockItems')}</h3>
                                <div className="stock-list-container">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="stock-row-item">
                                            <div>
                                                <span className="stock-name-text">Sản phẩm lỗi mốt #{i}</span>
                                                <span className="stock-cat-text">Danh mục thời trang</span>
                                            </div>
                                            <div className="stock-status-pill critical">Còn {5 + i}</div>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/stock" style={{ display: 'block', textAlign: 'center', marginTop: '25px', color: '#E30019', fontWeight: 700, textDecoration: 'none' }}>
                                    {t('dashboard.viewAllStock')} →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Component con cho Card chỉ số
const StatCard = ({ icon, label, value, trend }) => (
    <div className="kpi-card">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-info-content">
            <div className="kpi-label">{label}</div>
            <div className="kpi-value">{value}</div>
            {trend && (
                <div className={`trend-badge ${trend > 0 ? 'pos' : 'neg'}`}>
                    {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}% <span style={{ fontWeight: 400, color: '#999' }}>so với hqua</span>
                </div>
            )}
        </div>
    </div>
);

export default SaleDashboard;