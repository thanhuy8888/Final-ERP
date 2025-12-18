import { useState, useEffect } from 'react';
import { FileText, Filter, Calendar, User, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import './Orders.css';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({ page: 1, total_pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        user: '',
        action: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchLogs(1);
    }, []);

    const fetchLogs = async (page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page,
                ...filters
            });
            const res = await api.get(`/admin/audit_logs.php?${params}`);
            setLogs(res.data.data || []);
            setMeta({
                page: res.data.page || 1,
                total_pages: res.data.total_pages || 1,
                total: res.data.total || 0
            });
        } catch (err) {
            console.error('Failed to fetch logs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        fetchLogs(1);
    };

    const getActionColor = (action) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('create')) return '#10b981';
        if (actionLower.includes('update')) return '#f59e0b';
        if (actionLower.includes('delete')) return '#ef4444';
        return '#3b82f6';
    };

    const getActionBg = (action) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('create')) return '#ecfdf5';
        if (actionLower.includes('update')) return '#fef3c7';
        if (actionLower.includes('delete')) return '#fee2e2';
        return '#eff6ff';
    };

    return (
        <div>
            {/* Header */}
            <div className="admin-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                        Audit Logs
                    </h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        System activity and change history.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Filter size={18} color="#64748b" />
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>Filters</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '6px', display: 'block' }}>User</label>
                        <input
                            type="text"
                            placeholder="Search by user..."
                            value={filters.user}
                            onChange={(e) => handleFilterChange('user', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '6px', display: 'block' }}>Action</label>
                        <input
                            type="text"
                            placeholder="e.g., CREATE, UPDATE..."
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '6px', display: 'block' }}>Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '6px', display: 'block' }}>End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem' }}
                        />
                    </div>
                </div>
                <button
                    onClick={applyFilters}
                    className="btn-modern primary"
                    style={{ marginTop: '16px', background: '#3b82f6' }}
                >
                    Apply Filters
                </button>
            </div>

            {/* Logs Table */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} color="#3b82f6" />
                        Activity Log
                    </h3>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        Total: {meta.total} entries
                    </span>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', color: '#64748b', fontWeight: '600' }}>Timestamp</th>
                                        <th style={{ padding: '12px', color: '#64748b', fontWeight: '600' }}>User</th>
                                        <th style={{ padding: '12px', color: '#64748b', fontWeight: '600' }}>Action</th>
                                        <th style={{ padding: '12px', color: '#64748b', fontWeight: '600' }}>Entity</th>
                                        <th style={{ padding: '12px', color: '#64748b', fontWeight: '600' }}>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                                No audit logs found
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map(log => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px', color: '#64748b', fontSize: '0.8125rem' }}>
                                                    {new Date(log.created_at).toLocaleString('vi-VN')}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <User size={16} color="#3b82f6" />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.875rem' }}>
                                                                {log.user_name || 'System'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{
                                                        background: getActionBg(log.action),
                                                        color: getActionColor(log.action),
                                                        padding: '4px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b' }}>
                                                    {log.entity_type} #{log.entity_id}
                                                </td>
                                                <td style={{ padding: '16px', color: '#64748b', maxWidth: '300px', fontSize: '0.8125rem' }}>
                                                    {log.new_value ? `Changed to: ${log.new_value.substring(0, 50)}...` : '-'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Page {meta.page} of {meta.total_pages}
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    disabled={meta.page <= 1}
                                    onClick={() => fetchLogs(meta.page - 1)}
                                    className="btn-modern secondary"
                                    style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <button
                                    disabled={meta.page >= meta.total_pages}
                                    onClick={() => fetchLogs(meta.page + 1)}
                                    className="btn-modern secondary"
                                    style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
