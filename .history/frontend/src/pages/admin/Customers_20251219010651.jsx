import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/axios';
import { Search, UserPlus, Edit, User } from 'lucide-react';
import CustomerModal from '../../components/modals/CustomerModal';

const Customers = () => {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    
    // Filters
    const [filters, setFilters] = useState({ search: '', membership_tier: '' });

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => { fetchCustomers(); }, [page, filters]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 10, search: filters.search, membership_tier: filters.membership_tier });
            const res = await api.get(`/admin/customers.php?${params.toString()}`);
            setCustomers(res.data.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
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

    // Styles Object
    const styles = {
        container: { padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1e293b' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
        title: { fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' },
        subtitle: { color: '#64748b', fontSize: '15px', marginTop: '4px' },
        btnPrimary: { background: '#E31E24', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(227, 30, 36, 0.2)' },
        card: { background: 'white', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', overflow: 'hidden' },
        toolbar: { padding: '20px 24px', display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', background: 'white' },
        searchWrapper: { display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '10px 16px', borderRadius: '10px', width: '300px', border: '1px solid transparent' },
        input: { border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '14px', color: '#1e293b' },
        select: { padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f1f5f9', fontSize: '14px', fontWeight: '600', color: '#1e293b', cursor: 'pointer', minWidth: '180px' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
        td: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', verticalAlign: 'middle' },
        badge: (tier) => {
            const colors = {
                bronze: { bg: '#fff7ed', text: '#9a3412', border: '#ffedd5' },
                silver: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
                gold: { bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
                platinum: { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' },
                diamond: { bg: '#ecfeff', text: '#155e75', border: '#a5f3fc' }
            };
            const t = tier ? tier.toLowerCase() : 'bronze';
            const style = colors[t] || colors.bronze;
            return {
                background: style.bg, color: style.text, border: `1px solid ${style.border}`,
                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block'
            };
        },
        avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' },
        btnIcon: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }
    };

    return (
        <div style={styles.container}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
            
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>{t('admin.customers')}</h1>
                    <p style={styles.subtitle}>Manage customer profiles and loyalty tiers.</p>
                </div>
                <button style={styles.btnPrimary} onClick={handleCreate}>
                    <UserPlus size={18} /> New Customer
                </button>
            </div>

            <div style={styles.card}>
                <div style={styles.toolbar}>
                    <div style={styles.searchWrapper}>
                        <Search size={18} color="#64748b" />
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Search by Name, Phone..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <select 
                        style={styles.select}
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

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading customers...</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Customer Info</th>
                                <th style={styles.th}>Phone</th>
                                <th style={styles.th}>Tier</th>
                                <th style={{...styles.th, textAlign: 'right'}}>Lifetime Spent</th>
                                <th style={{...styles.th, textAlign: 'center'}}>Points</th>
                                <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(cust => (
                                <tr key={cust.id} onMouseEnter={(e) => e.currentTarget.style.background = '#fcfdfe'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{...styles.td, color: '#64748b', fontFamily: 'monospace', fontWeight: 600}}>#{cust.id}</td>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={styles.avatar}><User size={16} /></div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{cust.full_name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{cust.email || 'No Email'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{...styles.td, fontWeight: 500}}>{cust.phone}</td>
                                    <td style={styles.td}>
                                        <span style={styles.badge(cust.membership_tier)}>{cust.membership_tier || 'bronze'}</span>
                                    </td>
                                    <td style={{...styles.td, textAlign: 'right', fontWeight: 700, color: '#1e293b'}}>
                                        {parseInt(cust.total_lifetime_spent || 0).toLocaleString()}₫
                                    </td>
                                    <td style={{...styles.td, textAlign: 'center'}}>
                                        <span style={{ fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', fontSize: '13px' }}>
                                            {cust.loyalty_points || 0} pts
                                        </span>
                                    </td>
                                    <td style={{...styles.td, textAlign: 'right'}}>
                                        <button style={styles.btnIcon} onClick={() => handleEdit(cust)} title="Edit Profile">
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
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