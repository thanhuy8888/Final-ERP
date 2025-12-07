import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
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
    ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './Reports.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const Reports = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');
    const [period, setPeriod] = useState('daily');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    const [summaryData, setSummaryData] = useState(null);
    const [detailedData, setDetailedData] = useState(null);
    const [productData, setProductData] = useState(null);
    const [salesData, setSalesData] = useState(null);
    const [statusData, setStatusData] = useState(null);

    useEffect(() => {
        fetchReports();
    }, [startDate, endDate, period, activeTab]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = `start_date=${startDate}&end_date=${endDate}&period=${period}`;

            if (activeTab === 'summary' || activeTab === 'all') {
                const res = await api.get(`/admin/reports.php?action=summary&${params}`);
                setSummaryData(res.data);
            }

            if (activeTab === 'detailed' || activeTab === 'all') {
                const res = await api.get(`/admin/reports.php?action=detailed&${params}`);
                setDetailedData(res.data);
            }

            if (activeTab === 'products' || activeTab === 'all') {
                const res = await api.get(`/admin/reports.php?action=by_product&${params}`);
                setProductData(res.data);
            }

            if (activeTab === 'sales' || activeTab === 'all') {
                const res = await api.get(`/admin/reports.php?action=by_salesperson&${params}`);
                setSalesData(res.data);
            }

            if (activeTab === 'status' || activeTab === 'all') {
                const res = await api.get(`/admin/reports.php?action=by_status&${params}`);
                setStatusData(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = async (action) => {
        const params = `action=${action}&start_date=${startDate}&end_date=${endDate}&period=${period}&format=csv`;
        window.open(`http://localhost/Final-ERP/api/admin/reports.php?${params}`, '_blank');
    };

    const formatCurrency = (value) => {
        return parseInt(value || 0).toLocaleString() + 'đ';
    };

    const formatPercent = (value) => {
        const v = parseFloat(value || 0);
        return (v >= 0 ? '+' : '') + v.toFixed(1) + '%';
    };

    // Chart data for detailed report
    const detailedChartData = {
        labels: detailedData?.data?.map(d => d.period_label) || [],
        datasets: [{
            label: t('reports.revenue'),
            data: detailedData?.data?.map(d => d.revenue) || [],
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
            borderColor: '#3498db',
            borderWidth: 2,
            borderRadius: 6,
        }]
    };

    // Orders trend line
    const ordersTrendData = {
        labels: detailedData?.data?.map(d => d.period_label) || [],
        datasets: [{
            label: t('reports.orders'),
            data: detailedData?.data?.map(d => d.orders) || [],
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            tension: 0.4,
            fill: true,
        }]
    };

    // Status doughnut
    const statusChartData = {
        labels: statusData?.map(s => t(`orders.status.${s.status}`)) || [],
        datasets: [{
            data: statusData?.map(s => s.order_count) || [],
            backgroundColor: [
                '#f39c12', '#3498db', '#9b59b6', '#1abc9c', '#27ae60', '#e74c3c'
            ],
        }]
    };

    return (
        <div className="admin-reports">
            <div className="reports-header">
                <h1>📊 {t('reports.title')}</h1>
                <div className="date-filters">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span>→</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                        <option value="daily">{t('reports.daily')}</option>
                        <option value="weekly">{t('reports.weekly')}</option>
                        <option value="monthly">{t('reports.monthly')}</option>
                    </select>
                </div>
            </div>

            <div className="tabs">
                {['summary', 'detailed', 'products', 'sales', 'status'].map(tab => (
                    <button
                        key={tab}
                        className={activeTab === tab ? 'active' : ''}
                        onClick={() => setActiveTab(tab)}
                    >
                        {t(`reports.${tab}`)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>{t('common.loading')}</p>
                </div>
            ) : (
                <div className="reports-content">
                    {/* Summary Tab */}
                    {activeTab === 'summary' && summaryData && (
                        <div className="summary-section">
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <h3>{t('reports.totalRevenue')}</h3>
                                    <span className="value">{formatCurrency(summaryData.current.total_revenue)}</span>
                                    <span className={`growth ${summaryData.growth.revenue_percent >= 0 ? 'up' : 'down'}`}>
                                        {formatPercent(summaryData.growth.revenue_percent)}
                                    </span>
                                </div>
                                <div className="summary-card">
                                    <h3>{t('reports.totalOrders')}</h3>
                                    <span className="value">{summaryData.current.total_orders}</span>
                                    <span className={`growth ${summaryData.growth.orders_percent >= 0 ? 'up' : 'down'}`}>
                                        {formatPercent(summaryData.growth.orders_percent)}
                                    </span>
                                </div>
                                <div className="summary-card">
                                    <h3>{t('reports.avgOrderValue')}</h3>
                                    <span className="value">{formatCurrency(summaryData.current.avg_order_value)}</span>
                                </div>
                                <div className="summary-card">
                                    <h3>{t('reports.uniqueCustomers')}</h3>
                                    <span className="value">{summaryData.current.unique_customers}</span>
                                </div>
                            </div>
                            <button className="btn-export" onClick={() => downloadCSV('summary')}>
                                📥 {t('reports.exportCSV')}
                            </button>
                        </div>
                    )}

                    {/* Detailed Tab */}
                    {activeTab === 'detailed' && detailedData && (
                        <div className="detailed-section">
                            <div className="charts-row">
                                <div className="chart-card">
                                    <h3>{t('reports.revenueChart')}</h3>
                                    <Bar data={detailedChartData} options={{
                                        responsive: true,
                                        plugins: { legend: { display: false } }
                                    }} />
                                </div>
                                <div className="chart-card">
                                    <h3>{t('reports.ordersTrend')}</h3>
                                    <Line data={ordersTrendData} options={{
                                        responsive: true,
                                        plugins: { legend: { display: false } }
                                    }} />
                                </div>
                            </div>
                            <button className="btn-export" onClick={() => downloadCSV('detailed')}>
                                📥 {t('reports.exportCSV')}
                            </button>
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && productData && (
                        <div className="products-section">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>{t('reports.product')}</th>
                                        <th>{t('reports.quantity')}</th>
                                        <th>{t('reports.revenue')}</th>
                                        <th>{t('reports.orders')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productData.map((p, i) => (
                                        <tr key={p.id}>
                                            <td>{i + 1}</td>
                                            <td>{p.name}</td>
                                            <td>{p.total_quantity}</td>
                                            <td>{formatCurrency(p.total_revenue)}</td>
                                            <td>{p.order_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn-export" onClick={() => downloadCSV('by_product')}>
                                📥 {t('reports.exportCSV')}
                            </button>
                        </div>
                    )}

                    {/* Sales Tab */}
                    {activeTab === 'sales' && salesData && (
                        <div className="sales-section">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>{t('reports.salesperson')}</th>
                                        <th>{t('reports.orders')}</th>
                                        <th>{t('reports.revenue')}</th>
                                        <th>{t('reports.avgOrderValue')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData.length === 0 ? (
                                        <tr><td colSpan="5">{t('reports.noData')}</td></tr>
                                    ) : salesData.map((s, i) => (
                                        <tr key={s.id}>
                                            <td>{i + 1}</td>
                                            <td>{s.username}</td>
                                            <td>{s.total_orders}</td>
                                            <td>{formatCurrency(s.total_revenue)}</td>
                                            <td>{formatCurrency(s.avg_order_value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn-export" onClick={() => downloadCSV('by_salesperson')}>
                                📥 {t('reports.exportCSV')}
                            </button>
                        </div>
                    )}

                    {/* Status Tab */}
                    {activeTab === 'status' && statusData && (
                        <div className="status-section">
                            <div className="status-grid">
                                <div className="chart-card">
                                    <h3>{t('reports.ordersByStatus')}</h3>
                                    <Doughnut data={statusChartData} options={{
                                        responsive: true,
                                        plugins: { legend: { position: 'bottom' } }
                                    }} />
                                </div>
                                <div className="status-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>{t('reports.status')}</th>
                                                <th>{t('reports.orders')}</th>
                                                <th>{t('reports.amount')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statusData.map(s => (
                                                <tr key={s.status}>
                                                    <td>
                                                        <span className={`status-badge ${s.status}`}>
                                                            {t(`orders.status.${s.status}`)}
                                                        </span>
                                                    </td>
                                                    <td>{s.order_count}</td>
                                                    <td>{formatCurrency(s.total_amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <button className="btn-export" onClick={() => downloadCSV('by_status')}>
                                📥 {t('reports.exportCSV')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reports;
