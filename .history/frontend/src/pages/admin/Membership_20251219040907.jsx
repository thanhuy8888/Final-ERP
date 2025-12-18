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

    // --- STYLES ---
    const styles = {
        container: { padding: '32px 40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#0F172A' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' },
        title: { fontSize: '32px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' },
        subtitle: { color: '#64748B', fontSize: '15px', marginTop: '4px', fontWeight: '500' },
        
        // Card & Table
        card: { background: 'white', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)', border: '1px solid #E2E8F0', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
        th: { background: '#F8FAFC', padding: '16px 24px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#64748B', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0' },
        td: { padding: '20px 24px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', verticalAlign: 'middle', background: 'white' },
        
        // Inputs
        input: { 
            padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', 
            width: '100%', fontSize: '14px', fontFamily: 'inherit', fontWeight: '500', 
            color: '#1E293B', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' // Quan trọng: boxSizing giúp input không bị tràn
        },

        // Buttons
        btnSave: { 
            background: '#E11D48', color: 'white', border: 'none', 
            padding: '10px 18px', borderRadius: '10px', fontWeight: '600', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', 
            fontSize: '13px', boxShadow: '0 2px 4px rgba(225, 29, 72, 0.2)', transition: 'all 0.2s'
        },
        btnRefresh: { 
            background: 'white', border: '1px solid #E2E8F0', color: '#E11D48', 
            padding: '12px 24px', borderRadius: '12px', fontWeight: '700', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        },

        // Alignment Fix Wrapper
        actionWrapper: {
            display: 'flex',
            justifyContent: 'flex-end', // Đẩy nút Save về bên phải
            alignItems: 'center'
        },

        // Badges
        badge: (tier) => {
            const colors = {
                gold: { bg: '#FEFCE8', text: '#B45309', border: '#FEF08A' },
                platinum: { bg: '#EEF2FF', text: '#4338CA', border: '#E0E7FF' },
                diamond: { bg: '#ECFEFF', text: '#0E7490', border: '#CFFAFE' },
                silver: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
                bronze: { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' }
            };
            const s = colors[tier.toLowerCase()] || colors.bronze;
            return { 
                background: s.bg, color: s.text, border: `1px solid ${s.border}`,
                padding: '6px 12px', borderRadius: '20px', fontSize: '11px', 
                fontWeight: '700', textTransform: 'uppercase', display: 'inline-block' 
            };
        },

        // Info Box
        infoBox: { background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '16px', padding: '24px', display: 'flex', gap: '20px', marginTop: '32px' },
        
        // Modal
        modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', borderRadius: '24px', padding: '32px', width: '420px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
        btnCancel: { background: 'white', border: '1px solid #E2E8F0', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', color: '#64748B', cursor: 'pointer' },
        btnConfirm: { background: '#E11D48', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)' }
    };

    return (
        <div style={styles.container}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                input:focus { border-color: #E11D48 !important; box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1) !important; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                button:active { transform: scale(0.98); }
            `}</style>
            
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
                            <th style={{...styles.th, textAlign: 'right', paddingRight: '32px'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan="5" style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading tiers...</td></tr>
                        ) : tiers.map((tier, index) => (
                            <tr key={tier.id}>
                                <td style={{...styles.td, fontWeight: 700, fontSize: '15px', color: '#1E293B'}}>{tier.tier_display}</td>
                                <td style={styles.td}>
                                    <input 
                                        type="number" 
                                        style={styles.input} 
                                        value={tier.min_spent} 
                                        onChange={(e) => handleChange(index, 'min_spent', e.target.value)} 
                                    />
                                </td>
                                <td style={styles.td}>
                                    <input 
                                        type="number" step="0.05" 
                                        style={{...styles.input, width: '100px'}} 
                                        value={tier.bonus_rate} 
                                        onChange={(e) => handleChange(index, 'bonus_rate', e.target.value)} 
                                    />
                                </td>
                                <td style={{...styles.td, textAlign: 'center'}}>
                                    <span style={styles.badge(tier.tier_key)}>{tier.tier_key}</span>
                                </td>
                                {/* FIX LỖI Ở ĐÂY */}
                                <td style={{...styles.td, textAlign: 'right', paddingRight: '24px'}}>
                                    <div style={styles.actionWrapper}>
                                        <button style={styles.btnSave} onClick={() => handleUpdate(tier)}>
                                            <Save size={16} /> Save
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={styles.infoBox}>
                <div style={{ color: '#2563EB', background: 'white', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #DBEAFE' }}>
                    <Shield size={24} />
                </div>
                <div>
                    <h4 style={{ margin: '0 0 6px 0', color: '#1E3A8A', fontSize: '16px', fontWeight: 700 }}>How it works</h4>
                    <p style={{ margin: 0, color: '#1E40AF', fontSize: '14px', lineHeight: '1.6' }}>
                        The system assigns tiers based on <strong>Lifetime Spending</strong>. 
                        Customers are automatically assigned the highest tier they qualify for when you click "Auto-Update".
                    </p>
                </div>
            </div>

            {showConfirmModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{ width: '72px', height: '72px', background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <AlertTriangle size={32} color="#DC2626" />
                        </div>
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#1E293B', fontWeight: 800 }}>Update All Tiers?</h3>
                        <p style={{ color: '#64748B', marginBottom: '32px', lineHeight: '1.6', fontSize: '15px' }}>
                            This will recalculate the membership tier for <strong>every customer</strong> based on their current lifetime spending. This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
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