import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { Search, Filter, Plus, FileSpreadsheet, Download, RefreshCw, MoreVertical, Edit, Trash, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import './ProductList.css';

const ProductList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Delete Confirmation State
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/products.php');
            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Apply Filters
    useEffect(() => {
        let result = products;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerTerm) ||
                p.sku?.toLowerCase().includes(lowerTerm) ||
                p.id.toString().includes(lowerTerm)
            );
        }

        if (categoryFilter) {
            result = result.filter(p => p.category_name === categoryFilter);
        }

        if (statusFilter) {
            result = result.filter(p => p.status === statusFilter);
        }

        setFilteredProducts(result);
    }, [searchTerm, categoryFilter, statusFilter, products]);

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.post('/admin/products.php', {
                id,
                action: 'toggle_status',
                status: newStatus
            });
            // Optimistic update
            setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
            success(t('common.saveSuccess'));
        } catch (error) {
            console.error("Failed to update status", error);
            showError("Error updating status");
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ open: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await api.delete('/admin/products.php', { data: { id: deleteModal.id } });
            setProducts(products.filter(p => p.id !== deleteModal.id));
            setDeleteModal({ open: false, id: null });
            success(t('common.deleteSuccess'));
        } catch (error) {
            console.error("Failed to delete product", error);
            showError(error.response?.data?.error || t('common.deleteError') || "Failed to delete product");
        } finally {
            setIsDeleting(false);
        }
    };

    // Get unique categories for filter
    const categories = [...new Set(products.map(p => p.category_name).filter(Boolean))];

    if (loading) return <div className="loading-spinner">{t('common.loading')}</div>;

    return (
        <div className="product-list-page">
            <div className="page-header">
                <div>
                    <h1>{t('admin.productList')}</h1>
                    <p className="subtitle">Manage your product catalog</p>
                </div>
                <div className="header-actions">
                    <Link to="/admin/products/new" className="btn-primary">
                        <Plus size={18} /> {t('admin.addProduct')}
                    </Link>
                </div>
            </div>

            <div className="filter-bar">
                <div className="search-group">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('admin.searchPlaceholder') || "Search products..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <button className="btn-icon" onClick={fetchProducts} title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th width="60">{t('admin.image')}</th>
                            <th>{t('admin.productName')}</th>
                            <th>{t('admin.category')}</th>
                            <th>{t('admin.price')}</th>
                            <th>Variants</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th className="text-right">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className={product.status === 'inactive' ? 'row-inactive' : ''}>
                                <td>#{product.id}</td>
                                <td>
                                    <img
                                        src={product.image || '/placeholder.jpg'}
                                        alt={product.name}
                                        className="product-thumbnail"
                                    />
                                </td>
                                <td>
                                    <div className="product-info-cell">
                                        <span className="product-name">{product.name}</span>
                                        <span className="product-sku">{product.sku || '-'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge-category">{product.category_name || 'Uncategorized'}</span>
                                </td>
                                <td className="font-medium">
                                    {Number(product.price).toLocaleString()}₫
                                </td>
                                <td>
                                    <span className="badge badge-neutral">{product.variant_count || 0}</span>
                                </td>
                                <td>
                                    <button
                                        className={`status-toggle ${product.status}`}
                                        onClick={() => handleToggleStatus(product.id, product.status)}
                                    >
                                        {product.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {product.status || 'active'}
                                    </button>
                                </td>
                                <td className="text-muted">
                                    {new Date(product.created_at).toLocaleDateString()}
                                </td>
                                <td className="text-right">
                                    <div className="action-buttons">
                                        <Link to={`/admin/products/${product.id}`} className="btn-icon text-blue" title={t('common.view')}>
                                            <Eye size={18} />
                                        </Link>
                                        <Link to={`/admin/products/edit/${product.id}`} className="btn-icon text-green" title={t('common.edit')}>
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => handleDeleteClick(product.id)} className="btn-icon text-red" title={t('common.delete')}>
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan="9" className="text-center py-5">
                                    No products found
                                </td>
                            </tr>
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
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{t('admin.deleteProduct')}?</h3>
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

export default ProductList;
