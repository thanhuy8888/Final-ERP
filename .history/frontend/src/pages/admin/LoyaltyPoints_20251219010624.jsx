import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PlusCircle, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const LoyaltyPoints = () => {
    const { success, error } = useToast();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Manual Adjust Modal
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [adjustForm, setAdjustForm] = useState({ customer_id: '', points: 0, reason: '' });

    useEffect(() => { fetchLogs(); }, []);
    useEffect(() => {
        if (showAdjustModal) api.get('/admin/customers.php?limit=100').then(res => setCustomers(res.data.data));
    }, [showAdjustModal]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/loyalty.php');
            setLogs(res.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
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
        } catch (err) { error('Failed to adjust points'); }
    };

    // Inline Styles
    const styles = {
        container: { padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
        title: { fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' },
        subtitle: { color: '#64748b', fontSize: '15px', marginTop: '4px' },
        btnPrimary: { background: '#E31E24', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(227, 30, 36, 0.2)' },
        card: { background: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
        td: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', verticalAlign: 'middle' },
        badge: (type) => {
            const isEarn = type === 'earn';
            const isRedeem = type === 'redeem';
            return {
                background: isEarn ? '#dcfce7' : isRedeem ? '#fee2e2' : '#f1f5f9',
                color: isEarn ? '#166534' : isRedeem ? '#991b1b' : '#334155',
                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
            };
        },
        modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', borderRadius: '20px', width: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' },
        modalHeader: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        modalBody: { padding: '24px' },
        formGroup: { marginBottom: '16px' },
        label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' },
        input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' },
        modalFooter: { padding: '20px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
        btnCancel: { background: 'white', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', color: '#64748b', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
            
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Loyalty Points History</h1>
                    <p style={styles.subtitle}>Track and manage customer loyalty transactions.</p>
                </div>
                <button style={styles.btnPrimary} onClick={() => setShowAdjustModal(true)}>
                    <PlusCircle size={18} /> Adjust Points
                </button>
            </div>

            <div style={styles.card}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading history...</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Customer</th>
                                <th style={styles.th}>Type</th>
                                <th style={styles.th}>Points</th>
                                <th style={styles.th}>Reason</th>
                                <th style={styles.th}>Staff</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td style={{...styles.td, fontSize: '13px', color: '#64748b'}}>
                                        {new Date(log.created_at).toLocaleString('vi-VN')}
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{log.full_name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{log.email}</div>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.badge(log.type)}>{log.type}</span>
                                    </td>
                                    <td style={{...styles.td, fontWeight: 800, color: log.points > 0 ? '#16a34a' : '#dc2626'}}>
                                        {log.points > 0 ? '+' : ''}{log.points}
                                    </td>
                                    <td style={styles.td}>{log.reason}</td>
                                    <td style={{...styles.td, fontSize: '13px', color: '#64748b'}}>{log.staff_name || 'System'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showAdjustModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Manual Point Adjustment</h3>
                            <button onClick={() => setShowAdjustModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
                        </div>
                        
                        <form onSubmit={handleAdjustSubmit}>
                            <div style={styles.modalBody}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Customer</label>
                                    <select
                                        style={styles.input}
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
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Points (Negative to subtract)</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={adjustForm.points}
                                        onChange={e => setAdjustForm({ ...adjustForm, points: parseInt(e.target.value) })}
                                        required
                                    />
                                </div>
                                
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Reason</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        placeholder="e.g. Refund compensation..."
                                        value={adjustForm.reason}
                                        onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.modalFooter}>
                                <button type="button" style={styles.btnCancel} onClick={() => setShowAdjustModal(false)}>Cancel</button>
                                <button type="submit" style={styles.btnPrimary}>Submit Adjustment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoyaltyPoints;