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

// Cấu hình chung cho Chart để đẹp hơn
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            padding: 12,
            titleFont: { size: 13, family: "'Inter', sans-serif" },
            bodyFont: { size: 13, family: "'Inter', sans-serif" },
            cornerRadius: 8,
            displayColors: false,
        }
    },
    scales: {
        x: {
            grid: { display: false }, // Ẩn lưới dọc
            ticks: { font: { family: "'Inter', sans-serif" }, color: '#64748b' }
        },
        y: {
            grid: { color: '#f1f5f9', borderDash: [5, 5] }, // Lưới ngang nét đứt mờ
            ticks: { font: { family: "'Inter', sans-serif" }, color: '#64748b' },
            beginAtZero: true
        }
    },
    elements: {
        line: { tension: 0.4 }, // Làm đường cong mềm mại
        bar: { borderRadius: 6 }, // Bo góc cột
        point: { radius: 0, hitRadius: 10, hoverRadius: 6 } // Ẩn điểm tròn, chỉ hiện khi hover
    }
};

const SaleDashboard = () => {
    const { t } = useTranslation();
    const [timePeriod, setTimePeriod] = useState('today');
    const [dashboardTab, setDashboardTab] = useState('overview');

    // ... (Giữ nguyên phần Data như code cũ của bạn) ...
    const todayPerformance = {
        revenue: 2500000,
        orders: 15,
        aov: 166667,
        itemsSold: 45,
        kpiProgress: 68,
        target: 3500000,
        yesterdayRevenue: 2200000,
        yesterdayOrders: 12,
        revenueChange: 13.6,
        ordersChange: 25,
    };
    
    // ... (Giữ nguyên các biến Data khác: lowStockItems, conversionData, leaderboard, weeklyTargetData) ...
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
            backgroundColor: ['#10b981', '#f1f5f9'], // Xanh đẹp và xám nhạt
            borderWidth: 0,
            hoverOffset: 4
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
        // ... (Giữ nguyên logic data) ...
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
                // Tạo hiệu ứng màu nền gradient (nếu muốn đơn giản thì dùng màu solid mờ)
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(227, 0, 25, 0.4)');
                    gradient.addColorStop(1, 'rgba(227, 0, 25, 0.0)');
                    return gradient;
                },
                borderWidth: 3,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#E30019',
                pointBorderWidth: 2,
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
                   {/* Dùng emoji hoặc icon library nếu có */}
                   <span>📊</span> {t('dashboard.overview')}
                </button>
                <button
                    className={`dashboard-tab ${dashboardTab === 'performance' ? 'active' : ''}`}
                    onClick={() => setDashboardTab('performance')}
                >
                    <span>📈</span> {t('dashboard.performance')}
                </button>
                <button
                    className={`dashboard-tab ${dashboardTab === 'goals' ? 'active' : ''}`}
                    onClick={() => setDashboardTab('goals')}
                >
                    <span>🎯</span> {t('dashboard.goals')}
                </button>
            </div>

            {/* Tab Content: Overview */}
            {dashboardTab === 'overview' && (
                <>
                    <section className="section-kpi">
                        <h2 className="section-title">📊 {t('dashboard.todayPerformance')}</h2>
                        <div className="kpi-grid">
                            <div className="kpi-card primary">
                                <div className="kpi-header">
                                    <div className="kpi-icon">💰</div>
                                    <div className={`trend-indicator ${todayPerformance.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                                            {todayPerformance.revenueChange >= 0 ? '↗' : '↘'} {Math.abs(todayPerformance.revenueChange)}%
                                    </div>
                                </div>
                                <div>
                                    <div className="kpi-label">{t('dashboard.revenue')}</div>
                                    <div className="kpi-value">{formatCurrency(todayPerformance.revenue)}</div>
                                </div>
                            </div>
                            <div className="kpi-card info">
                                 <div className="kpi-header">
                                    <div className="kpi-icon">📦</div>
                                    <div className={`trend-indicator ${todayPerformance.ordersChange >= 0 ? 'positive' : 'negative'}`}>
                                        {todayPerformance.ordersChange >= 0 ? '↗' : '↘'} {Math.abs(todayPerformance.ordersChange)}%
                                    </div>
                                </div>
                                <div>
                                    <div className="kpi-label">{t('dashboard.orders')}</div>
                                    <div className="kpi-value">{todayPerformance.orders}</div>
                                </div>
                            </div>
                            <div className="kpi-card success">
                                <div className="kpi-header">
                                    <div className="kpi-icon">💵</div>
                                </div>
                                <div>
                                    <div className="kpi-label">{t('dashboard.aov')}</div>
                                    <div className="kpi-value">{formatCurrency(todayPerformance.aov)}</div>
                                </div>
                            </div>
                             <div className="kpi-card warning">
                                <div className="kpi-header">
                                    <div className="kpi-icon">🛍️</div>
                                </div>
                                <div>
                                    <div className="kpi-label">{t('dashboard.itemsSold')}</div>
                                    <div className="kpi-value">{todayPerformance.itemsSold}</div>
                                </div>
                            </div>
                        </div>

                        <div className="kpi-progress-card">
                            <div className="progress-header">
                                <span>🚀 {t('dashboard.kpiProgress')}</span>
                                <span className="progress-percent">{todayPerformance.kpiProgress}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${todayPerformance.kpiProgress}%` }}></div>
                            </div>
                            <div className="progress-footer">
                                <span>Mục tiêu hôm nay: <b>{formatCurrency(todayPerformance.target)}</b></span>
                            </div>
                        </div>
                    </section>

                    <section className="section-trend">
                        <div className="trend-grid">
                            <div className="chart-card">
                                <div className="chart-header-with-tabs">
                                    <h3>📈 {t('dashboard.revenueOverTime')}</h3>
                                    <div className="time-tabs">
                                        <button className={`tab-btn ${timePeriod === 'today' ? 'active' : ''}`} onClick={() => setTimePeriod('today')}>{t('dashboard.today')}</button>
                                        <button className={`tab-btn ${timePeriod === 'last7days' ? 'active' : ''}`} onClick={() => setTimePeriod('last7days')}>{t('dashboard.last7Days')}</button>
                                        <button className={`tab-btn ${timePeriod === 'last30days' ? 'active' : ''}`} onClick={() => setTimePeriod('last30days')}>{t('dashboard.last30Days')}</button>
                                    </div>
                                </div>
                                <div className="chart-container">
                                    <Line data={getHourlyData()} options={commonChartOptions} />
                                </div>
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
                    
                    {/* Phần Suggestion giữ nguyên logic, chỉ thay class để ăn style mới */}
                    <section className="section-suggestions">
                        <h2 className="section-title">💡 {t('dashboard.smartSuggestions')}</h2>
                        <div className="suggestions-grid">
                             {/* ... Copy nội dung Suggestion cũ vào đây, các classname đã được style lại ở CSS mới ... */}
                             <div className="suggestion-card hot">
                                <h3>🔥 {t('dashboard.hotProducts')}</h3>
                                <div className="suggestion-list">
                                    <div className="suggestion-item"><span className="item-name">Áo thun nam</span><span className="item-badge">23 sold</span></div>
                                    <div className="suggestion-item"><span className="item-name">Áo khoác</span><span className="item-badge">18 sold</span></div>
                                </div>
                            </div>
                            <div className="suggestion-card priority">
                                <h3>📦 {t('dashboard.priorityPush')}</h3>
                                <div className="suggestion-list">
                                    <div className="suggestion-item"><span className="item-name">Áo len cổ lọ</span><span className="item-badge warning">Stock: 85</span></div>
                                    <div className="suggestion-item"><span className="item-name">Quần kaki</span><span className="item-badge warning">Stock: 72</span></div>
                                </div>
                            </div>
                            <div className="suggestion-card combo">
                                <h3>🎯 {t('dashboard.comboSuggestion')}</h3>
                                <div className="suggestion-list">
                                    <div className="suggestion-item"><span className="item-name">Áo thun + Jean</span><span className="item-badge success">Popular</span></div>
                                    <div className="suggestion-item"><span className="item-name">Váy + Áo khoác</span><span className="item-badge success">Trending</span></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
            
            {/* Các Tab Performance và Goals cũng sẽ tự động đẹp lên nhờ file CSS mới. 
                Bạn chỉ cần đảm bảo áp dụng commonChartOptions cho các biểu đồ ở đó. */}
            
             {/* Tab Content: Performance */}
             {dashboardTab === 'performance' && (
                <>
                    <section className="section-conversion">
                        <h2 className="section-title">🎯 {t('dashboard.conversionMetrics')}</h2>
                        <div className="conversion-grid">
                            <div className="metric-card">
                                <h3>{t('dashboard.conversionRate')}</h3>
                                <div className="donut-container" style={{height: '200px'}}>
                                    <Doughnut 
                                        data={conversionData} 
                                        options={{
                                            ...commonChartOptions, 
                                            cutout: '70%', 
                                            plugins: { legend: { position: 'bottom' } } 
                                        }} 
                                    />
                                </div>
                            </div>
                            {/* ... Các card khác giữ nguyên cấu trúc ... */}
                             <div className="metric-card">
                                <h3>{t('dashboard.returnRate')}</h3>
                                <div className="metric-value-large">3.2%</div>
                                <div className="metric-trend positive">↓ 0.5% {t('dashboard.vsLastWeek')}</div>
                            </div>
                            <div className="metric-card">
                                <h3>{t('dashboard.upsellSuccess')}</h3>
                                <div className="metric-value-large">12 Orders</div>
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
                                        <tr key={item.rank} style={item.isCurrentUser ? {background: 'rgba(227, 0, 25, 0.03)'} : {}}>
                                            <td className="rank">#{item.rank}</td>
                                            <td className="name">
                                                {item.name}
                                                {item.isCurrentUser && <span className="you-badge">{t('dashboard.you')}</span>}
                                            </td>
                                            <td className="revenue" style={{fontWeight: 600}}>{formatCurrency(item.revenue)}</td>
                                            <td className="orders">{item.orders}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}

            {/* Tab Content: Goals - Giữ nguyên logic, CSS mới sẽ xử lý hiển thị */}
             {dashboardTab === 'goals' && (
                <>
                   <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>
                       {/* Bạn copy phần code Tab Goals cũ vào đây, nó sẽ tự nhận CSS mới */}
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
                             {/* ... Thêm các alert card khác ... */}
                        </div>
                    </section>
                   </div>
                </>
            )}

        </div>
    );
};

export default SaleDashboard;