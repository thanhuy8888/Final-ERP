import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats.php');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>Dashboard</h1>
            </div>

            <div className="stats-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid #3498db' }}>
                    <h3>Sản phẩm</h3>
                    <p className="stat-value">{stats?.product_count || 0}</p>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #2ecc71' }}>
                    <h3>Đơn hàng</h3>
                    <p className="stat-value">{stats?.order_count || 0}</p>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f1c40f' }}>
                    <h3>Khách hàng</h3>
                    <p className="stat-value">{stats?.customer_count || 0}</p>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #e74c3c' }}>
                    <h3>Doanh thu</h3>
                    <p className="stat-value">{parseInt(stats?.revenue || 0).toLocaleString()}đ</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
