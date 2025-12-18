import React, { useState, useEffect } from 'react';
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
        e.stopPropagation();
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
                fetchCustomers(search);
                if (selectedCustomer?.id === editCustomer.id) fetchCustomerDetails(editCustomer.id);
            } else {
                await api.post('/sale/customers.php', formData);
                fetchCustomers(search);
            }
            setShowModal(false);
        } catch (error) {
            alert(error.response?.data?.error || 'Error saving customer');
        }
    };

    // Helper render Tag
    const renderTag = (tag) => {
        const labels = {
            vip: { text: 'VIP Member', color: '#B76E00', bg: '#FFECB3' },
            high_return: { text: 'High Return', color: '#C0392B', bg: '#FADBD8' },
            potential_upsell: { text: 'Potential', color: '#1E88E5', bg: '#BBDEFB' },
            new: { text: 'New', color: '#27AE60', bg: '#D5F5E3' }
        };
        const style = labels[tag] || { text: tag, color: '#555', bg: '#eee' };

        return (
            <span key={tag} className="tag-badge" style={{ color: style.color, background: style.bg }}>
                {style.text}
            </span>
        );
    };

    // Improved SVG Icons (Sharp & Clean)
    const Icons = {
        Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
        Plus: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
        Edit: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
        Bulb: () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2v1"></path><path d="M12 18a5 5 0 0 0 5-5c0-1.98-1.43-3.66-3.3-4.14C12.33 8.5 12 6.5 12 6.5s-0.33 2-1.7 2.36C8.43 9.34 7 11.02 7 13a5 5 0 0 0 5 5z"></path></svg>,
        UserEmpty: () => <svg width="60" height="60" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        Clock: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
    };

    return (
        <div className="sale-customers">
            <div className="customers-layout">
                {/* LEFT: List */}
                <div className="customers-list-pane">
                    <div className="list-header-actions">
                        <h2 className="list-title">{t('sale.customers')}</h2>
                        <button className="btn-add-customer" onClick={openNewModal}>
                            <Icons.Plus /> <span>{t('Add Customer')}</span>
                        </button>
                    </div>
                    
                    <div className="search-box-container">
                        <div className="search-box">
                            <span style={{color: '#999', display: 'flex'}}><Icons.Search /></span>
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={t('Search') || "Search name, phone..."}
                            />
                        </div>
                    </div>

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
                                    <button className="btn-edit-mini" onClick={(e) => openEditModal(e, c)}>
                                        <Icons.Edit />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Detail */}
                <div className="customers-detail-pane">
                    {detailLoading ? (
                        <div className="detail-placeholder">
                            <div className="loading-spinner"></div>
                            <p>Loading details...</p>
                        </div>
                    ) : selectedCustomerDetails ? (
                        <div className="detail-content">
                            {/* Header */}
                            <div className="detail-header">
                                <div className="detail-avatar-large">
                                    {selectedCustomerDetails.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="detail-info">
                                    <h1>{selectedCustomerDetails.full_name}</h1>
                                    <div className="detail-tags">
                                        {selectedCustomerDetails.tags?.map(renderTag)}
                                    </div>
                                </div>
                                <div className="detail-contact-grid">
                                    <div className="contact-item">
                                        <span className="label">PHONE</span>
                                        {selectedCustomerDetails.phone}
                                    </div>
                                    <div className="contact-item">
                                        <span className="label">EMAIL</span>
                                        {selectedCustomerDetails.email || 'N/A'}
                                    </div>
                                    <div className="contact-item">
                                        <span className="label">CITY</span>
                                        {selectedCustomerDetails.city || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* AI Recommendation */}
                            {selectedCustomerDetails.recommendation && (
                                <div className="insight-box">
                                    <div className="insight-icon"><Icons.Bulb /></div>
                                    <div className="insight-text">
                                        <strong>AI Suggestion:</strong><br/>
                                        {selectedCustomerDetails.recommendation}
                                    </div>
                                </div>
                            )}

                            {/* Loyalty Card Modern */}
                            {selectedCustomerDetails.loyalty && (() => {
                                const { tier, points, points_value, tier_discount, next_tier, progress_to_next } = selectedCustomerDetails.loyalty;
                                // Gradient nền thẻ sang trọng hơn
                                const bgStyle = {
                                    bronze: 'linear-gradient(135deg, #705a4f 0%, #523e35 100%)',
                                    silver: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
                                    gold: 'linear-gradient(135deg, #f1c40f 0%, #b7950b 100%)',
                                    platinum: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }[tier] || 'linear-gradient(135deg, #333 0%, #000 100%)';

                                return (
                                    <div style={{
                                        padding: '24px',
                                        background: bgStyle,
                                        borderRadius: '16px',
                                        color: 'white',
                                        marginBottom: '30px',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Background Decoration */}
                                        <div style={{position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%'}}></div>
                                        
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
                                            <div>
                                                <div style={{fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '1px'}}>Membership Tier</div>
                                                <div style={{fontSize: '24px', fontWeight: '800', textTransform: 'uppercase', marginTop: '4px'}}>
                                                    {tier} MEMBER
                                                </div>
                                            </div>
                                            <div style={{textAlign: 'right'}}>
                                                <div style={{fontSize: '28px', fontWeight: 'bold'}}>{points} pts</div>
                                                <div style={{fontSize: '13px', opacity: 0.9}}>≈ {points_value?.toLocaleString()}đ</div>
                                            </div>
                                        </div>

                                        {next_tier && (
                                            <div>
                                                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', opacity: 0.9}}>
                                                    <span>Current Progress</span>
                                                    <span>Next: {next_tier.toUpperCase()}</span>
                                                </div>
                                                <div style={{background: 'rgba(0,0,0,0.2)', height: '6px', borderRadius: '10px', overflow: 'hidden'}}>
                                                    <div style={{width: `${progress_to_next}%`, background: 'white', height: '100%', borderRadius: '10px'}}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Stats */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-label">Total Orders</div>
                                    <div className="stat-val">{selectedCustomerDetails.order_count}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Total Spent</div>
                                    <div className="stat-val red">
                                        {parseInt(selectedCustomerDetails.total_spent || 0).toLocaleString()}đ
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Returns</div>
                                    <div className="stat-val">
                                        {selectedCustomerDetails.return_count || 0}
                                    </div>
                                </div>
                            </div>

                            {/* Recent History */}
                            <h3 className="section-title"><Icons.Clock /> {t('sale.recentOrders')}</h3>
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Date</th>
                                        <th style={{textAlign: 'center'}}>Items</th>
                                        <th style={{textAlign: 'right'}}>Total</th>
                                        <th style={{textAlign: 'right'}}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedCustomerDetails.recent_orders?.length > 0 ? (
                                        selectedCustomerDetails.recent_orders.map(o => (
                                            <tr key={o.id}>
                                                <td style={{fontWeight: 600}}>#{o.id}</td>
                                                <td style={{color: '#666'}}>{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                                                <td style={{textAlign: 'center'}}>{o.item_count}</td>
                                                <td style={{textAlign: 'right', fontWeight: 600}}>{parseInt(o.total_amount).toLocaleString()}đ</td>
                                                <td style={{textAlign: 'right'}}>
                                                    <span className={`status-badge status-${o.status}`}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: '30px' }}>No orders found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="detail-placeholder">
                            <div style={{ marginBottom: 20 }}><Icons.UserEmpty /></div>
                            <p style={{fontSize: '16px', color: '#888'}}>{t('sale.selectCustomerToView')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Keep same logic, just clean style handled by CSS */}
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
                        <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="09..." />
                    </div>
                    <div className="form-group">
                        <label>{t('sale.fullName')} *</label>
                        <input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="Nguyen Van A" />
                    </div>
                    <div className="form-group">
                        <label>{t('sale.email')}</label>
                        <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
                    </div>
                    <div className="form-group">
                        <label>{t('sale.city')}</label>
                        <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Hanoi" />
                    </div>
                    <div className="form-group" style={{gridColumn: 'span 2'}}>
                        <label>{t('sale.address')}</label>
                        <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full Address" />
                    </div>
                </div>
            </Modal>
        </div >
    );
};

export default SaleCustomers;