import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/axios';
import { Save, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import './Orders.css';

const Membership = () => {
    const { t } = useTranslation();
    const { success, error } = useToast();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/membership.php');
            setTiers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (tier) => {
        try {
            await api.put('/admin/membership.php', {
                id: tier.id,
                min_spent: tier.min_spent,
                bonus_rate: tier.bonus_rate
            });
            success(`Updated ${tier.tier_display}`);
        } catch (err) {
            error('Failed to update');
        }
    };

    const confirmCalculate = async () => {
        setShowConfirmModal(false);
        setCalculating(true);
        try {
            const res = await api.post('/admin/membership.php', { action: 'calculate' });
            success(res.data.message);
        } catch (err) {
            error('Calculation failed');
        } finally {
            setCalculating(false);
        }
    };

    const handleCalculateClick = () => {
        setShowConfirmModal(true);
    };

    const handleChange = (index, field, value) => {
        const newTiers = [...tiers];
        newTiers[index][field] = value;
        setTiers(newTiers);
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Membership Tiers</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Configure rules/thresholds for customer loyalty tiers.</p>
                </div>
                <button
                    className="btn-modern secondary"
                    onClick={handleCalculateClick}
                    disabled={calculating}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#dc2626',
                        borderColor: '#dc2626',
                        color: 'white'
                    }}
                >
                    <RefreshCw size={16} className={calculating ? 'spin' : ''} />
                    {calculating ? 'Calculating...' : 'Auto-Update All Customers'}
                </button>
            </div>

            <div className="content-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead>
                        <tr>
                            <th>Tier Level</th>
                            <th>Min. Spending (VND)</th>
                            <th>Point Bonus Rate (x)</th>
                            <th style={{ textAlign: 'center' }}>Badge Preview</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiers.map((tier, index) => (
                            <tr key={tier.id}>
                                <td style={{ fontWeight: 600 }}>{tier.tier_display}</td>
                                <td>
                                    <input
                                        type="number"
                                        className="modern-input"
                                        style={{ width: '150px' }}
                                        value={tier.min_spent}
                                        onChange={(e) => handleChange(index, 'min_spent', e.target.value)}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        step="0.05"
                                        className="modern-input"
                                        style={{ width: '100px' }}
                                        value={tier.bonus_rate}
                                        onChange={(e) => handleChange(index, 'bonus_rate', e.target.value)}
                                    />
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <span className={`badge-soft`}
                                        style={{
                                            background: tier.tier_key === 'gold' ? '#fef9c3' :
                                                tier.tier_key === 'platinum' ? '#e0e7ff' :
                                                    tier.tier_key === 'diamond' ? '#ccfbf1' :
                                                        tier.tier_key === 'silver' ? '#f1f5f9' : '#fff7ed',
                                            color: tier.tier_key === 'gold' ? '#854d0e' :
                                                tier.tier_key === 'platinum' ? '#3730a3' :
                                                    tier.tier_key === 'diamond' ? '#115e59' :
                                                        tier.tier_key === 'silver' ? '#334155' : '#9a3412',
                                            border: `1px solid ${tier.tier_key === 'gold' ? '#fde047' :
                                                tier.tier_key === 'platinum' ? '#c7d2fe' :
                                                    tier.tier_key === 'diamond' ? '#99f6e4' :
                                                        tier.tier_key === 'silver' ? '#cbd5e1' : '#ffedd5'
                                                }`,
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            textTransform: 'uppercase'
                                        }}>
                                        {tier.tier_key}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        className="btn-modern primary"
                                        onClick={() => handleUpdate(tier)}
                                        style={{ padding: '6px 12px', fontSize: '13px', backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                                    >
                                        <Save size={14} style={{ marginRight: '4px' }} /> Save
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '24px', background: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} /> How it works
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#047857' }}>
                    The system assigns tiers based on <strong>Lifetime Spending</strong>.
                    When you click "Auto-Update", all customers are re-evaluated against these thresholds.
                    Customers are automatically assigned the highest tier they qualify for.
                    They will never be downgraded automatically by this process unless you change the thresholds.
                </p>
            </div>

            {/* Custom Confirm Modal */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{
                                width: '60px', height: '60px', background: '#fee2e2', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                            }}>
                                <AlertTriangle size={32} color="#dc2626" />
                            </div>
                            <h3 style={{ marginBottom: '8px' }}>Update All Customer Tiers?</h3>
                            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                                This process will recalculate the membership tier for <strong>every customer</strong> based on their total lifetime spending.
                                <br /><br />
                                This cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button className="btn-modern secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                                <button className="btn-modern primary" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }} onClick={confirmCalculate}>
                                    Yes, Update Tiers
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Membership;
