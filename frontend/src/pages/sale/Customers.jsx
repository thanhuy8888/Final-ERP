import { useState, useEffect } from 'react';
import api from '../../api/axios';
import SaleLayout from '../../components/SaleLayout';
import { useTranslation } from '../../hooks/useTranslation';
import './Customers.css';

const SaleCustomers = () => {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCustomer, setEditCustomer] = useState(null);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        phone: '',
        full_name: '',
        email: '',
        address: '',
        city: '',
        notes: ''
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/sale/customers.php');
            setCustomers(response.data);
        } catch (error) {
            console.error('Failed to fetch customers', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!search.trim()) {
            fetchCustomers();
            return;
        }
        try {
            const response = await api.get(`/sale/customers.php?search=${encodeURIComponent(search)}`);
            setCustomers(response.data);
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editCustomer) {
                await api.put('/sale/customers.php', { ...formData, id: editCustomer.id });
            } else {
                await api.post('/sale/customers.php', formData);
            }
            setShowModal(false);
            setEditCustomer(null);
            setFormData({ phone: '', full_name: '', email: '', address: '', city: '', notes: '' });
            fetchCustomers();
        } catch (error) {
            alert(error.response?.data?.error || 'Error saving customer');
        }
    };

    const openEditModal = (customer) => {
        setEditCustomer(customer);
        setFormData({
            phone: customer.phone || '',
            full_name: customer.full_name || '',
            email: customer.email || '',
            address: customer.address || '',
            city: customer.city || '',
            notes: customer.notes || ''
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditCustomer(null);
        setFormData({ phone: '', full_name: '', email: '', address: '', city: '', notes: '' });
        setShowModal(true);
    };

    const formatCurrency = (value) => {
        return parseInt(value || 0).toLocaleString() + 'đ';
    };

    if (loading) {
        return (
            <SaleLayout>
                <div className="sale-loading">
                    <div className="loading-spinner"></div>
                    <p>{t('common.loading')}</p>
                </div>
            </SaleLayout>
        );
    }

    return (
        <SaleLayout>
            <div className="sale-customers">
                <div className="customers-header">
                    <h1>👥 {t('sale.customers')}</h1>
                    <button className="btn-new-customer" onClick={openNewModal}>
                        ➕ {t('sale.addCustomer')}
                    </button>
                </div>

                <div className="search-bar">
                    <input
                        type="text"
                        placeholder={t('sale.searchCustomers')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch}>🔍</button>
                </div>

                {customers.length === 0 ? (
                    <div className="no-customers">
                        <p>{t('sale.noCustomers')}</p>
                    </div>
                ) : (
                    <div className="customers-grid">
                        {customers.map(customer => (
                            <div key={customer.id} className="customer-card">
                                <div className="customer-header">
                                    <div className="avatar">{customer.full_name?.charAt(0) || '?'}</div>
                                    <div className="info">
                                        <h3>{customer.full_name}</h3>
                                        <p>{customer.phone}</p>
                                    </div>
                                </div>
                                <div className="customer-details">
                                    {customer.email && <p>📧 {customer.email}</p>}
                                    {customer.city && <p>📍 {customer.city}</p>}
                                    <div className="stats">
                                        <span>{customer.order_count || 0} {t('sale.orders')}</span>
                                        <span>{formatCurrency(customer.total_spent)}</span>
                                    </div>
                                </div>
                                <div className="customer-actions">
                                    <button onClick={() => openEditModal(customer)}>✏️ {t('common.edit')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Customer Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editCustomer ? t('sale.editCustomer') : t('sale.addCustomer')}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{t('sale.phone')} *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('sale.fullName')} *</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('sale.email')}</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('sale.address')}</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('sale.city')}</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('sale.notes')}</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows="3"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowModal(false)}>{t('common.cancel')}</button>
                                <button type="submit">{t('common.save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SaleLayout>
    );
};

export default SaleCustomers;
