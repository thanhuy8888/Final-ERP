import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
// import './Orders.css'; // Ensure styles are available

const PromotionModal = ({ isOpen, onClose, promotion, onSuccess }) => {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const [formData, setFormData] = useState({
        promotion_code: '',
        promotion_name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'draft',
        discount_type: 'Percentage',
        discount_value: '',
        buy_x: '',
        get_y: '',
        min_purchase_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        scope_type: 'all',
        scope_ids: [],
        membership_tiers: [],
        is_active: 1
    });

    // Reference Data
    const [categories, setCategories] = useState([]);
    const [tiers] = useState(['bronze', 'silver', 'gold', 'platinum', 'diamond']);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            if (promotion) {
                setFormData({
                    ...promotion,
                    start_date: promotion.start_date?.replace(' ', 'T')?.slice(0, 16) || '',
                    end_date: promotion.end_date?.replace(' ', 'T')?.slice(0, 16) || '',
                    scope_ids: promotion.scope_ids || [],
                    membership_tiers: promotion.membership_tiers || []
                });
            } else {
                // Reset form for new
                const now = new Date();
                const nextMonth = new Date();
                nextMonth.setDate(now.getDate() + 30);

                setFormData({
                    promotion_code: '',
                    promotion_name: '',
                    description: '',
                    start_date: now.toISOString().slice(0, 16),
                    end_date: nextMonth.toISOString().slice(0, 16),
                    status: 'draft',
                    discount_type: 'Percentage',
                    discount_value: 0,
                    buy_x: '',
                    get_y: '',
                    min_purchase_amount: 0,
                    max_discount_amount: '',
                    usage_limit: '',
                    scope_type: 'all',
                    scope_ids: [],
                    membership_tiers: [],
                    is_active: 1
                });
            }
        }
    }, [isOpen, promotion]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/admin/categories.php'); // Assuming this exists or similar
            // If not exists, we might need to mock or fetch from products
            // For now, let's assume we can manually enter IDs or just placeholder
            setCategories(res.data || []);
        } catch (e) {
            // console.error(e);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleTier = (tier) => {
        setFormData(prev => {
            const current = prev.membership_tiers || [];
            if (current.includes(tier)) {
                return { ...prev, membership_tiers: current.filter(t => t !== tier) };
            } else {
                return { ...prev, membership_tiers: [...current, tier] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/admin/promotions.php', {
                ...formData,
                promotion_id: promotion?.promotion_id
            });
            success('Saved successfully');
            onSuccess();
            onClose();
        } catch (err) {
            error(err.response?.data?.error || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '700px', maxWidth: '95vh', display: 'flex', flexDirection: 'column', height: '85vh' }}>
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
                    <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{promotion ? 'Edit Promotion' : 'New Promotion'}</h2>
                    <button className="close-button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                </div>

                <div style={{ padding: '0 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '2px' }}>
                    {['basic', 'rules', 'conditions'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 20px',
                                borderBottom: activeTab === tab ? '2px solid #dc2626' : '2px solid transparent',
                                color: activeTab === tab ? '#dc2626' : '#64748b',
                                fontWeight: activeTab === tab ? 600 : 500,
                                background: 'transparent',
                                borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab} Info
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

                    {/* --- TAB 1: BASIC --- */}
                    {activeTab === 'basic' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="form-label">Promotion Code</label>
                                    <input type="text" className="modern-input" required
                                        value={formData.promotion_code}
                                        onChange={e => handleChange('promotion_code', e.target.value.toUpperCase())}
                                        placeholder="SALE2025"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Status</label>
                                    <select className="modern-select" value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Name</label>
                                <input type="text" className="modern-input" required
                                    value={formData.promotion_name}
                                    onChange={e => handleChange('promotion_name', e.target.value)}
                                    placeholder="End of Year Sale"
                                />
                            </div>

                            <div>
                                <label className="form-label">Description</label>
                                <textarea className="modern-input" rows={3}
                                    value={formData.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label className="form-label">Start Date</label>
                                    <input type="datetime-local" className="modern-input" required
                                        value={formData.start_date}
                                        onChange={e => handleChange('start_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">End Date</label>
                                    <input type="datetime-local" className="modern-input" required
                                        value={formData.end_date}
                                        onChange={e => handleChange('end_date', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: RULES --- */}
                    {activeTab === 'rules' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">Discount Type</label>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                    {[
                                        { id: 'Percentage', label: 'Percentage (%)' },
                                        { id: 'Fixed Amount', label: 'Fixed Amt (VND)' },
                                        { id: 'BuyXGetY', label: 'Buy X Get Y' }
                                    ].map(type => (
                                        <div
                                            key={type.id}
                                            onClick={() => handleChange('discount_type', type.id)}
                                            style={{
                                                padding: '12px 16px', borderRadius: '8px',
                                                border: formData.discount_type === type.id ? '2px solid #dc2626' : '1px solid #e2e8f0',
                                                background: formData.discount_type === type.id ? '#fef2f2' : 'white',
                                                color: formData.discount_type === type.id ? '#b91c1c' : '#64748b',
                                                cursor: 'pointer', fontWeight: 500, flex: 1, textAlign: 'center'
                                            }}
                                        >
                                            {type.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {formData.discount_type === 'BuyXGetY' ? (
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <label className="form-label">Buy Quantity (X)</label>
                                            <input type="number" className="modern-input" placeholder="2"
                                                value={formData.buy_x} onChange={e => handleChange('buy_x', e.target.value)}
                                            />
                                        </div>
                                        <div style={{ fontWeight: 800, color: '#94a3b8', paddingTop: '20px' }}>GET</div>
                                        <div style={{ flex: 1 }}>
                                            <label className="form-label">Get Quantity (Y)</label>
                                            <input type="number" className="modern-input" placeholder="1"
                                                value={formData.get_y} onChange={e => handleChange('get_y', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px' }}>
                                        Customer buys X items from Scope, gets Y items free.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label className="form-label">Discount Value</label>
                                    <input type="number" className="modern-input" style={{ fontSize: '1.2rem', fontWeight: 700 }}
                                        value={formData.discount_value}
                                        onChange={e => handleChange('discount_value', e.target.value)}
                                        placeholder="0"
                                    />
                                    {formData.discount_type === 'Percentage' && (
                                        <div style={{ marginTop: '16px' }}>
                                            <label className="form-label">Max Discount Amount (Optional)</label>
                                            <input type="number" className="modern-input" placeholder="Limit max discount..."
                                                value={formData.max_discount_amount}
                                                onChange={e => handleChange('max_discount_amount', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="form-label">Usage Limit (Total)</label>
                                <input type="number" className="modern-input" placeholder="Unlimited"
                                    value={formData.usage_limit}
                                    onChange={e => handleChange('usage_limit', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* --- TAB 3: CONDITIONS --- */}
                    {activeTab === 'conditions' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">Minimum Order Value</label>
                                <input type="number" className="modern-input"
                                    value={formData.min_purchase_amount}
                                    onChange={e => handleChange('min_purchase_amount', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="form-label">Membership Requirement</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                    {tiers.map(tier => (
                                        <div
                                            key={tier}
                                            onClick={() => toggleTier(tier)}
                                            style={{
                                                padding: '6px 12px', borderRadius: '20px',
                                                border: (formData.membership_tiers || []).includes(tier) ? '2px solid #dc2626' : '1px solid #e2e8f0',
                                                background: (formData.membership_tiers || []).includes(tier) ? '#fef2f2' : 'white',
                                                color: (formData.membership_tiers || []).includes(tier) ? '#b91c1c' : '#64748b',
                                                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize'
                                            }}
                                        >
                                            {tier}
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                                    {(formData.membership_tiers || []).length === 0 ? "Applies to ALL customers." : "Only selected tiers."}
                                </p>
                            </div>

                            <div>
                                <label className="form-label">Application Scope</label>
                                <select className="modern-select" value={formData.scope_type} onChange={e => handleChange('scope_type', e.target.value)}>
                                    <option value="all">Entire Store</option>
                                    <option value="category">Specific Categories</option>
                                    <option value="product">Specific Products</option>
                                </select>
                            </div>

                            {formData.scope_type !== 'all' && (
                                <div style={{ padding: '12px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5', color: '#c2410c', fontSize: '0.9rem' }}>
                                    <AlertTriangle size={16} style={{ display: 'inline', marginRight: '5px' }} />
                                    <strong>Coming Soon:</strong> Advanced Product/Category Picker. Currently saving IDs manually via JSON field.
                                </div>
                            )}
                        </div>
                    )}
                </form>

                <div className="modal-footer">
                    <button type="button" className="btn-modern secondary" onClick={onClose}>Cancel</button>
                    <button type="button" className="btn-modern primary" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }} onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={16} /> Save Promotion</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;
