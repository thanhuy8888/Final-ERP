import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Trash, Edit, Plus, Calendar, Tag, AlertTriangle, Search } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import PromotionModal from '../../components/modals/PromotionModal';

const AdminPromotions = () => {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    useEffect(() => { fetchPromotions(); }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/promotions.php');
            setPromotions(response.data);
        } catch (error) { console.error("Failed to fetch promotions", error); } 
        finally { setLoading(false); }
    };

    const handleEdit = (promo) => {
        setSelectedPromo(promo);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedPromo(null);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await api.delete('/admin/promotions.php', { data: { promotion_id: deleteModal.id } });
            fetchPromotions();
            setDeleteModal({ open: false, id: null });
            success('Promotion deleted');
        } catch (error) { showError('Delete failed'); }
    };

    // --- Styles Object (CSS-in-JS) ---
    const styles = {
        container: {
            padding: '32px',
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            color: '#0f172a'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '32px'
        },
        title: {
            fontSize: '28px',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 4px 0',
            letterSpacing: '-0.5px'
        },
        subtitle: {
            color: '#64748b',
            fontSize: '15px',
            margin: 0
        },
        btnPrimary: {
            background: '#dc2626', // Red for promotions
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
            transition: 'all 0.2s'
        },
        card: {
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        th: {
            background: '#f8fafc',
            padding: '16px 24px',
            textAlign: 'left',
            fontSize: '12px',
            textTransform: 'uppercase',
            fontWeight: '700',
            color: '#64748b',
            borderBottom: '1px solid #e2e8f0',
            letterSpacing: '0.05em'
        },
        td: {
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            fontSize: '14px',
            verticalAlign: 'middle',
            color: '#334155'
        },
        codeBadge: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'monospace',
            fontWeight: 700,
            color: '#dc2626',
            background: '#fef2f2',
            padding: '6px 10px',
            borderRadius: '8px',
            width: 'fit-content'
        },
        statusBadge: (status) => {
            const styles = {
                draft: { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' },
                active: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
                expired: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' }
            };
            const s = styles[status] || styles.draft;
            return {
                background: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`,
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                display: 'inline-block'
            };
        },
        btnIcon: {
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        modalOverlay: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        },
        modalContent: {
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '400px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }
    };

    return (
        <div style={styles.container}>
            {/* Inject Font */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Promotion Management</h1>
                    <p style={styles.subtitle}>Manage discounts, coupons, and special offers.</p>
                </div>
                <button 
                    style={styles.btnPrimary} 
                    onClick={handleCreate}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={18} /> New Promotion
                </button>
            </div>

            <div style={styles.card}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Code</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Type</th>
                            <th style={styles.th}>Value</th>
                            <th style={styles.th}>Validity</th>
                            <th style={styles.th}>Status</th>
                            <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map(promo => (
                            <tr 
                                key={promo.promotion_id} 
                                onMouseEnter={(e) => e.currentTarget.style.background = '#fcfdfe'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={styles.td}>
                                    <div style={styles.codeBadge}>
                                        <Tag size={14} />
                                        {promo.promotion_code}
                                    </div>
                                </td>
                                <td style={{...styles.td, fontWeight: 600, color: '#0f172a'}}>
                                    {promo.promotion_name}
                                </td>
                                <td style={{...styles.td, color: '#64748b'}}>
                                    {promo.discount_type === 'BuyXGetY' ? 'Buy X Get Y' : promo.discount_type}
                                </td>
                                <td style={{...styles.td, fontWeight: 700, color: '#dc2626', fontSize: '15px'}}>
                                    {promo.discount_type === 'Percentage' ? `-${promo.discount_value}%` :
                                        promo.discount_type === 'BuyXGetY' ? `Buy ${promo.buy_x} Get ${promo.get_y}` :
                                            `-${parseInt(promo.discount_value).toLocaleString()}₫`}
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                                        <Calendar size={14} />
                                        <span>
                                            {new Date(promo.start_date).toLocaleDateString('vi-VN')} - {new Date(promo.end_date).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.statusBadge(promo.status)}>{promo.status || 'draft'}</span>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button 
                                            style={{...styles.btnIcon, background: '#f1f5f9', color: '#475569'}} 
                                            onClick={() => handleEdit(promo)}
                                            title="Edit"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            style={{...styles.btnIcon, background: '#fef2f2', color: '#ef4444'}} 
                                            onClick={() => setDeleteModal({ open: true, id: promo.promotion_id })}
                                            title="Delete"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {promotions.length === 0 && !loading && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                                    <div style={{ marginBottom: '10px' }}><Tag size={40} strokeWidth={1.5} /></div>
                                    No promotions found. Create one to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <PromotionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                promotion={selectedPromo}
                onSuccess={fetchPromotions}
            />

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{ 
                            width: '64px', height: '64px', background: '#fee2e2', borderRadius: '50%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                            color: '#dc2626'
                        }}>
                            <AlertTriangle size={32} />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a' }}>Delete Promotion?</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
                            Are you sure you want to delete this promotion? <br/>This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button 
                                style={{ 
                                    padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', 
                                    background: 'white', fontWeight: 600, color: '#64748b', cursor: 'pointer' 
                                }}
                                onClick={() => setDeleteModal({ open: false, id: null })}
                            >
                                Cancel
                            </button>
                            <button 
                                style={{ 
                                    padding: '10px 20px', borderRadius: '10px', border: 'none', 
                                    background: '#dc2626', fontWeight: 600, color: 'white', cursor: 'pointer' 
                                }}
                                onClick={confirmDelete}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPromotions;