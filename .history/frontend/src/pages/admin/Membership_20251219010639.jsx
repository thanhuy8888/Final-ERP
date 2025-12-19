import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/axios';
import { Save, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const Membership = () => {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => { fetchTiers(); }, []);

    const fetchTiers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/membership.php');
            setTiers(res.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleUpdate = async (tier) => {
        try {
            await api.put('/admin/membership.php', { id: tier.id, min_spent: tier.min_spent, bonus_rate: tier.bonus_rate });
            success(`Updated ${tier.tier_display}`);
        } catch (err) { error('Failed to update'); }
    };

    const confirmCalculate = async () => {
        setShowConfirmModal(false);
        setCalculating(true);
        try {
            const res = await api.post('/admin/membership.php', { action: 'calculate' });
            success(res.data.message);
        } catch (err) { error('Calculation failed'); } 
        finally { setCalculating(false); }
    };

    const handleChange = (index, field, value) => {
        const newTiers = [...tiers];
        newTiers[index][field] = value;
        setTiers(newTiers);
    };

    // Inline Styles
    const styles = {
        container: { padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
        title: { fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' },
        subtitle: { color: '#64748b', fontSize: '15px', marginTop: '4px' },
        card: { background: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
        td: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', verticalAlign: 'middle' },
        input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontSize: '14px', fontFamily: 'inherit' },
        btnSave: { background: '#E31E24', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' },
        btnRefresh: { background: 'white', border: '1px solid #E31E24', color: '#E31E24', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
        badge: (tier) => {
            const colors = {
                gold: { bg: '#fefce8', text: '#854d0e' },
                platinum: { bg: '#e0e7ff', text: '#3730a3' },
                diamond: { bg: '#ecfeff', text: '#155e75' },
                silver: { bg: '#f8fafc', text: '#475569' },
                bronze: { bg: '#fff7ed', text: '#9a3412' }
            };
            const s = colors[tier.toLowerCase()] || colors.bronze;
            return { background: s.bg, color: s.text, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' };
        },
        infoBox: { background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '12px', padding: '20px', display: 'flex', gap: '16px', marginTop: '24px' },
        modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', borderRadius: '20px', padding: '32px', width: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
        btnCancel: { background: '#f1f5f9', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', color: '#64748b', cursor: 'pointer' },
        btnConfirm: { background: '#E31E24', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '600', color: 'white', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
            
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Membership Tiers</h1>
                    <p style={styles.subtitle}>Configure rules and thresholds for customer loyalty tiers.</p>
                </div>
                <button style={styles.btnRefresh} onClick={() => setShowConfirmModal(true)} disabled={calculating}>
                    <RefreshCw size={18} className={calculating ? 'spin' : ''} />
                    {calculating ? 'Calculating...' : 'Auto-Update Customers'}
                </button>
            </div>

            <div style={styles.card}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Tier Level</th>
                            <th style={styles.th}>Min. Spending (VND)</th>
                            <th style={styles.th}>Point Bonus Rate (x)</th>
                            <th style={{...styles.th, textAlign: 'center'}}>Badge Preview</th>
                            <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiers.map((tier, index) => (
                            <tr key={tier.id}>
                                <td style={{...styles.td, fontWeight: 700, fontSize: '15px'}}>{tier.tier_display}</td>
                                <td style={styles.td}>
                                    <input type="number" style={styles.input} value={tier.min_spent} onChange={(e) => handleChange(index, 'min_spent', e.target.value)} />
                                </td>
                                <td style={styles.td}>
                                    <input type="number" step="0.05" style={{...styles.input, width: '80px'}} value={tier.bonus_rate} onChange={(e) => handleChange(index, 'bonus_rate', e.target.value)} />
                                </td>
                                <td style={{...styles.td, textAlign: 'center'}}>
                                    <span style={styles.badge(tier.tier_key)}>{tier.tier_key}</span>
                                </td>
                                <td style={{...styles.td, textAlign: 'right'}}>
                                    <button style={styles.btnSave} onClick={() => handleUpdate(tier)}>
                                        <Save size={16} /> Save
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={styles.infoBox}>
                <div style={{ color: '#2563eb', background: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(37,99,235,0.1)' }}>
                    <Shield size={20} />
                </div>
                <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#1e40af', fontSize: '16px' }}>How it works</h4>
                    <p style={{ margin: 0, color: '#1e3a8a', fontSize: '14px', lineHeight: '1.5' }}>
                        The system assigns tiers based on <strong>Lifetime Spending</strong>. 
                        Customers are automatically assigned the highest tier they qualify for when you click "Auto-Update".
                    </p>
                </div>
            </div>

            {showConfirmModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{ width: '64px', height: '64px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <AlertTriangle size={32} color="#dc2626" />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#1e293b' }}>Update All Customer Tiers?</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
                            This will recalculate the membership tier for <strong>every customer</strong> based on spending. This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button style={styles.btnCancel} onClick={() => setShowConfirmModal(false)}>Cancel</button>
                            <button style={styles.btnConfirm} onClick={confirmCalculate}>Yes, Update Tiers</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Membership;