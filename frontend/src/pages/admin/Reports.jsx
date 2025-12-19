import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { 
    Calendar, BarChart3, Package, Users, Tag, Download, 
    ShoppingBag, DollarSign, TrendingUp, ArrowUpRight 
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
    Filler // Import Filler for area charts
} from 'chart.js';
import axios from 'axios';
import './Reports.css'; // Link to the new CSS

// Register ChartJS components
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

const Reports = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('sales');
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const formatDate = (date) => {
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().split('T')[0];
        };
        return {
            start: formatDate(startOfMonth),
            end: formatDate(today)
        };
    });
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState({
        summary: {},
        revenue_chart: [],
        store_chart: [],
        low_stock_list: [],
        growth_chart: [],
        top_promotions: []
    });

    const tabs = [
        { id: 'sales', label: 'Sales Overview', icon: <BarChart3 size={18} /> },
        { id: 'inventory', label: 'Inventory', icon: <Package size={18} /> },
        { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
        { id: 'promotions', label: 'Promotions', icon: <Tag size={18} /> }
    ];

    const fetchReportData = async () => {
        setLoading(true);
        try {
            // Mocking data for visualization if API fails or for demo
            // Replace with actual API call:
            const response = await axios.get('http://localhost:8081/Final-ERP/api/admin/reports.php', {
                 params: { type: activeTab, start_date: dateRange.start, end_date: dateRange.end }
            });
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [activeTab, dateRange]);

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    };

    // --- Chart Configurations for "Beautiful" Look ---
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
                bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 13 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" }, color: '#9ca3af' }
            },
            y: {
                border: { display: false },
                grid: { color: '#f3f4f6', borderDash: [5, 5] },
                ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" }, color: '#9ca3af', padding: 10 }
            }
        },
        elements: {
            line: { tension: 0.4 }, // Smooth curves
            bar: { borderRadius: 6 },
            point: { radius: 0, hitRadius: 10, hoverRadius: 6 }
        }
    };

    // Helper to create gradient
    const createGradient = (ctx, colorStart, colorEnd) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    };

    // --- Render Functions ---

    const renderSalesTab = () => {
        const revenueData = {
            labels: reportData?.revenue_chart?.map(item => item.date) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Revenue',
                data: reportData?.revenue_chart?.map(item => item.revenue) || [1200, 1900, 3000, 5000, 2300, 3400, 4500],
                borderColor: '#6366f1',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    return createGradient(ctx, 'rgba(99, 102, 241, 0.4)', 'rgba(99, 102, 241, 0.0)');
                },
                fill: true,
                borderWidth: 3
            }]
        };

        const storeData = {
            labels: reportData?.store_chart?.map(item => item.store_name) || ['Store A', 'Store B', 'Store C'],
            datasets: [{
                label: 'Orders',
                data: reportData?.store_chart?.map(item => item.order_count) || [150, 230, 180],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                borderWidth: 0
            }]
        };

        return (
            <>
                <div className="kpi-grid">
                    <div className="kpi-card kpi-primary">
                        <div className="kpi-header">
                            <div className="kpi-icon"><DollarSign /></div>
                            <span className="kpi-label">Total Revenue</span>
                        </div>
                        <div className="kpi-value">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reportData.summary?.total_revenue || 0)}
                        </div>
                    </div>
                    <div className="kpi-card kpi-info">
                        <div className="kpi-header">
                            <div className="kpi-icon"><ShoppingBag /></div>
                            <span className="kpi-label">Total Orders</span>
                        </div>
                        <div className="kpi-value">{reportData.summary?.total_orders || 0}</div>
                    </div>
                    <div className="kpi-card kpi-warning">
                        <div className="kpi-header">
                            <div className="kpi-icon"><TrendingUp /></div>
                            <span className="kpi-label">Avg. Order Value</span>
                        </div>
                        <div className="kpi-value">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reportData.summary?.aov || 0)}
                        </div>
                    </div>
                </div>

                <div className="charts-grid">
                    <div className="chart-card">
                        <div className="chart-header"><h3>Revenue Analytics</h3></div>
                        <div className="chart-container">
                            <Line options={commonOptions} data={revenueData} />
                        </div>
                    </div>
                    <div className="chart-card">
                        <div className="chart-header"><h3>Orders by Store</h3></div>
                        <div className="chart-container">
                            <Doughnut 
                                options={{
                                    ...commonOptions, 
                                    cutout: '70%',
                                    scales: { x: { display: false }, y: { display: false } }
                                }} 
                                data={storeData} 
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const renderInventoryTab = () => (
        <>
            <div className="kpi-grid">
                <div className="kpi-card kpi-success">
                    <div className="kpi-header">
                        <div className="kpi-icon"><DollarSign /></div>
                        <span className="kpi-label">Stock Value</span>
                    </div>
                    <div className="kpi-value">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(reportData.summary?.total_stock_value || 0)}
                    </div>
                </div>
                <div className="kpi-card kpi-danger">
                    <div className="kpi-header">
                        <div className="kpi-icon"><Tag /></div>
                        <span className="kpi-label">Low Stock Items</span>
                    </div>
                    <div className="kpi-value">{reportData.summary?.low_stock_count || 0}</div>
                </div>
                <div className="kpi-card kpi-info">
                    <div className="kpi-header">
                        <div className="kpi-icon"><Package /></div>
                        <span className="kpi-label">Total Items</span>
                    </div>
                    <div className="kpi-value">{reportData.summary?.total_items || 0}</div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-header"><h3>Low Stock Alerts</h3></div>
                <table className="modern-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>SKU</th>
                            <th>Store</th>
                            <th>Quantity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData?.low_stock_list?.length > 0 ? (
                            reportData.low_stock_list.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.product_name}</td>
                                    <td>{item.sku}</td>
                                    <td>{item.store_name}</td>
                                    <td style={{ fontWeight: 'bold' }}>{item.quantity_on_hand}</td>
                                    <td>
                                        <span className={`badge ${item.quantity_on_hand == 0 ? 'danger' : 'warning'}`}>
                                            {item.quantity_on_hand == 0 ? 'Out of Stock' : 'Low Stock'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: '#9ca3af' }}>No low stock alerts</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-title">
                    <h1>Analytics Dashboard</h1>
                    <p>Overview of your business performance</p>
                </div>
                <div className="header-actions">
                    <div className="date-range-picker">
                        <Calendar size={18} color="#6b7280" style={{ marginRight: '8px' }} />
                        <input
                            type="date"
                            className="date-input"
                            value={dateRange.start}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                        />
                        <span className="date-separator">to</span>
                        <input
                            type="date"
                            className="date-input"
                            value={dateRange.end}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                        />
                    </div>
                    <button className="btn-export">
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="dashboard-content">
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: '#9ca3af' }}>Loading data...</div>
                ) : (
                    <>
                        {activeTab === 'sales' && renderSalesTab()}
                        {activeTab === 'inventory' && renderInventoryTab()}
                        {activeTab === 'customers' && (
                            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px' }}>
                                <Users size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                                <h3>Customer Analytics</h3>
                                <p style={{ color: '#6b7280' }}>Feature under development. Coming soon!</p>
                            </div>
                        )}
                        {activeTab === 'promotions' && (
                             <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px' }}>
                                <Tag size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                                <h3>Promotion Analytics</h3>
                                <p style={{ color: '#6b7280' }}>Feature under development. Coming soon!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Reports;