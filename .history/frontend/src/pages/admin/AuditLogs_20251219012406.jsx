import { useState, useEffect } from 'react';
import { FileText, Filter, Activity, ChevronLeft, ChevronRight, User, Clock } from 'lucide-react';
import api from '../../api/axios';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({ page: 1, total_pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ user: '', action: '', startDate: '', endDate: '' });

    useEffect(() => { fetchLogs(1); }, []);

    const fetchLogs = async (page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page, ...filters });
            const res = await api.get(`/admin/audit_logs.php?${params}`);
            setLogs(res.data.data || []);
            setMeta({ page: res.data.page || 1, total_pages: res.data.total_pages || 1, total: res.data.total || 0 });
        } catch (err) { console.error('Failed to fetch logs', err); } 
        finally { setLoading(false); }
    };

    const handleFilterChange = (field, value) => { setFilters(prev => ({ ...prev, [field]: value })); };
    const applyFilters = () => { fetchLogs(1); };

    const getActionStyle = (action) => {
        const a = action.toLowerCase();
        if (a.includes('create')) return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
        if (a.includes('update')) return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
        if (a.includes('delete')) return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
    };

    // --- Styles ---
    const styles = {
        container: { padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#0f172a' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' },
        title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
        subtitle: { color: '#64748b', fontSize: '15px', margin: 0 },
        card: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '24px' },
        filterPanel: { padding: '24px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
        filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' },
        label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' },
        input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
        btnFilter: { marginTop: '16px', background: '#0f172a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
        td: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', verticalAlign: 'middle', color: '#334155' },
        actionBadge: (action) => {
            const s = getActionStyle(action);
            return { background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block' };
        },
        pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderTop: '1px solid #f1f5f9' },
        btnPage: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontWeight: '600', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Audit Logs</h1>
                    <p style={styles.subtitle}>System activity and change history.</p>
                </div>
            </div>

            <div style={styles.filterPanel}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={18} color="#0d9488" />
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Filter Activity</h3>
                </div>
                <div style={styles.filterGrid}>
                    <div><label style={styles.label}>User</label><input type="text" style={styles.input} placeholder="Search user..." value={filters.user} onChange={(e) => handleFilterChange('user', e.target.value)} /></div>
                    <div><label style={styles.label}>Action</label><input type="text" style={styles.input} placeholder="CREATE, UPDATE..." value={filters.action} onChange={(e) => handleFilterChange('action', e.target.value)} /></div>
                    <div><label style={styles.label}>Start Date</label><input type="date" style={styles.input} value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} /></div>
                    <div><label style={styles.label}>End Date</label><input type="date" style={styles.input} value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} /></div>
                </div>
                <button style={styles.btnFilter} onClick={applyFilters}>Apply Filters</button>
            </div>

            <div style={styles.card}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} color="#0d9488" /> Recent Activity
                    </h3>
                    <span style={{ fontSize: '13px', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' }}>Total: {meta.total}</span>
                </div>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading logs...</div>
                ) : (
                    <>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Timestamp</th>
                                    <th style={styles.th}>User</th>
                                    <th style={styles.th}>Action</th>
                                    <th style={styles.th}>Entity</th>
                                    <th style={styles.th}>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id} onMouseEnter={(e) => e.currentTarget.style.background = '#fcfdfe'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                                                <Clock size={14} /> {new Date(log.created_at).toLocaleString('vi-VN')}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}><User size={14} /></div>
                                                <span style={{ fontWeight: '600', color: '#0f172a' }}>{log.user_name || 'System'}</span>
                                            </div>
                                        </td>
                                        <td style={styles.td}><span style={styles.actionBadge(log.action)}>{log.action}</span></td>
                                        <td style={{...styles.td, fontFamily: 'monospace', color: '#64748b'}}>{log.entity_type} #{log.entity_id}</td>
                                        <td style={{...styles.td, color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                            {log.new_value ? `Changed to: ${log.new_value}` : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No logs found</td></tr>}
                            </tbody>
                        </table>
                        <div style={styles.pagination}>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>Page {meta.page} of {meta.total_pages}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button disabled={meta.page <= 1} onClick={() => fetchLogs(meta.page - 1)} style={{...styles.btnPage, opacity: meta.page <= 1 ? 0.5 : 1}}><ChevronLeft size={16} /> Previous</button>
                                <button disabled={meta.page >= meta.total_pages} onClick={() => fetchLogs(meta.page + 1)} style={{...styles.btnPage, opacity: meta.page >= meta.total_pages ? 0.5 : 1}}>Next <ChevronRight size={16} /></button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;