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

    if (loading) return <div>Loading...</div>;
    if (!data) return <div>Error loading data</div>;

    const { summary, monthly_chart, weekly_chart } = data;

    // Charts Config
    const monthlyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: t('sale.performance.revenue6Months') },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { borderDash: [2, 4], color: '#f0f0f0' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    const monthlyChartData = {
        labels: monthly_chart.map(d => d.date),
        datasets: [
            {
                label: `${t('sale.revenue')} (VNĐ)`,
                data: monthly_chart.map(d => d.revenue),
                backgroundColor: 'rgba(227, 30, 36, 0.8)',
                borderRadius: 4,
            },
        ],
    };

    const weeklyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 13 }
            }
        },
        scales: {
            y: {
                display: false, // Cleaner look
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 } }
            }
        },
        elements: {
            line: { tension: 0.4 } // Smooth curves
        }
    };

    const weeklyChartData = {
        labels: weekly_chart.map(d => `W${d.week_num}`),
        datasets: [
            {
                label: t('sale.performance.weeklyRevenue'),
                data: weekly_chart.map(d => d.revenue),
                borderColor: '#2ecc71',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(46, 204, 113, 0.4)');
                    gradient.addColorStop(1, 'rgba(46, 204, 113, 0.0)');
                    return gradient;
                },
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#2ecc71',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            },
        ],
    };

    // Helper for Growth Badge
    const GrowthBadge = ({ val }) => {
        const isPos = val >= 0;
        return (
            <span className={`growth-badge ${isPos ? 'pos' : 'neg'}`}>
                {isPos ? '▲' : '▼'} {Math.abs(val)}%
            </span>
        );
    };

    return (
        <div className="performance-page">
            {/* Summary Cards */}
            <div className="perf-grid">
                <div className="perf-card">
                    <h3>{t('sale.performance.revenueMonth')}</h3>
                    <div className="big-number">
                        {parseInt(summary.revenue.current).toLocaleString()}đ
                    </div>
                    <div className="comparison">
                        <GrowthBadge val={summary.revenue.growth} />
                        <span> {t('sale.performance.vsLastMonth')} ({parseInt(summary.revenue.last).toLocaleString()}đ)</span>
                    </div>
                </div>

                <div className="perf-card">
                    <h3>{t('sale.performance.orders')}</h3>
                    <div className="big-number">{summary.orders.current}</div>
                    <div className="comparison">
                        <GrowthBadge val={summary.orders.growth} />
                        <span> {t('sale.performance.vsLastMonth')}</span>
                    </div>
                </div>

                <div className="perf-card">
                    <h3>{t('sale.performance.returnRate')}</h3>
                    <div className="big-number warning-text">
                        {summary.returns} <span className="sub-text">{t('sale.performance.unitOrders')}</span>
                    </div>
                    <div className="comparison">
                        <span>{t('sale.performance.keepLowHint')}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="perf-main-layout">
                {/* Left Column: Monthly Chart */}
                <div className="layout-col-left">
                    <div className="chart-box main-chart">
                        <Bar options={monthlyOptions} data={monthlyChartData} />
                    </div>
                </div>

                {/* Right Column: Coaching + Weekly Chart */}
                <div className="layout-col-right">
                    {/* 1. Coaching Section (Moved here) */}
                    <div className="coaching-section">
                        <h3>💡 {t('sale.performance.tips')}</h3>
                        <div className="tips-list">
                            {summary.revenue.growth > 0 ? (
                                <div className="tip-item positive">
                                    {t('sale.performance.tipsPositive')}
                                </div>
                            ) : (
                                <div className="tip-item negative">
                                    {t('sale.performance.tipsNegative')}
                                </div>
                            )}
                            {summary.returns > 0 && (
                                <div className="tip-item warning">
                                    {t('sale.performance.tipsWarning')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Weekly Chart */}
                    <div className="chart-box mini-chart">
                        <h3>{t('sale.performance.weeklyTrend')}</h3>
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
