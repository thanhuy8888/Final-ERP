import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Trash, Edit, Plus, Calendar, Tag, AlertTriangle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import PromotionModal from '../../components/modals/PromotionModal';
import './Orders.css';

const AdminPromotions = () => {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState(null);

    // Delete State
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/promotions.php');
            setPromotions(response.data);
        } catch (error) {
            console.error("Failed to fetch promotions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleEdit = (promo) => {
        setSelectedPromo(promo);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedPromo(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ open: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await api.delete('/admin/promotions.php', { data: { promotion_id: deleteModal.id } });
            fetchPromotions();
            setDeleteModal({ open: false, id: null });
            success('Promotion deleted');
        } catch (error) {
            showError('Delete failed');
        }
    };

    const getStatusBadge = (promo) => {
        const status = promo.status || 'draft';
        const styles = {
            draft: { bg: '#f1f5f9', color: '#64748b' },
            active: { bg: '#dcfce7', color: '#166534' },
            expired: { bg: '#fee2e2', color: '#991b1b' }
        };
        const s = styles[status] || styles['draft'];
        return (
            <span style={{
                background: s.bg, color: s.color,
                padding: '4px 10px', borderRadius: '20px',
                fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase'
            }}>
                {status}
            </span>
        );
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Promotion Management</h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>Manage discounts, coupons, and special offers.</p>
                </div>
                <button
                    className="btn-modern primary"
                    onClick={handleCreate}
                    style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                >
                    <Plus size={16} /> New Promotion
                </button>
            </div>

            <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Validity</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map(promo => (
                            <tr key={promo.promotion_id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Tag size={14} color="#dc2626" />
                                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{promo.promotion_code}</span>
                                    </div>
                                </td>
                                <td>{promo.promotion_name}</td>
                                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    {promo.discount_type === 'BuyXGetY' ? 'Buy X Get Y' : promo.discount_type}
                                </td>
                                <td style={{ fontWeight: 700, color: '#dc2626' }}>
                                    {promo.discount_type === 'Percentage' ? `-${promo.discount_value}%` :
                                        promo.discount_type === 'BuyXGetY' ? `Buy ${promo.buy_x} Get ${promo.get_y}` :
                                            `-${parseInt(promo.discount_value).toLocaleString()}₫`}
                                </td>
                                <td style={{ fontSize: '0.8rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} />
                                        {new Date(promo.start_date).toLocaleDateString('vi-VN')} - {new Date(promo.end_date).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td>{getStatusBadge(promo)}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button className="btn-view-modern" onClick={() => handleEdit(promo)}>
                                            <Edit size={14} />
                                        </button>
                                        <button className="btn-view-modern" style={{ color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }} onClick={() => handleDeleteClick(promo.promotion_id)}>
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {promotions.length === 0 && !loading && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
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
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', color: '#dc2626' }}>
                            <div style={{ background: '#FEE2E2', padding: '12px', borderRadius: '50%' }}>
                                <AlertTriangle size={32} />
                            </div>
                        </div>
                        <h3 style={{ marginBottom: '10px' }}>Delete Promotion?</h3>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Are you sure you want to delete this promotion? This action cannot be undone.</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <button className="btn-modern secondary" onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</button>
                            <button className="btn-modern primary" style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }} onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPromotions;
