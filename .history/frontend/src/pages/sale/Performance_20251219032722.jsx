import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import './Performance.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const SalePerformance = () => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // SVG Icons
    const Icons = {
        ChartBar: () => <svg width="20" height="20" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
        ChartLine: () => <svg width="20" height="20" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
        LightBulb: () => <svg width="20" height="20" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2v1"/><path d="M12 18a5 5 0 0 0 5-5c0-1.98-1.43-3.66-3.3-4.14C12.33 8.5 12 6.5 12 6.5s-0.33 2-1.7 2.36C8.43 9.34 7 11.02 7 13a5 5 0 0 0 5 5z"/></svg>,
        TrendingUp: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
        TrendingDown: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
    };

    useEffect(() => {
        fetchPerformance();
    }, []);

    const fetchPerformance = async () => {
        try {
            const res = await api.get('/sale/performance.php');
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{padding: '40px', textAlign: 'center'}}>Loading dashboard...</div>;
    if (!data) return <div style={{padding: '40px', textAlign: 'center'}}>Unable to load data</div>;

    const { summary, monthly_chart, weekly_chart } = data;

    // --- CHART CONFIG ---
    const monthlyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // Ẩn legend để gọn hơn
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                callbacks: {
                    label: (context) => ` Revenue: ${parseInt(context.raw).toLocaleString()}đ`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { borderDash: [4, 4], color: '#E5E7EB' },
                ticks: { font: { size: 11 }, color: '#6B7280' }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 12, weight: '500' }, color: '#374151' }
            }
        }
    };

    const monthlyChartData = {
        labels: monthly_chart.map(d => d.date),
        datasets: [
            {
                label: 'Revenue',
                data: monthly_chart.map(d => d.revenue),
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, '#4F46E5'); // Màu tím đậm
                    gradient.addColorStop(1, '#818CF8'); // Màu tím nhạt
                    return gradient;
                },
                borderRadius: 8,
                barThickness: 40,
            },
        ],
    };

    const weeklyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                intersect: false,
                backgroundColor: 'rgba(16, 185, 129, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 10,
                cornerRadius: 6,
            }
        },
        scales: {
            y: { display: false },
            x: {
                grid: { display: false },
                ticks: { font: { size: 10 }, color: '#9CA3AF' }
            }
        },
        elements: {
            line: { tension: 0.4 },
            point: { radius: 0, hitRadius: 10, hoverRadius: 6 }
        }
    };

    const weeklyChartData = {
        labels: weekly_chart.map(d => `W${d.week_num}`),
        datasets: [
            {
                label: 'Weekly',
                data: weekly_chart.map(d => d.revenue),
                borderColor: '#10B981',
                borderWidth: 3,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
                    return gradient;
                },
                fill: true,
            },
        ],
    };

    const GrowthBadge = ({ val }) => {
        const isPos = val >= 0;
        return (
            <span className={`growth-badge ${isPos ? 'pos' : 'neg'}`}>
                <span style={{marginRight: '4px'}}>{isPos ? <Icons.TrendingUp/> : <Icons.TrendingDown/>}</span>
                {Math.abs(val)}%
            </span>
        );
    };

    return (
        <div className="performance-page">
            <div className="perf-header">
                <h2>📈 {t('Business Performance') || 'Business Performance'}</h2>
                <p>Overview of your sales, returns and key metrics this month.</p>
            </div>

            {/* TOP CARDS */}
            <div className="perf-grid">
                <div className="perf-card revenue">
                    <div className="perf-card-content">
                        <h3>{t('sale.performance.revenueMonth')}</h3>
                        <div className="big-number">
                            {parseInt(summary.revenue.current).toLocaleString()}đ
                        </div>
                        <div className="comparison">
                            <GrowthBadge val={summary.revenue.growth} />
                            <span>vs last month ({parseInt(summary.revenue.last).toLocaleString()}đ)</span>
                        </div>
                    </div>
                </div>

                <div className="perf-card orders">
                    <div className="perf-card-content">
                        <h3>{t('sale.performance.orders')}</h3>
                        <div className="big-number">{summary.orders.current}</div>
                        <div className="comparison">
                            <GrowthBadge val={summary.orders.growth} />
                            <span>vs last month</span>
                        </div>
                    </div>
                </div>

                <div className="perf-card returns">
                    <div className="perf-card-content">
                        <h3>{t('sale.performance.returnRate')}</h3>
                        <div className="big-number">
                            {summary.returns} <span className="sub-text" style={{fontSize: '16px'}}>orders returned</span>
                        </div>
                        <div className="comparison" style={{background: '#FFFBEB', color: '#B45309'}}>
                            <span>⚠️ Aim for less than 5 returns/month</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN LAYOUT */}
            <div className="perf-main-layout">
                {/* Left: Main Chart */}
                <div className="layout-col-left">
                    <div className="chart-box main-chart">
                        <h3><Icons.ChartBar /> {t('sale.performance.revenue6Months')}</h3>
                        <div style={{flex: 1, position: 'relative', width: '100%', minHeight: '0'}}>
                            <Bar options={monthlyOptions} data={monthlyChartData} />
                        </div>
                    </div>
                </div>

                {/* Right: Tips & Trends */}
                <div className="layout-col-right">
                    {/* Coaching */}
                    <div className="coaching-section">
                        <h3><Icons.LightBulb /> {t('sale.performance.tips')}</h3>
                        <div className="tips-list">
                            {summary.revenue.growth > 0 ? (
                                <div className="tip-item positive">
                                    <span className="tip-icon">🚀</span>
                                    <span>{t('sale.performance.tipsPositive')}</span>
                                </div>
                            ) : (
                                <div className="tip-item negative">
                                    <span className="tip-icon">📉</span>
                                    <span>{t('sale.performance.tipsNegative')}</span>
                                </div>
                            )}
                            {summary.returns > 0 && (
                                <div className="tip-item warning">
                                    <span className="tip-icon">💡</span>
                                    <span>{t('sale.performance.tipsWarning')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mini Weekly Chart */}
                    <div className="chart-box mini-chart">
                        <h3><Icons.ChartLine /> {t('sale.performance.weeklyTrend')}</h3>
                        <div className="mini-chart-wrapper">
                            <Line options={weeklyOptions} data={weeklyChartData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalePerformance;