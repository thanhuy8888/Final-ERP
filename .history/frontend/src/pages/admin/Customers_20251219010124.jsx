import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/axios';
import { Search, Filter, RefreshCw, UserPlus, Edit, Eye, User } from 'lucide-react';
import CustomerModal from '../../components/modals/CustomerModal';
// import CustomerDetailModal from '../../components/modals/CustomerDetailModal';
import './Orders.css'; // Reuse existing styles for now

const Customers = () => {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        membership_tier: ''
    });

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [page, filters]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 10,
                search: filters.search,
                membership_tier: filters.membership_tier
            });
            const res = await api.get(`/admin/customers.php?${params.toString()}`);
            setCustomers(res.data.data);
            setTotalPages(res.data.last_page);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to page 1
    };

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setIsCreateModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCustomer(null);
        setIsCreateModalOpen(true);
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>{t('admin.customers')}</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Manage customer profiles and loyalty.</p>
                </div>
                <button className="btn-modern primary" onClick={handleCreate} style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}>
                    <UserPlus size={16} /> New Customer
                </button>
            </div>

            {/* Filter Bar */}
            <div className="filter-container">
                <div className="filter-group" style={{ flex: 1 }}>
                    <label className="filter-label">Search</label>
                    <div className="input-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="modern-input"
                            placeholder="Name, Phone..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-group" style={{ width: '200px' }}>
                    <label className="filter-label">Membership Tier</label>
                    <select className="modern-select" value={filters.membership_tier} onChange={(e) => handleFilterChange('membership_tier', e.target.value)}>
                        <option value="">All Tiers</option>
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="platinum">Platinum</option>
                        <option value="diamond">Diamond</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="content-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
                ) : (
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer Info</th>
                                <th>Phone</th>
                                <th>Tier</th>
                                <th style={{ textAlign: 'right' }}>Lifetime Spent</th>
                                <th style={{ textAlign: 'center' }}>Points</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(cust => (
                                <tr key={cust.id}>
                                    <td style={{ color: '#64748b', fontSize: '12px' }}>#{cust.id}</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{cust.full_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cust.email || 'No Email'}</div>
                                    </td>
                                    <td>{cust.phone}</td>
                                    <td>
                                        <span className={`badge-soft ${cust.membership_tier || 'bronze'}`}
                                            style={{
                                                background: cust.membership_tier === 'gold' ? '#fef9c3' :
                                                    cust.membership_tier === 'platinum' ? '#e0e7ff' :
                                                        cust.membership_tier === 'diamond' ? '#ccfbf1' :
                                                            cust.membership_tier === 'silver' ? '#f1f5f9' : '#fff7ed',
                                                color: cust.membership_tier === 'gold' ? '#854d0e' :
                                                    cust.membership_tier === 'platinum' ? '#3730a3' :
                                                        cust.membership_tier === 'diamond' ? '#115e59' :
                                                            cust.membership_tier === 'silver' ? '#334155' : '#9a3412',
                                                border: `1px solid ${cust.membership_tier === 'gold' ? '#fde047' :
                                                    cust.membership_tier === 'platinum' ? '#c7d2fe' :
                                                        cust.membership_tier === 'diamond' ? '#99f6e4' :
                                                            cust.membership_tier === 'silver' ? '#cbd5e1' : '#ffedd5'
                                                    }`
                                            }}>
                                            {(cust.membership_tier || 'bronze').toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 500 }}>
                                        {parseInt(cust.total_lifetime_spent || 0).toLocaleString()}₫
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#059669' }}>
                                        {cust.loyalty_points || 0}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button className="btn-view-modern" onClick={() => handleEdit(cust)}>
                                                <Edit size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* TODO: Add Pagination */}

            <CustomerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                customer={selectedCustomer}
                onSuccess={fetchCustomers}
            />
        </div>
    );
};

export default Customers;
