import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../api/axios';
import { Search, UserPlus, Edit, User, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import CustomerModal from '../../components/modals/CustomerModal';

const Customers = () => {
    const { t } = useTranslation();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1); // Giả sử API trả về total pages
    
    // Filters
    const [filters, setFilters] = useState({ search: '', membership_tier: '' });

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Hover state cho row (dùng state để xử lý inline style hover đơn giản)
    const [hoveredRow, setHoveredRow] = useState(null);

    useEffect(() => { fetchCustomers(); }, [page, filters]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 10, search: filters.search, membership_tier: filters.membership_tier });
            const res = await api.get(`/admin/customers.php?${params.toString()}`);
            setCustomers(res.data.data);
            // setTotalPages(res.data.total_pages); // Nếu API có trả về
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setIsCreateModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCustomer(null);
        setIsCreateModalOpen(true);
    };

    // --- STYLES ---
    const styles = {
        container: { padding: '32px 40px', backgroundColor: '#F8FAFC', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#0F172A' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
        titleCtx: { display: 'flex', flexDirection: 'column', gap: '4px' },
        title: { fontSize: '32px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' },
        subtitle: { color: '#64748B', fontSize: '15px', fontWeight: '500' },
        
        // Button Primary
        btnPrimary: { 
            background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)', // Gradient đỏ sang trọng hơn
            color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', 
            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', 
            boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.3), 0 2px 4px -1px rgba(225, 29, 72, 0.15)',
            transition: 'all 0.2s ease'
        },

        // Card Container
        card: { background: 'white', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)', border: '1px solid #E2E8F0', overflow: 'hidden' },
        
        // Toolbar
        toolbar: { padding: '24px', display: 'flex', gap: '16px', borderBottom: '1px solid #F1F5F9', background: 'white', alignItems: 'center' },
        searchWrapper: { display: 'flex', alignItems: 'center', background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', width: '320px', border: '1px solid #E2E8F0', transition: 'border 0.2s' },
        input: { border: 'none', background: 'transparent', outline: 'none', marginLeft: '12px', width: '100%', fontSize: '14px', color: '#0F172A', fontWeight: '500' },
        selectWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
        select: { appearance: 'none', padding: '12px 40px 12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', fontWeight: '600', color: '#334155', cursor: 'pointer', minWidth: '160px', outline: 'none' },
        
        // Table
        tableContainer: { width: '100%', overflowX: 'auto' },
        table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0' }, // Dùng separate để border radius hoạt động tốt hơn nếu cần
        th: { background: '#F8FAFC', padding: '16px 24px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#64748B', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0' },
        td: { padding: '20px 24px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', verticalAlign: 'middle', transition: 'background 0.15s' },
        
        // Custom Cells
        idCell: { color: '#94A3B8', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600, fontSize: '13px' },
        userInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
        avatar: { width: '40px', height: '40px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', border: '1px solid #DBEAFE' },
        userName: { fontWeight: 700, color: '#0F172A', fontSize: '15px', marginBottom: '2px' },
        userEmail: { fontSize: '13px', color: '#64748B' },
        
        // Badges
        badge: (tier) => {
            const styles = {
                bronze: { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' },
                silver: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
                gold: { bg: '#FEFCE8', text: '#B45309', border: '#FEF08A' },
                platinum: { bg: '#EEF2FF', text: '#4338CA', border: '#E0E7FF' },
                diamond: { bg: '#ECFEFF', text: '#0E7490', border: '#CFFAFE' }
            };
            const s = styles[tier?.toLowerCase()] || styles.bronze;
            return {
                background: s.bg, color: s.text, border: `1px solid ${s.border}`,
                padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', 
                textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '4px'
            };
        },

        // Actions
        actionCell: { textAlign: 'right' }, // Căn phải cho thẻ TD
        actionWrapper: { display: 'flex', justifyContent: 'flex-end', gap: '8px' }, // Flex end để nút dính về bên phải
        btnIcon: { background: 'white', border: '1px solid #E2E8F0', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
        
        // Pagination
        footer: { padding: '20px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        pageBtn: { background: 'white', border: '1px solid #E2E8F0', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: '#475569' }
    };

    return (
        <div style={styles.container}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');
                body { margin: 0; background: #f8fafc; }
            `}</style>
            
            <div style={styles.header}>
                <div style={styles.titleCtx}>
                    <h1 style={styles.title}>{t('admin.customers')}</h1>
                    <p style={styles.subtitle}>Overview of your customer base and loyalty status.</p>
                </div>
                <button style={styles.btnPrimary} onClick={handleCreate} onMouseEnter={(e) => e.target.style.opacity = '0.9'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
                    <UserPlus size={20} strokeWidth={2.5} /> 
                    <span>New Customer</span>
                </button>
            </div>

            <div style={styles.card}>
                <div style={styles.toolbar}>
                    <div style={styles.searchWrapper}>
                        <Search size={20} color="#94A3B8" />
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Search name, phone, email..."
                            value={filters.search}
                            onChange={(e) => { setFilters({...filters, search: e.target.value}); setPage(1); }}
                        />
                    </div>
                    <div style={styles.selectWrapper}>
                        <Filter size={16} style={{position: 'absolute', left: '12px', color: '#64748B', pointerEvents: 'none'}} />
                        <select 
                            style={{...styles.select, paddingLeft: '36px'}}
                            value={filters.membership_tier} 
                            onChange={(e) => { setFilters({...filters, membership_tier: e.target.value}); setPage(1); }}
                        >
                            <option value="">All Tiers</option>
                            <option value="bronze">Bronze</option>
                            <option value="silver">Silver</option>
                            <option value="gold">Gold</option>
                            <option value="platinum">Platinum</option>
                            <option value="diamond">Diamond</option>
                        </select>
                    </div>
                </div>

                <div style={styles.tableContainer}>
                    {loading ? (
                        <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ marginBottom: '10px' }}>Loading...</div>
                        </div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{...styles.th, width: '80px'}}>ID</th>
                                    <th style={styles.th}>Customer Profile</th>
                                    <th style={styles.th}>Contact</th>
                                    <th style={styles.th}>Current Tier</th>
                                    <th style={{...styles.th, textAlign: 'right'}}>Total Spent</th>
                                    <th style={{...styles.th, textAlign: 'center'}}>Points</th>
                                    <th style={{...styles.th, textAlign: 'right', paddingRight: '32px'}}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.length === 0 ? (
                                    <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No customers found.</td></tr>
                                ) : customers.map((cust) => (
                                    <tr 
                                        key={cust.id} 
                                        onMouseEnter={() => setHoveredRow(cust.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        style={{ background: hoveredRow === cust.id ? '#F8FAFC' : 'white' }}
                                    >
                                        <td style={styles.td}>
                                            <span style={styles.idCell}>#{cust.id}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.userInfo}>
                                                <div style={styles.avatar}>
                                                    <span style={{fontWeight: 700, fontSize: '16px'}}>
                                                        {cust.full_name ? cust.full_name.charAt(0).toUpperCase() : <User size={18}/>}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div style={styles.userName}>{cust.full_name}</div>
                                                    <div style={styles.userEmail}>{cust.email || 'No email registered'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{...styles.td, color: '#475569', fontWeight: 500}}>
                                            {cust.phone}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.badge(cust.membership_tier)}>
                                                {cust.membership_tier || 'Bronze'}
                                            </span>
                                        </td>
                                        <td style={{...styles.td, textAlign: 'right', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace', fontSize: '15px'}}>
                                            {parseInt(cust.total_lifetime_spent || 0).toLocaleString()}₫
                                        </td>
                                        <td style={{...styles.td, textAlign: 'center'}}>
                                            <div style={{ 
                                                display: 'inline-block', fontWeight: 700, color: '#059669', 
                                                background: '#ECFDF5', padding: '6px 10px', borderRadius: '8px', 
                                                fontSize: '13px', border: '1px solid #D1FAE5' 
                                            }}>
                                                {cust.loyalty_points || 0}
                                            </div>
                                        </td>
                                        {/* FIX LỖI LỆCH Ở ĐÂY */}
                                        <td style={{...styles.td, textAlign: 'right', paddingRight: '24px'}}>
                                            <div style={styles.actionWrapper}>
                                                <button 
                                                    style={{...styles.btnIcon, ...(hoveredRow === cust.id ? {borderColor: '#CBD5E1', color: '#334155'} : {})}} 
                                                    onClick={() => handleEdit(cust)} 
                                                    title="Edit Details"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div style={styles.footer}>
                    <div style={{fontSize: '14px', color: '#64748B'}}>
                        Showing page <b>{page}</b>
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            style={{...styles.pageBtn, opacity: page === 1 ? 0.5 : 1}}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button 
                            // disabled={page >= totalPages} // Uncomment nếu có totalPages
                            onClick={() => setPage(p => p + 1)}
                            style={styles.pageBtn}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
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