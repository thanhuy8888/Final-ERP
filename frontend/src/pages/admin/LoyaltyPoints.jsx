import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, History, PlusCircle, MinusCircle, User } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import './Orders.css';

const LoyaltyPoints = () => {
    const { success, error } = useToast();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Manual Adjust Modal
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [customers, setCustomers] = useState([]); // For dropdown
    const [adjustForm, setAdjustForm] = useState({ customer_id: '', points: 0, reason: '' });

    useEffect(() => {
        fetchLogs();
    }, []);

    // Search customers when opening modal (simple version: fetch all or top 20)
    useEffect(() => {
        if (showAdjustModal) {
            api.get('/admin/customers.php?limit=100').then(res => setCustomers(res.data.data));
        }
    }, [showAdjustModal]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/loyalty.php');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustSubmit = async (e) => {
        e.preventDefault();
        if (!adjustForm.customer_id) return;

        try {
            await api.post('/admin/loyalty.php', adjustForm);
            success('Points adjusted successfully');
            setShowAdjustModal(false);
            setAdjustForm({ customer_id: '', points: 0, reason: '' });
            fetchLogs();
        } catch (err) {
            error('Failed to adjust points');
        }
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Loyalty Points</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Track and manage customer loyalty history.</p>
                </div>
                <button
                    className="btn-modern primary"
                    onClick={() => setShowAdjustModal(true)}
                    style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                >
                    <PlusCircle size={16} /> Adjust Points
                </button>
            </div>

            <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th>Points</th>
                            <th>Reason</th>
                            <th>Staff</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id}>
                                <td style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    {new Date(log.created_at).toLocaleString('vi-VN')}
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{log.full_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{log.email}</div>
                                </td>
                                <td>
                                    <span className={`badge-soft`} style={{
                                        background: log.type === 'earn' ? '#dcfce7' : log.type === 'redeem' ? '#fee2e2' : '#f1f5f9',
                                        color: log.type === 'earn' ? '#166534' : log.type === 'redeem' ? '#991b1b' : '#334155',
                                        textTransform: 'uppercase', fontSize: '11px'
                                    }}>
                                        {log.type}
                                    </span>
                                </td>
                                <td style={{
                                    fontWeight: 700,
                                    color: log.points > 0 ? '#16a34a' : '#dc2626'
                                }}>
                                    {log.points > 0 ? '+' : ''}{log.points}
                                </td>
                                <td>{log.reason}</td>
                                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{log.staff_name || 'System'}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    No transaction history yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Adjust Modal */}
            {showAdjustModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Manual Point Adjustment</h2>
                            <button className="close-button" onClick={() => setShowAdjustModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAdjustSubmit} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Customer</label>
                                <select
                                    className="modern-input"
                                    value={adjustForm.customer_id}
                                    onChange={e => setAdjustForm({ ...adjustForm, customer_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Points (Use negative to subtract)</label>
                                <input
                                    type="number"
                                    className="modern-input"
                                    value={adjustForm.points}
                                    onChange={e => setAdjustForm({ ...adjustForm, points: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Reason</label>
                                <input
                                    type="text"
                                    className="modern-input"
                                    placeholder="e.g. Refund compensation, Bonus gift..."
                                    value={adjustForm.reason}
                                    onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-modern secondary" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                                <button type="submit" className="btn-modern primary" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}>Submit Adjustment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoyaltyPoints;
