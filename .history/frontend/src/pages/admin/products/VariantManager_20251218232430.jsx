import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { Edit, Trash, Search, Eye, MoreHorizontal, Package, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion'; // Thêm animation nếu bạn đã cài
import './ProductList.css';

const VariantManager = () => {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { fetchVariants(); }, []);

    const fetchVariants = async () => {
        try {
            const response = await api.get('/admin/variants.php');
            setVariants(response.data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await api.post('/admin/variants.php', { action: 'toggle_status', id, status: newStatus });
            setVariants(variants.map(v => v.id === id ? { ...v, status: newStatus } : v));
            success(t('common.saveSuccess'));
        } catch (error) { showError("Failed to update status"); }
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await api.post('/admin/variants.php', { action: 'delete', id: deleteModal.id });
            setVariants(variants.filter(v => v.id !== deleteModal.id));
            setDeleteModal({ open: false, id: null });
            success(t('common.deleteSuccess'));
        } catch (error) { showError('Cannot delete variant'); } 
        finally { setIsDeleting(false); }
    };

    const filteredVariants = variants.filter(v => {
        const matchesSearch = (v.sku?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (v.barcode?.includes(searchTerm)) ||
                              (v.product_name?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || (v.status || 'active') === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="loading-center"><Package className="animate-spin mr-2" /> {t('common.loading')}</div>;

    return (
        <div className="variant-manager-page">
            <div className="page-header">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1>{t('admin.variants')}</h1>
                    <p className="subtitle">{t('admin.variantSubtitle')}</p>
                </motion.div>
            </div>

            <div className="filter-bar">
                <div className="search-group">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('admin.searchPlaceholder') || "Tìm kiếm SKU, tên sản phẩm hoặc mã vạch..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">🌐 {t('common.allStatus')}</option>
                        <option value="active">🟢 Active</option>
                        <option value="inactive">🔴 Inactive</option>
                    </select>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Ảnh</th>
                            <th>Sản phẩm / SKU</th>
                            <th>Thuộc tính</th>
                            <th>Barcode</th>
                            <th>Tồn kho</th>
                            <th>Giá cộng thêm</th>
                            <th>Trạng thái</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredVariants.map((variant) => (
                                <motion.tr 
                                    key={variant.id} 
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={variant.status === 'inactive' ? 'row-inactive' : ''}
                                >
                                    <td>
                                        <img src={variant.product_image || '/placeholder.jpg'} className="variant-img" alt="" />
                                    </td>
                                    <td>
                                        <div className="font-bold text-navy">{variant.product_name}</div>
                                        <div className="text-xs text-muted font-mono">{variant.sku}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge-attribute">{variant.size}</span>
                                            <span className="color-dot" style={{ width: 14, height: 14, borderRadius: '4px', background: variant.color, border: '1px solid #eee' }}></span>
                                        </div>
                                    </td>
                                    <td className="text-muted font-mono">{variant.barcode || '-'}</td>
                                    <td>
                                        <span className={`stock-tag ${variant.quantity > 0 ? 'in-stock' : 'out-stock'}`}>
                                            {variant.quantity} pcs
                                        </span>
                                    </td>
                                    <td className="font-bold">
                                        {variant.price_adjustment > 0 ? `+${Number(variant.price_adjustment).toLocaleString()}₫` : '0₫'}
                                    </td>
                                    <td>
                                        <button
                                            className={`status-pill ${variant.status || 'active'}`}
                                            onClick={() => handleToggleStatus(variant.id, variant.status || 'active')}
                                        >
                                            {variant.status === 'inactive' ? <XCircle size={14} className="d-inline mr-1" /> : <CheckCircle size={14} className="d-inline mr-1" />}
                                            {(variant.status || 'active').toUpperCase()}
                                        </button>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-buttons">
                                            <Link to={`/admin/products/${variant.product_id}`} className="btn-icon text-blue">
                                                <Eye size={18} />
                                            </Link>
                                            <button onClick={() => handleDeleteClick(variant.id)} className="btn-icon text-red">
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Delete Modal - Thiết kế lại Modern */}
            {deleteModal.open && (
                <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, id: null })}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="modal-content" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-red-500 mb-4"><Trash size={48} className="mx-auto" /></div>
                        <h3 className="text-xl font-extrabold mb-2">Xóa biến thể này?</h3>
                        <p className="text-gray-500 mb-6">Hành động này không thể hoàn tác. Dữ liệu kho của SKU này sẽ bị mất.</p>
                        <div className="d-flex justify-content-center gap-3">
                            <button className="btn-secondary px-4 py-2" onClick={() => setDeleteModal({ open: false, id: null })}>Hủy</button>
                            <button className="btn-primary bg-red-500 px-4 py-2" onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Đang xử lý...' : 'Xác nhận xóa'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default VariantManager;import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { Edit, Trash, Search, Eye, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductList.css';

const VariantManager = () => {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { fetchVariants(); }, []);

    const fetchVariants = async () => {
        try {
            const response = await api.get('/admin/variants.php');
            setVariants(response.data);
        } catch (error) { 
            console.error(error); 
            showError("Failed to load variants");
        } finally { 
            setLoading(false); 
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await api.post('/admin/variants.php', { action: 'toggle_status', id, status: newStatus });
            setVariants(variants.map(v => v.id === id ? { ...v, status: newStatus } : v));
            success("Status updated successfully");
        } catch (error) { 
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
            success("Variant deleted successfully");
        } catch (error) { 
            showError('Cannot delete variant. It might be linked to existing orders.'); 
        } finally { 
            setIsDeleting(false); 
        }
    };

    const filteredVariants = variants.filter(v => {
        const matchesSearch = (v.sku?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                              (v.barcode?.includes(searchTerm)) ||
                              (v.product_name?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || (v.status || 'active') === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) return (
        <div className="loading-center">
            <Package className="animate-spin mr-2" /> 
            <span>Loading variants...</span>
        </div>
    );

    return (
        <div className="variant-manager-page">
            <div className="page-header">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1>Product Variants</h1>
                    <p className="subtitle">Manage SKUs, stock levels, and specific product attributes</p>
                </motion.div>
            </div>

            <div className="filter-bar">
                <div className="search-group">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search SKU, product name, or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">🌐 All Statuses</option>
                        <option value="active">🟢 Active</option>
                        <option value="inactive">🔴 Inactive</option>
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
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredVariants.map((variant) => (
                                <motion.tr 
                                    key={variant.id} 
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={variant.status === 'inactive' ? 'row-inactive' : ''}
                                >
                                    <td>
                                        <img src={variant.product_image || '/placeholder.jpg'} className="variant-img" alt="" />
                                    </td>
                                    <td>
                                        <div className="font-bold text-navy">{variant.product_name}</div>
                                        <div className="text-xs text-muted font-mono">{variant.sku}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge-attribute">{variant.size}</span>
                                            <span 
                                                className="color-dot" 
                                                style={{ 
                                                    width: 14, 
                                                    height: 14, 
                                                    borderRadius: '4px', 
                                                    background: variant.color, 
                                                    border: '1px solid #eee' 
                                                }}
                                                title={variant.color_name || variant.color}
                                            ></span>
                                        </div>
                                    </td>
                                    <td className="text-muted font-mono">{variant.barcode || '-'}</td>
                                    <td>
                                        <span className={`stock-tag ${variant.quantity > 0 ? 'in-stock' : 'out-stock'}`}>
                                            {variant.quantity} pcs
                                        </span>
                                    </td>
                                    <td className="font-bold">
                                        {variant.price_adjustment > 0 ? `+$${Number(variant.price_adjustment).toLocaleString()}` : '$0'}
                                    </td>
                                    <td>
                                        <button
                                            className={`status-pill ${variant.status || 'active'}`}
                                            onClick={() => handleToggleStatus(variant.id, variant.status || 'active')}
                                        >
                                            {variant.status === 'inactive' ? <XCircle size={14} className="d-inline mr-1" /> : <CheckCircle size={14} className="d-inline mr-1" />}
                                            {(variant.status || 'active').toUpperCase()}
                                        </button>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-buttons">
                                            <Link to={`/admin/products/${variant.product_id}`} className="btn-icon text-blue" title="View Product">
                                                <Eye size={18} />
                                            </Link>
                                            <button onClick={() => handleDeleteClick(variant.id)} className="btn-icon text-red" title="Delete Variant">
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                        {!loading && filteredVariants.length === 0 && (
                            <tr>
                                <td colSpan="8" className="text-center py-5 text-muted">
                                    No variants found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete Modal */}
            {deleteModal.open && (
                <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, id: null })}>
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        className="modal-content" 
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '450px' }}
                    >
                        <div className="text-red-500 mb-4">
                            <AlertCircle size={54} className="mx-auto" />
                        </div>
                        <h3 className="text-xl font-extrabold mb-2">Delete this variant?</h3>
                        <p className="text-gray-500 mb-6">
                            This action cannot be undone. Inventory data for SKU <strong>{variants.find(v => v.id === deleteModal.id)?.sku}</strong> will be permanently lost.
                        </p>
                        <div className="d-flex justify-content-center gap-3">
                            <button className="btn-secondary px-4 py-2" onClick={() => setDeleteModal({ open: false, id: null })}>
                                Cancel
                            </button>
                            <button className="btn-danger px-4 py-2" onClick={confirmDelete} disabled={isDeleting}>
                                {isDeleting ? 'Processing...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default VariantManager;