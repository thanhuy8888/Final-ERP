
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Calendar, BarChart3, Package, Users, Tag, Download, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import axios from 'axios';
import './Orders.css'; // Reusing existing styles for consistency

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Reports = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('sales');
    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Helper to format as YYYY-MM-DD in local time
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
    const [salesData, setSalesData] = useState({
        summary: { total_revenue: 0, total_orders: 0, aov: 0 },
        revenue_chart: [],
        store_chart: []
    });

    const tabs = [
        { id: 'sales', label: 'Sales Reports', icon: <BarChart3 size={18} /> },
        { id: 'inventory', label: 'Inventory Reports', icon: <Package size={18} /> },
        { id: 'customers', label: 'Customer Analytics', icon: <Users size={18} /> },
        { id: 'promotions', label: 'Promotion Analytics', icon: <Tag size={18} /> }
    ];

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8081/Final-ERP/api/admin/reports.php', {
                params: {
                    type: activeTab,
                    start_date: dateRange.start,
                    end_date: dateRange.end
                }
            });

            // Generic handler: response structure matches state structure roughly
            // For production, might want separate states, but for now we reuse generic object key mapping
            setSalesData(response.data);
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

    const handleExport = () => {
        let headers = [];
        let rows = [];
        let filename = '';

        if (activeTab === 'sales' && salesData?.revenue_chart?.length > 0) {
            headers = ['Date', 'Revenue'];
            rows = salesData.revenue_chart.map(item => [item.date, item.revenue]);
            filename = `sales_report_${dateRange.start}_to_${dateRange.end}.csv`;
        } else if (activeTab === 'inventory' && salesData?.low_stock_list?.length > 0) {
            headers = ['Product', 'SKU', 'Store', 'Quantity', 'Last Updated'];
            rows = salesData.low_stock_list.map(item => [
                item.product_name,
                item.sku,
                item.store_name,
                item.quantity_on_hand,
                item.last_updated
            ]);
            filename = `inventory_report_${dateRange.start}_to_${dateRange.end}.csv`;
        } else if (activeTab === 'customers' && salesData?.growth_chart?.length > 0) {
            headers = ['Date', 'New Customers'];
            rows = salesData.growth_chart.map(item => [item.date, item.new_customers]);
            filename = `customer_report_${dateRange.start}_to_${dateRange.end}.csv`;
        } else if (activeTab === 'promotions' && salesData?.top_promotions?.length > 0) {
            headers = ['Code', 'Name', 'Type', 'Value', 'Status'];
            rows = salesData.top_promotions.map(item => [
                item.promotion_code,
                item.promotion_name,
                item.discount_type,
                item.discount_value,
                item.status
            ]);
            filename = `promotion_report_${dateRange.start}_to_${dateRange.end}.csv`;
        } else {
            alert('No data available to export for this tab.');
            return;
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Chart Configs ---
    const revenueChartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false },
        },
        maintainAspectRatio: false,
    };

    const revenueChartData = {
        labels: salesData?.revenue_chart?.map(item => item.date) || [],
        datasets: [
            {
                label: 'Revenue',
                data: salesData?.revenue_chart?.map(item => item.revenue) || [],
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220, 38, 38, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const storeChartData = {
        labels: salesData?.store_chart?.map(item => item.store_name || 'Unknown Store') || [],
        datasets: [
            {
                label: 'Orders',
                data: salesData?.store_chart?.map(item => item.order_count) || [],
                backgroundColor: '#3b82f6',
            },
        ],
    };

    return (
        <div className="admin-page-container">
            {/* --- Header --- */}
            <div className="admin-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Reporting & Analytics</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Business insights and performance metrics.</p>
                </div>

                {/* Global Actions */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'white',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '2px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <Calendar size={18} color="#64748b" style={{ marginRight: '10px' }} />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: '0.9rem',
                                color: '#0f172a',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ margin: '0 12px', color: '#94a3b8', fontWeight: '600' }}>—</span>
                        <Calendar size={18} color="#64748b" style={{ marginRight: '10px' }} />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: '0.9rem',
                                color: '#0f172a',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                    <button
                        className="btn-modern primary"
                        onClick={handleExport}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            {/* --- Tabs Navigation --- */}
            <div style={{
                display: 'flex',
                gap: '4px',
                borderBottom: '1px solid #e2e8f0',
                marginBottom: '24px'
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid #dc2626' : '2px solid transparent',
                            color: activeTab === tab.id ? '#dc2626' : '#64748b',
                            fontWeight: activeTab === tab.id ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.9rem'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* --- Content Area --- */}
            <div style={{ minHeight: '400px' }}>

                {activeTab === 'sales' && (
                    <div className="report-tab-content">
                        {/* KPI Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px' }}>
                                    <DollarSign size={24} color="#10b981" />
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '4px' }}>Total Revenue</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salesData.summary?.total_revenue || 0)}
                                    </h3>
                                </div>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px' }}>
                                    <ShoppingBag size={24} color="#3b82f6" />
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '4px' }}>Total Orders</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                        {salesData.summary?.total_orders || 0}
                                    </h3>
                                </div>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: '#fff7ed', padding: '12px', borderRadius: '8px' }}>
                                    <TrendingUp size={24} color="#f97316" />
                                </div>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '4px' }}>Avg. Order Value</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salesData.summary?.aov || 0)}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '400px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Revenue Over Time</h3>
                                <div style={{ height: '320px' }}>
                                    <Line options={revenueChartOptions} data={revenueChartData} />
                                </div>
                            </div>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '400px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Orders by Store</h3>
                                <div style={{ height: '320px' }}>
                                    <Bar options={{ ...revenueChartOptions, indexAxis: 'y' }} data={storeChartData} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="report-tab-content">
                        {/* KPI Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '8px' }}>
                                        <DollarSign size={20} color="#10b981" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Stock Value</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salesData.summary?.total_stock_value || 0)}
                                </h3>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px' }}>
                                        <TrendingUp size={20} color="#3b82f6" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Turnover Rate</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {salesData.summary?.turnover_rate || 0}%
                                </h3>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#fff7ed', padding: '10px', borderRadius: '8px' }}>
                                        <Package size={20} color="#f97316" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Low Stock</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {salesData.summary?.low_stock_count || 0}
                                </h3>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '8px' }}>
                                        <Tag size={20} color="#ef4444" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Out of Stock</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626' }}>
                                    {salesData.summary?.out_of_stock_count || 0}
                                </h3>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '400px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Stock Value by Category</h3>
                                <div style={{ height: '320px' }}>
                                    <Bar
                                        data={{
                                            labels: salesData?.category_chart?.map(item => item.category_name) || [],
                                            datasets: [{
                                                label: 'Stock Value',
                                                data: salesData?.category_chart?.map(item => item.stock_value) || [],
                                                backgroundColor: '#8b5cf6',
                                                borderRadius: 4
                                            }]
                                        }}
                                        options={{ ...revenueChartOptions, indexAxis: 'y' }}
                                    />
                                </div>
                            </div>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '400px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Inventory Aging</h3>
                                <div style={{ height: '320px' }}>
                                    <Bar
                                        data={{
                                            labels: salesData?.aging_chart?.map(item => item.age_group) || [],
                                            datasets: [{
                                                label: 'Items Count',
                                                data: salesData?.aging_chart?.map(item => item.item_count) || [],
                                                backgroundColor: '#f59e0b',
                                                borderRadius: 4
                                            }]
                                        }}
                                        options={revenueChartOptions}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Low Stock Table */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Low Stock Alerts (Top 10)</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                                        <th style={{ padding: '12px' }}>Product</th>
                                        <th style={{ padding: '12px' }}>SKU</th>
                                        <th style={{ padding: '12px' }}>Store</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Qty</th>
                                        <th style={{ padding: '12px' }}>Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData?.low_stock_list?.length > 0 ? (
                                        salesData.low_stock_list.map((item, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px', fontWeight: '500', color: '#0f172a' }}>{item.product_name}</td>
                                                <td style={{ padding: '12px', color: '#64748b' }}>{item.sku}</td>
                                                <td style={{ padding: '12px' }}>{item.store_name}</td>
                                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: item.quantity_on_hand == 0 ? '#ef4444' : '#f59e0b' }}>
                                                    {item.quantity_on_hand}
                                                </td>
                                                <td style={{ padding: '12px', color: '#94a3b8' }}>{item.last_updated}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No low stock alerts.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'customers' && (
                    <div className="report-tab-content">
                        {/* KPI Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px' }}>
                                        <Users size={20} color="#3b82f6" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>New Customers</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {salesData.summary?.new_customers || 0}
                                </h3>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '8px' }}>
                                        <Users size={20} color="#22c55e" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Returning Customers</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {salesData.summary?.returning_customers || 0}
                                </h3>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px' }}>
                                        <DollarSign size={20} color="#eab308" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Avg CLV</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salesData.summary?.avg_clv || 0)}
                                </h3>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#fce7f3', padding: '10px', borderRadius: '8px' }}>
                                        <Users size={20} color="#ec4899" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Customers</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {salesData.summary?.total_customers || 0}
                                </h3>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '400px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Customer Growth</h3>
                                <div style={{ height: '320px' }}>
                                    <Line
                                        data={{
                                            labels: salesData?.growth_chart?.map(item => item.date) || [],
                                            datasets: [{
                                                label: 'New Customers',
                                                data: salesData?.growth_chart?.map(item => item.new_customers) || [],
                                                borderColor: '#3b82f6',
                                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                tension: 0.3
                                            }]
                                        }}
                                        options={revenueChartOptions}
                                    />
                                </div>
                            </div>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '400px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Membership Tier Distribution</h3>
                                <div style={{ height: '320px' }}>
                                    <Bar
                                        data={{
                                            labels: salesData?.tier_chart?.map(item => item.tier_name) || [],
                                            datasets: [{
                                                label: 'Customers',
                                                data: salesData?.tier_chart?.map(item => item.customer_count) || [],
                                                backgroundColor: ['#cd7f32', '#94a3b8', '#fbbf24', '#a78bfa', '#22d3ee'],
                                                borderRadius: 4
                                            }]
                                        }}
                                        options={revenueChartOptions}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'promotions' && (
                    <div className="report-tab-content">
                        {/* KPI Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px' }}>
                                        <Tag size={20} color="#f59e0b" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Discount Cost</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salesData.summary?.total_discount || 0)}
                                </h3>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '8px' }}>
                                        <ShoppingBag size={20} color="#10b981" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Orders with Promo</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {salesData.summary?.orders_with_promo || 0}
                                </h3>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px' }}>
                                        <DollarSign size={20} color="#3b82f6" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Revenue with Promo</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salesData.summary?.revenue_with_promo || 0)}
                                </h3>
                            </div>
                            <div className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ background: '#fce7f3', padding: '10px', borderRadius: '8px' }}>
                                        <Tag size={20} color="#ec4899" />
                                    </div>
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Active Promotions</span>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                    {salesData.summary?.active_promotions || 0}
                                </h3>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '400px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Promotion Usage Over Time</h3>
                                <div style={{ height: '320px' }}>
                                    <Line
                                        data={{
                                            labels: salesData?.usage_chart?.map(item => item.date) || [],
                                            datasets: [{
                                                label: 'Orders with Promotions',
                                                data: salesData?.usage_chart?.map(item => item.orders_with_promo) || [],
                                                borderColor: '#f59e0b',
                                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                                tension: 0.3
                                            }]
                                        }}
                                        options={revenueChartOptions}
                                    />
                                </div>
                            </div>
                            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '400px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Promo vs Non-Promo Orders</h3>
                                <div style={{ height: '320px' }}>
                                    <Bar
                                        data={{
                                            labels: ['With Promo', 'Without Promo'],
                                            datasets: [{
                                                label: 'Orders',
                                                data: [
                                                    salesData.summary?.orders_with_promo || 0,
                                                    salesData.summary?.orders_without_promo || 0
                                                ],
                                                backgroundColor: ['#10b981', '#94a3b8'],
                                                borderRadius: 4
                                            }]
                                        }}
                                        options={revenueChartOptions}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Top Promotions Table */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>Active Promotions</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                                        <th style={{ padding: '12px' }}>Code</th>
                                        <th style={{ padding: '12px' }}>Name</th>
                                        <th style={{ padding: '12px' }}>Type</th>
                                        <th style={{ padding: '12px', textAlign: 'right' }}>Value</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData?.top_promotions?.length > 0 ? (
                                        salesData.top_promotions.map((promo, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px', fontWeight: '600', color: '#0f172a' }}>{promo.promotion_code}</td>
                                                <td style={{ padding: '12px' }}>{promo.promotion_name}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        background: promo.discount_type === 'percentage' ? '#dbeafe' : '#fef3c7',
                                                        color: promo.discount_type === 'percentage' ? '#1e40af' : '#92400e',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        {promo.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#f59e0b' }}>
                                                    {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.discount_value)}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        background: promo.status === 'active' ? '#dcfce7' : '#f1f5f9',
                                                        color: promo.status === 'active' ? '#166534' : '#475569',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        {promo.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No active promotions.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Reports;
