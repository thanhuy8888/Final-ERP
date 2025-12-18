import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { Edit, Trash, Plus, Search, Filter, Layers, Barcode, Eye } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import './ProductList.css';

const VariantManager = () => {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Delete Confirmation State
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchVariants();
    }, []);

    const fetchVariants = async () => {
        try {
            const response = await api.get('/admin/variants.php');
            setVariants(response.data);
        } catch (error) {
            console.error("Failed to fetch variants", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await api.post('/admin/variants.php', {
                action: 'toggle_status',
                id,
                status: newStatus
            });
            setVariants(variants.map(v => v.id === id ? { ...v, status: newStatus } : v));
            success(t('common.saveSuccess'));
        } catch (error) {
            console.error("Failed to toggle status", error);
            showError("Failed to update status");
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ open: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await api.post('/admin/variants.php', { action: 'delete', id: deleteModal.id });
            setVariants(variants.filter(v => v.id !== deleteModal.id));
            setDeleteModal({ open: false, id: null });
            success(t('common.deleteSuccess'));
        } catch (error) {
            showError('Cannot delete variant');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredVariants = variants.filter(v => {
        const matchesSearch =
            (v.sku?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (v.barcode?.includes(searchTerm)) ||
            (v.product_name?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="loading-center">{t('common.loading')}</div>;

    return (
        <div className="product-list-page">
            <div className="page-header">
                <div>
                    <h1>{t('admin.variants') || 'Variant Management'}</h1>
                    <p className="subtitle">{t('admin.variantSubtitle') || 'Manage all product SKUs'}</p>
                </div>
            </div>

            <div className="filter-bar">
                <div className="search-group">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('admin.searchPlaceholder') || "Search..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">{t('common.allStatus') || 'All Status'}</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Product / SKU</th>
                            <th>Attributes</th>
                            <th>Barcode</th>
                            <th>Stock</th>
                            <th>Price Adj.</th>
                            <th>Status</th>
                            <th className="text-right">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVariants.map(variant => (
                            <tr key={variant.id} className={variant.status === 'inactive' ? 'row-inactive' : ''}>
                                <td>
                                    <img
                                        src={variant.product_image || '/placeholder.jpg'}
                                        alt=""
                                        className="product-thumbnail"
                                    />
                                </td>
                                <td>
                                    <div className="product-name">{variant.product_name}</div>
                                    <div className="product-sku">{variant.sku}</div>
                                </td>
                                <td>
                                    <span className="badge badge-neutral me-1">{variant.size}</span>
                                    <span className="color-dot d-inline-block" style={{ width: 10, height: 10, borderRadius: '50%', background: variant.color }}></span>
                                </td>
                                <td>{variant.barcode || '-'}</td>
                                <td>
                                    <span className={variant.quantity > 0 ? 'text-green fw-bold' : 'text-red'}>
                                        {variant.quantity}
                                    </span>
                                </td>
                                <td>
                                    {variant.price_adjustment > 0 ? `+${Number(variant.price_adjustment).toLocaleString()}` : '-'}
                                </td>
                                <td>
                                    <button
                                        className={`status-toggle ${variant.status || 'active'}`}
                                        onClick={() => handleToggleStatus(variant.id, variant.status || 'active')}
                                    >
                                        {variant.status || 'active'}
                                    </button>
                                </td>
                                <td className="text-right">
                                    <div className="action-buttons">
                                        <Link to={`/admin/products/${variant.product_id}`} className="btn-icon text-blue" title="View Product">
                                            <Eye size={18} />
                                        </Link>
                                        <button onClick={() => handleDeleteClick(variant.id)} className="btn-icon text-red" title={t('common.delete')}>
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredVariants.length === 0 && (
                            <tr><td colSpan="8" className="text-center p-4">No variants found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, id: null })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', color: '#EF4444' }}>
                            <div style={{ background: '#FEE2E2', padding: '12px', borderRadius: '50%' }}>
                                <Trash size={32} />
                            </div>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{t('common.delete')}?</h3>
                        <p style={{ color: '#6B7280', marginBottom: '20px' }}>{t('common.deleteConfirm')}</p>
                        <div className="modal-actions" style={{ justifyContent: 'center', gap: '10px' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setDeleteModal({ open: false, id: null })}
                                disabled={isDeleting}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                className="btn-primary"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? t('common.processing') : t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariantManager;
