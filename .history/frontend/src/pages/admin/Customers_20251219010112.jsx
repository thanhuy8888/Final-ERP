import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/axios';
import { Search, UserPlus, Edit, User } from 'lucide-react';
import CustomerModal from '../../components/modals/CustomerModal';
import './Inventory.css'; // Sử dụng CSS chung

const Customers = () => {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    
    // Filters
    const [filters, setFilters] = useState({
        search: '',
        membership_tier: ''
    });

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

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
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setIsCreateModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCustomer(null);
        setIsCreateModalOpen(true);
    };

    const getTierBadge = (tier) => {
        const t = tier ? tier.toLowerCase() : 'bronze';
        return <span className={`status-badge badge-${t}`}>{t}</span>;
    };

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h1>{t('admin.customers')}</h1>
                    <p className="subtitle">Manage customer profiles and loyalty tiers.</p>
                </div>
                <button className="btn-primary" onClick={handleCreate}>
                    <UserPlus size={18} /> New Customer
                </button>
            </div>

            <div className="content-card">
                {/* Toolbar */}
                <div className="toolbar">
                    <div className="search-bar">
                        <Search size={18} color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search by Name, Phone..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <select 
                        className="status-filter" 
                        style={{ minWidth: '200px' }}
                        value={filters.membership_tier} 
                        onChange={(e) => handleFilterChange('membership_tier', e.target.value)}
                    >
                        <option value="">All Tiers</option>
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                        <option value="platinum">Platinum</option>
                        <option value="diamond">Diamond</option>
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading customers...</div>
                ) : (
                    <table className="admin-table">
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
                                    <td style={{ color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>#{cust.id}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="avatar-circle" style={{ background: '#f1f5f9', color: '#64748b' }}>
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{cust.full_name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{cust.email || 'No Email'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500 }}>{cust.phone}</td>
                                    <td>{getTierBadge(cust.membership_tier)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                                        {parseInt(cust.total_lifetime_spent || 0).toLocaleString()}₫
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', fontSize: '13px' }}>
                                            {cust.loyalty_points || 0} pts
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn-icon" onClick={() => handleEdit(cust)} title="Edit Profile">
                                            <Edit size={18} />
                                        </button>
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