import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
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
    Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const SaleDashboard = () => {
    const { t } = useTranslation();
    const [timePeriod, setTimePeriod] = useState('today');
    const [dashboardTab, setDashboardTab] = useState('overview');

    const todayPerformance = {
        revenue: 2500000,
        orders: 15,
        aov: 166667,
        itemsSold: 45,
        kpiProgress: 68,
        target: 3500000,
        // Comparison data
        yesterdayRevenue: 2200000,
        yesterdayOrders: 12,
        revenueChange: 13.6,
        ordersChange: 25,
    };

    const topPersonalProducts = {
        labels: ['Áo thun nam', 'Áo khoác', 'Quần Jean nữ', 'Áo len', 'Váy hoa'],
        datasets: [{
            label: t('common.quantity'),
            data: [23, 18, 15, 12, 8],
            backgroundColor: 'rgba(227, 0, 25, 0.8)',
            borderRadius: 4,
        }]
    };

    const lowStockItems = [
        { id: 1, name: 'Áo thun nam size M', stock: 5, category: 'Áo thun', status: 'critical' },
        { id: 2, name: 'Quần Jean nữ size 28', stock: 8, category: 'Quần', status: 'warning' },
        { id: 3, name: 'Áo khoác size L', stock: 7, category: 'Áo khoác', status: 'warning' },
        { id: 4, name: 'Váy hoa size S', stock: 6, category: 'Váy', status: 'warning' },
        { id: 5, name: 'Áo len size XL', stock: 9, category: 'Áo len', status: 'warning' },
    ];

    const conversionData = {
        labels: [t('sale.orders'), t('sale.noOrders') || 'Không mua'],
        datasets: [{
            data: [68, 32],
            backgroundColor: ['#27ae60', '#e74c3c'],
        }]
    };

    const leaderboard = [
        { rank: 1, name: 'Nguyễn Minh Tuấn', revenue: 3200000, orders: 18 },
        { rank: 2, name: 'Ngọc Anh Sale', revenue: 2500000, orders: 15, isCurrentUser: true },
        { rank: 3, name: 'Trần Thị Hương', revenue: 2300000, orders: 14 },
        { rank: 4, name: 'Lê Hoàng Nam', revenue: 2100000, orders: 12 },
        { rank: 5, name: 'Phạm Thu Hà', revenue: 1900000, orders: 11 },
    ];

    const weeklyTargetData = {
        labels: [t('sale.last7Days'), t('sale.last30Days'), 'Tuần 3', 'Tuần 4'],
        datasets: [{
            label: t('dashboard.revenue'),
            data: [8500000, 9200000, 8800000, 10500000],
            backgroundColor: '#E30019',
        }]
    };

    const getHourlyData = () => {
        const datasets = {
            today: {
                labels: ['8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h'],
                data: [120000, 180000, 250000, 320000, 450000, 380000, 290000, 410000, 520000, 480000, 350000, 280000, 150000],
            },
            last7days: {
                labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                data: [1800000, 2100000, 1950000, 2300000, 2500000, 2200000, 1600000],
            },
            last30days: {
                labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
                data: [8500000, 9200000, 8800000, 10500000],
            }
        };

        const selected = datasets[timePeriod];
        return {
            labels: selected.labels,
            datasets: [{
                label: t('dashboard.revenue'),
                data: selected.data,
                borderColor: '#E30019',
                backgroundColor: 'rgba(227, 0, 25, 0.1)',
                tension: 0.4,
                fill: true,
            }]
        };
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <div className="dashboard">
            {/* Main Dashboard Tabs */}
            <div className="dashboard-tabs">
                <button
                    className={`dashboard-tab ${dashboardTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setDashboardTab('overview')}
                >
                    📊 {t('dashboard.overview')}
                </button>
                <button
                    className={`dashboard-tab ${dashboardTab === 'performance' ? 'active' : ''}`}
                    onClick={() => setDashboardTab('performance')}
                >
                    🎯 {t('dashboard.performance')}
                </button>
                <button
                    className={`dashboard-tab ${dashboardTab === 'goals' ? 'active' : ''}`}
                    onClick={() => setDashboardTab('goals')}
                >
                    🎯 {t('dashboard.goals')}
                </button>
            </div>

            {/* Tab Content: Overview */}
            {dashboardTab === 'overview' && (
                <>
                    <section className="section-kpi">
                        <h2 className="section-title">📊 {t('dashboard.todayPerformance')}</h2>
                        <div className="kpi-grid">
                            <div className="kpi-card primary">
                                <div className="kpi-icon">💰</div>
                                <div className="kpi-content">
                                    <div className="kpi-label">{t('dashboard.revenue')}</div>
                                    <div className="kpi-value">{formatCurrency(todayPerformance.revenue)}</div>
                                    <div className="kpi-comparison">
                                        <span className={`trend-indicator ${todayPerformance.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                                            {todayPerformance.revenueChange >= 0 ? '🔺' : '🔻'} {Math.abs(todayPerformance.revenueChange).toFixed(1)}%
                                        </span>
                                        <span className="comparison-text">{t('dashboard.vsYesterday')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="kpi-card info">
                                <div className="kpi-icon">📦</div>
                                <div className="kpi-content">
                                    <div className="kpi-label">{t('dashboard.orders')}</div>
                                    <div className="kpi-value">{todayPerformance.orders}</div>
                                    <div className="kpi-comparison">
                                        <span className={`trend-indicator ${todayPerformance.ordersChange >= 0 ? 'positive' : 'negative'}`}>
                                            {todayPerformance.ordersChange >= 0 ? '🔺' : '🔻'} {Math.abs(todayPerformance.ordersChange).toFixed(0)}%
                                        </span>
                                        <span className="comparison-text">{t('dashboard.vsYesterday')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="kpi-card success">
                                <div className="kpi-icon">💵</div>
                                <div className="kpi-content">
                                    <div className="kpi-label">{t('dashboard.aov')}</div>
                                    <div className="kpi-value">{formatCurrency(todayPerformance.aov)}</div>
                                </div>
                            </div>
                            <div className="kpi-card warning">
                                <div className="kpi-icon">📈</div>
                                <div className="kpi-content">
                                    <div className="kpi-label">{t('dashboard.itemsSold')}</div>
                                    <div className="kpi-value">{todayPerformance.itemsSold}</div>
                                </div>
                            </div>
                        </div>

                        <div className="kpi-progress-card">
                            <div className="progress-header">
                                <span>{t('dashboard.kpiProgress')}</span>
                                <span className="progress-percent">{todayPerformance.kpiProgress}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${todayPerformance.kpiProgress}%` }}></div>
                            </div>
                            <div className="progress-footer">
                                <span>{formatCurrency(todayPerformance.revenue)} / {formatCurrency(todayPerformance.target)}</span>
                            </div>
                        </div>
                    </section>

                    <section className="section-trend">
                        <h2 className="section-title">📈 {t('dashboard.salesTrend')}</h2>
                        <div className="trend-grid">
                            <div className="chart-card">
                                <div className="chart-header-with-tabs">
                                    <h3>{t('dashboard.revenueOverTime')}</h3>
                                    <div className="time-tabs">
                                        <button
                                            className={`tab-btn ${timePeriod === 'today' ? 'active' : ''}`}
                                            onClick={() => setTimePeriod('today')}
                                        >
                                            {t('dashboard.today')}
                                        </button>
                                        <button
                                            className={`tab-btn ${timePeriod === 'last7days' ? 'active' : ''}`}
                                            onClick={() => setTimePeriod('last7days')}
                                        >
                                            {t('dashboard.last7Days')}
                                        </button>
                                        <button
                                            className={`tab-btn ${timePeriod === 'last30days' ? 'active' : ''}`}
                                            onClick={() => setTimePeriod('last30days')}
                                        >
                                            {t('dashboard.last30Days')}
                                        </button>
                                    </div>
                                </div>
                                <div className="chart-container">
                                    <Line data={getHourlyData()} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                                </div>
                                {timePeriod === 'today' && (
                                    <div className="chart-insights">
                                        <span className="insight-badge peak">⚡ {t('dashboard.peak')}: 16h-17h</span>
                                        <span className="insight-badge slow">🕒 {t('dashboard.slow')}: 8h-9h</span>
                                    </div>
                                )}
                            </div>

                            <div className="chart-card low-stock-card">
                                <h3>⚠️ {t('dashboard.lowStockItems')}</h3>
                                <div className="low-stock-list">
                                    {lowStockItems.map((item) => (
                                        <div key={item.id} className={`stock-item ${item.status}`}>
                                            <div className="stock-info">
                                                <div className="stock-name">{item.name}</div>
                                                <div className="stock-category">{item.category}</div>
                                            </div>
                                            <div className="stock-quantity">
                                                <span className="stock-number">{item.stock}</span>
                                                <span className="stock-label">{t('dashboard.remaining')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/sale/stock" className="view-all-stock">
                                    {t('dashboard.viewAllStock')} →
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="section-suggestions">
                        <h2 className="section-title">💡 {t('dashboard.smartSuggestions')}</h2>
                        <div className="suggestions-grid">
                            <div className="suggestion-card hot">
                                <h3>🔥 {t('dashboard.hotProducts')}</h3>
                                <div className="suggestion-list">
                                    <div className="suggestion-item">
                                        <span className="item-name">Áo thun nam</span>
                                        <span className="item-badge">23 {t('dashboard.sold')}</span>
                                    </div>
                                    <div className="suggestion-item">
                                        <span className="item-name">Áo khoác</span>
                                        <span className="item-badge">18 {t('dashboard.sold')}</span>
                                    </div>
                                    <div className="suggestion-item">
                                        <span className="item-name">Quần Jean nữ</span>
                                        <span className="item-badge">15 {t('dashboard.sold')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="suggestion-card priority">
                                <h3>📦 {t('dashboard.priorityPush')}</h3>
                                <div className="suggestion-list">
                                    <div className="suggestion-item">
                                        <span className="item-name">Áo len cổ lọ</span>
                                        <span className="item-badge warning">{t('dashboard.stock')}: 85</span>
                                    </div>
                                    <div className="suggestion-item">
                                        <span className="item-name">Quần kaki</span>
                                        <span className="item-badge warning">{t('dashboard.stock')}: 72</span>
                                    </div>
                                    <div className="suggestion-item">
                                        <span className="item-name">Váy midi</span>
                                        <span className="item-badge warning">{t('dashboard.stock')}: 68</span>
                                    </div>
                                </div>
                            </div>

                            <div className="suggestion-card combo">
                                <h3>🎯 {t('dashboard.comboSuggestion')}</h3>
                                <div className="suggestion-list">
                                    <div className="suggestion-item">
                                        <span className="item-name">Áo thun + Quần Jean</span>
                                        <span className="item-badge success">{t('dashboard.popular')}</span>
                                    </div>
                                    <div className="suggestion-item">
                                        <span className="item-name">Áo khoác + Áo len</span>
                                        <span className="item-badge success">{t('dashboard.popular')}</span>
                                    </div>
                                    <div className="suggestion-item">
                                        <span className="item-name">Váy + Áo khoác</span>
                                        <span className="item-badge success">{t('dashboard.popular')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* Tab Content: Performance */}
            {dashboardTab === 'performance' && (
                <>
                    <section className="section-conversion">
                        <h2 className="section-title">🎯 {t('dashboard.conversionMetrics')}</h2>
                        <div className="conversion-grid">
                            <div className="metric-card">
                                <h3>{t('dashboard.conversionRate')}</h3>
                                <div className="donut-container">
                                    <Doughnut data={conversionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                                </div>
                            </div>
                            <div className="metric-card">
                                <h3>{t('dashboard.returnRate')}</h3>
                                <div className="metric-value-large">3.2%</div>
                                <div className="metric-trend positive">↓ 0.5% {t('dashboard.vsLastWeek')}</div>
                            </div>
                            <div className="metric-card">
                                <h3>{t('dashboard.upsellSuccess')}</h3>
                                <div className="metric-value-large">12 {t('sale.orders')}</div>
                                <div className="metric-trend positive">↑ 25% {t('dashboard.vsLastWeek')}</div>
                            </div>
                        </div>
                    </section>

                    <section className="section-leaderboard">
                        <h2 className="section-title">🏅 {t('dashboard.leaderboard')}</h2>
                        <div className="leaderboard-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('dashboard.rank')}</th>
                                        <th>{t('dashboard.staff')}</th>
                                        <th>{t('dashboard.revenue')}</th>
                                        <th>{t('dashboard.orders')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((item) => (
                                        <tr key={item.rank} className={item.isCurrentUser ? 'current-user' : ''}>
                                            <td className="rank">#{item.rank}</td>
                                            <td className="name">
                                                {item.name}
                                                {item.isCurrentUser && <span className="you-badge">{t('dashboard.you')}</span>}
                                            </td>
                                            <td className="revenue">{formatCurrency(item.revenue)}</td>
                                            <td className="orders">{item.orders}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}

            {/* Tab Content: Goals & Alerts */}
            {dashboardTab === 'goals' && (
                <>
                    <section className="section-tasks">
                        <h2 className="section-title">⚡ {t('dashboard.alertsTasks')}</h2>
                        <div className="tasks-grid">
                            <div className="alert-card warning">
                                <div className="alert-icon">⚠️</div>
                                <div className="alert-content">
                                    <strong>{t('dashboard.alertLowStock')}</strong>
                                    <p>Áo thun nam size M chỉ còn 5 cái</p>
                                </div>
                            </div>
                            <div className="alert-card info">
                                <div className="alert-icon">🎯</div>
                                <div className="alert-content">
                                    <strong>{t('dashboard.alertKPI')}</strong>
                                    <p>Cần thêm {formatCurrency(1000000)} để đạt mục tiêu</p>
                                </div>
                            </div>
                            <div className="alert-card success">
                                <div className="alert-icon">🎉</div>
                                <div className="alert-content">
                                    <strong>{t('dashboard.alertPromo')}</strong>
                                    <p>Giảm 20% cho áo khoác - Hết hạn 31/12</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="section-target">
                        <h2 className="section-title">🎯 {t('dashboard.personalTarget')}</h2>
                        <div className="target-grid">
                            <div className="chart-card">
                                <h3>{t('dashboard.revenueLast4Weeks')}</h3>
                                <div className="chart-container">
                                    <Bar data={weeklyTargetData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                                </div>
                            </div>
                            <div className="target-summary">
                                <div className="target-item">
                                    <div className="target-label">{t('dashboard.monthlyKPI')}</div>
                                    <div className="target-value">{formatCurrency(50000000)}</div>
                                </div>
                                <div className="target-item">
                                    <div className="target-label">{t('dashboard.achieved')}</div>
                                    <div className="target-value success">{formatCurrency(37000000)}</div>
                                </div>
                                <div className="target-item">
                                    <div className="target-label">{t('dashboard.missing')}</div>
                                    <div className="target-value warning">{formatCurrency(13000000)}</div>
                                </div>
                                <div className="progress-bar-vertical">
                                    <div className="progress-fill" style={{ width: '74%' }}></div>
                                </div>
                                <div className="progress-label">74% {t('dashboard.completed')}</div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default SaleDashboard;
