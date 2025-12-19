import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../../components/Modal';
import './Customers.css';

const SaleCustomers = () => {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Modal & Form States
    const [showModal, setShowModal] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);
    const [formData, setFormData] = useState({
        phone: '', full_name: '', email: '', address: '', city: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async (searchTerm = '') => {
        setLoading(true);
        try {
            const endpoint = searchTerm
                ? `/sale/customers.php?search=${encodeURIComponent(searchTerm)}`
                : '/sale/customers.php';
            const response = await api.get(endpoint);
            setCustomers(response.data);

            // If we have a selected customer, refresh their details or clear if not in list
            if (selectedCustomer) {
                // Optional: Keep selection or clear it. 
            }
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerDetails = async (id) => {
        setDetailLoading(true);
        try {
            const res = await api.get(`/sale/customers.php?id=${id}`);
            console.log('API Response:', res);
            console.log('Customer Data:', res.data);
            setSelectedCustomerDetails(res.data);
        } catch (err) {
            console.error('Error fetching customer:', err);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        fetchCustomerDetails(customer.id);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCustomers(search);
    };

    const openEditModal = (e, customer) => {
        e.stopPropagation(); // Prevent card selection
        setEditCustomer(customer);
        setFormData({
            phone: customer.phone || '',
            full_name: customer.full_name || '',
            email: customer.email || '',
            address: customer.address || '',
            city: customer.city || ''
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditCustomer(null);
        setFormData({ phone: '', full_name: '', email: '', address: '', city: '' });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        try {
            if (editCustomer) {
                await api.put('/sale/customers.php', { ...formData, id: editCustomer.id });
                // Update local list
                fetchCustomers(search);
                if (selectedCustomer?.id === editCustomer.id) fetchCustomerDetails(editCustomer.id);
            } else {
                await api.post('/sale/customers.php', formData);
                fetchCustomers(search);
            }
            setShowModal(false);
        } catch (error) {
            alert(error.response?.data?.error || t('common.error') || 'Error saving customer');
        }
    };

    // Helper to render Tag Label
    const renderTag = (tag) => {
        const labels = {
            vip: { text: t('sale.tags.vip'), color: '#f1c40f', bg: '#fff9c4' },
            high_return: { text: t('sale.tags.high_return'), color: '#e74c3c', bg: '#fadbd8' },
            potential_upsell: { text: t('sale.tags.potential_upsell'), color: '#3498db', bg: '#d6eaf8' },
            new: { text: t('sale.tags.new'), color: '#2ecc71', bg: '#d5f5e3' }
        };
        const style = labels[tag] || { text: tag, color: '#666', bg: '#eee' };

        return (
            <span key={tag} className="tag-badge" style={{ color: style.color, background: style.bg }}>
                {style.text}
            </span>
        );
    };

    // SVG Icons
    const Icons = {
        Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
        Plus: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>,
        Edit: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
        Bulb: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.1.3.4.6.6.8zM12 18h.01M10 21h4" /></svg>,
        User: () => <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
        Clock: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
    };

    return (
        <div className="sale-customers">
            <div className="customers-layout">
                {/* LEFT: List */}
                <div className="customers-list-pane">
                    <div className="list-actions" style={{ padding: '0 0 10px 0', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn-add-customer" onClick={openNewModal} title={t('sale.addCustomer')}>
                            <Icons.Plus /> {t('sale.addCustomer')}
                        </button>
                    </div>
                    <form onSubmit={handleSearch} className="search-box">
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('common.search')}
                        />
                        <button type="submit" className="btn-search-icon"><Icons.Search /></button>
                    </form>
                    <div className="list-content">
                        {loading ? <div className="loading-spinner"></div> : (
                            customers.map(c => (
                                <div
                                    key={c.id}
                                    className={`customer-item ${selectedCustomer?.id === c.id ? 'active' : ''}`}
                                    onClick={() => handleSelectCustomer(c)}
                                >
                                    <div className="avatar">
                                        {c.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="info">
                                        <div className="name">{c.full_name}</div>
                                        <div className="meta">{c.phone}</div>
                                    </div>
                                    <div className="actions">
                                        <button className="btn-edit-mini" onClick={(e) => openEditModal(e, c)}>
                                            <Icons.Edit />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Detail */}
                <div className="customers-detail-pane">
                    {detailLoading ? (
                        <div className="detail-placeholder">{t('common.loading')}...</div>
                    ) : selectedCustomerDetails ? (
                        <div className="detail-content">
                            {/* Header */}
                            <div className="detail-header">
                                <div className="detail-avatar">
                                    {selectedCustomerDetails.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1>{selectedCustomerDetails.full_name}</h1>
                                    <div className="detail-tags">
                                        {selectedCustomerDetails.tags?.map(renderTag)}
                                    </div>
                                </div>
                                <div className="detail-meta-grid">
                                    <div className="meta-item">
                                        <label>{t('sale.phone')}</label>
                                        <span>{selectedCustomerDetails.phone}</span>
                                    </div>
                                    <div className="meta-item">
                                        <label>{t('sale.email')}</label>
                                        <span>{selectedCustomerDetails.email || '-'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <label>{t('sale.city')}</label>
                                        <span>{selectedCustomerDetails.city || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendation */}
                            {selectedCustomerDetails.recommendation && (
                                <div className="insight-box">
                                    <div className="insight-icon"><Icons.Bulb /></div>
                                    <div className="insight-text">
                                        <strong>AI Insight:</strong> {selectedCustomerDetails.recommendation}
                                    </div>
                                </div>
                            )}

                            {/* Loyalty Information */}
                            {selectedCustomerDetails.loyalty && (() => {
                                const tier = selectedCustomerDetails.loyalty.tier;
                                const gradients = {
                                    bronze: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
                                    silver: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)',
                                    gold: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                    platinum: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                };
                                return (
                                    <div style={{
                                        padding: '16px',
                                        background: gradients[tier] || gradients.bronze,
                                        borderRadius: '12px',
                                        color: 'white',
                                        marginBottom: '20px'
                                    }}>
                                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>🏆</span> {t('sale.loyalty.title')}
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>{t('sale.loyalty.tier')}</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                                    {selectedCustomerDetails.loyalty.tier === 'bronze' && `🥉 ${t('sale.loyalty.tiers.bronze')}`}
                                                    {selectedCustomerDetails.loyalty.tier === 'silver' && `🥈 ${t('sale.loyalty.tiers.silver')}`}
                                                    {selectedCustomerDetails.loyalty.tier === 'gold' && `🥇 ${t('sale.loyalty.tiers.gold')}`}
                                                    {selectedCustomerDetails.loyalty.tier === 'platinum' && `💎 ${t('sale.loyalty.tiers.platinum')}`}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>{t('sale.loyalty.points')}</div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                                    {selectedCustomerDetails.loyalty.points}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                                    ≈ {(selectedCustomerDetails.loyalty.points_value || 0).toLocaleString()}đ
                                                </div>
                                            </div>
                                        </div>
                                        {selectedCustomerDetails.loyalty.tier_discount !== null && selectedCustomerDetails.loyalty.tier_discount !== undefined && (
                                            <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>
                                                {selectedCustomerDetails.loyalty.tier_discount > 0 ? (
                                                    <>🎁 {t('sale.loyalty.discount', { percent: selectedCustomerDetails.loyalty.tier_discount })}</>
                                                ) : (
                                                    <>💡 {t('sale.loyalty.discountHint')}</>
                                                )}
                                            </div>
                                        )}
                                        {selectedCustomerDetails.loyalty.next_tier && (
                                            <div style={{ marginTop: '12px' }}>
                                                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '6px' }}>
                                                    {t('sale.loyalty.progress', { tier: selectedCustomerDetails.loyalty.next_tier })}
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        background: 'white',
                                                        height: '100%',
                                                        width: `${selectedCustomerDetails.loyalty.progress_to_next}%`,
                                                        transition: 'width 0.3s ease'
                                                    }}></div>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                                                    {(selectedCustomerDetails.loyalty.lifetime_spent || 0).toLocaleString()}đ / {(selectedCustomerDetails.loyalty.next_threshold || 0).toLocaleString()}đ
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Stats */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-label">{t('sale.orders')}</div>
                                    <div className="stat-val">{selectedCustomerDetails.order_count}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">{t('sale.totalSpent')}</div>
                                    <div className="stat-val red">
                                        {parseInt(selectedCustomerDetails.total_spent || 0).toLocaleString()}đ
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">{t('sale.returns')}</div>
                                    <div className="stat-val">
                                        {selectedCustomerDetails.return_count || 0}
                                    </div>
                                </div>
                            </div>

                            {/* Recent History */}
                            <h3><Icons.Clock /> {t('sale.recentOrders')}</h3>
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>{t('admin.date')}</th>
                                        <th>{t('sale.items')}</th>
                                        <th>{t('sale.total')}</th>
                                        <th>{t('reports.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedCustomerDetails.recent_orders?.length > 0 ? (
                                        selectedCustomerDetails.recent_orders.map(o => (
                                            <tr key={o.id}>
                                                <td>#{o.id}</td>
                                                <td>{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                                                <td>{o.item_count} {t('sale.items')}</td>
                                                <td>{parseInt(o.total_amount).toLocaleString()}đ</td>
                                                <td>
                                                    <span className={`status-badge status-${o.status}`}>
                                                        {t(`orders.status.${o.status}`) || o.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999' }}>{t('common.noData')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="detail-placeholder">
                            <div style={{ color: '#ddd', marginBottom: 20 }}><Icons.User /></div>
                            <p>{t('sale.selectCustomerToView')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editCustomer ? t('sale.editCustomer') : t('sale.addCustomer')}
                icon="👤"
                actions={
                    <>
                        <button className="modal-btn secondary" onClick={() => setShowModal(false)}>{t('common.cancel')}</button>
                        <button className="modal-btn primary" onClick={handleSubmit}>{t('common.save')}</button>
                    </>
                }
            >
                <div className="form-grid">
                    <div className="form-group">
                        <label>{t('sale.phone')} *</label>
                        <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>{t('sale.fullName')} *</label>
                        <input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>{t('sale.email')}</label>
                        <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>{t('sale.city')}</label>
                        <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div className="form-group full">
                        <label>{t('sale.address')}</label>
                        <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default SaleCustomers;
