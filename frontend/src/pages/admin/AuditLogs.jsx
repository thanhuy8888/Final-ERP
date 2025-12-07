import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';

const AuditLogs = () => {
    const { t } = useTranslation();
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({ page: 1, total_pages: 1 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs(1);
    }, []);

    const fetchLogs = async (page) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/audit_logs.php?page=${page}`);
            setLogs(res.data.data);
            setMeta({ page: res.data.page, total_pages: res.data.total_pages });
        } catch (err) {
            console.error("Failed to fetch logs", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>{t('admin.auditLogs') || 'System Audit Logs'}</h1>
            </div>

            <div className="admin-card">
                {loading ? <p>Loading...</p> : (
                    <>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                    <th>Details</th>
                                    <th>IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No logs found</td></tr>
                                ) : (
                                    logs.map(log => (
                                        <tr key={log.id}>
                                            <td style={{ fontSize: '13px' }}>{new Date(log.created_at).toLocaleString()}</td>
                                            <td><strong>{log.username}</strong></td>
                                            <td><span style={{ padding: '2px 5px', borderRadius: '3px', background: log.role === 'admin' ? '#e2e3ff' : '#eee', fontSize: '11px' }}>{log.role}</span></td>
                                            <td style={{ color: '#007bff' }}>{log.action}</td>
                                            <td style={{ maxWidth: '300px', fontSize: '13px' }}>{log.details}</td>
                                            <td style={{ fontSize: '12px', color: '#666' }}>{log.ip_address}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button
                                disabled={meta.page <= 1}
                                onClick={() => fetchLogs(meta.page - 1)}
                                style={{ padding: '5px 10px' }}
                            >
                                Previous
                            </button>
                            <span>Page {meta.page} of {meta.total_pages}</span>
                            <button
                                disabled={meta.page >= meta.total_pages}
                                onClick={() => fetchLogs(meta.page + 1)}
                                style={{ padding: '5px 10px' }}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
