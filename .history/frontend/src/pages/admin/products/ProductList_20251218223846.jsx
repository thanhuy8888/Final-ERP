import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { 
    Search, 
    Plus, 
    RefreshCw, 
    Edit, 
    Trash, 
    Eye, 
    CheckCircle, 
    XCircle, 
    PackageSearch,
    ChevronRight,
    LayoutGrid
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductList.css';

const ProductList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal state
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
            showError(t('admin.loadError') || "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Logic lọc sản phẩm giữ nguyên
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
            setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
            success(t('common.saveSuccess'));
        } catch (error) {
            showError("Error updating status");
        }
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
            showError(error.response?.data?.error || t('common.deleteError'));
        } finally {
            setIsDeleting(false);
        }
    };

    const categories = [...new Set(products.map(p => p.category_name).filter(Boolean))];

    if (loading) return (
        <div className="loading-container">
            <RefreshCw className="spinner" size={40} />
            <p>{t('common.loading')}</p>
        </div>
    );

    return (
        <motion.div 
            className="product-list-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Header Section */}
            <header className="page-header">
                <div className="header-left">
                    <div className="breadcrumb">
                        <span>{t('admin.panel')}</span> 
                        <ChevronRight size={14} /> 
                        <span className="active">{t('admin.products')}</span>
                    </div>
                    <h1>{t('admin.productList')}</h1>
                    <p className="subtitle">{t('admin.productManagement')}</p>
                </div>
                <div className="header-actions">
                    <Link to="/admin/products/new" className="btn-primary">
                        <Plus size={18} /> 
                        <span>{t('admin.addProduct')}</span>
                    </Link>
                </div>
            </header>

            {/* Filter Bar */}
            <section className="filter-bar">
                <div className="search-group">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder={t('admin.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <div className="select-wrapper">
                        <LayoutGrid size={16} className="select-icon" />
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="">{t('admin.categories')}</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <select className="status-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">{t('common.allStatus')}</option>
                        <option value="active">{t('admin.promoStatus.active')}</option>
                        <option value="inactive">{t('orders.status.cancelled')}</option>
                    </select>

                    <button className="btn-refresh" onClick={fetchProducts} title="Refresh">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </section>

            {/* Table Section */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('admin.image')}</th>
                            <th>{t('admin.productName')}</th>
                            <th>{t('admin.category')}</th>
                            <th>{t('admin.price')}</th>
                            <th>{t('admin.variants')}</th>
                            <th>{t('admin.status')}</th>
                            <th className="text-right">{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredProducts.map(product => (
                                <motion.tr 
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={product.status === 'inactive' ? 'row-inactive' : ''}
                                >
                                    <td className="id-cell">#{product.id}</td>
                                    <td>
                                        <div className="img-wrapper">
                                            <img
                                                src={product.image || '/placeholder.jpg'}
                                                alt={product.name}
                                                className="product-thumbnail"
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="product-info-cell">
                                            <span className="product-name">{product.name}</span>
                                            <span className="product-sku">{product.sku || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-category">
                                            {product.category_name || t('common.noData')}
                                        </span>
                                    </td>
                                    <td className="price-cell">
                                        {Number(product.price).toLocaleString()}₫
                                    </td>
                                    <td>
                                        <span className="variant-count">
                                            {product.variant_count || 0} SKUs
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`status-pill ${product.status}`}
                                            onClick={() => handleToggleStatus(product.id, product.status)}
                                        >
                                            {product.status === 'active' ? (
                                                <><CheckCircle size={14} /> {t('admin.promoStatus.active')}</>
                                            ) : (
                                                <><XCircle size={14} /> {t('orders.status.cancelled')}</>
                                            )}
                                        </button>
                                    </td>
                                    <td className="text-right">
                                        <div className="action-buttons">
                                            <Link to={`/admin/products/${product.id}`} className="action-btn view" title={t('common.view')}>
                                                <Eye size={18} />
                                            </Link>
                                            <Link to={`/admin/products/edit/${product.id}`} className="action-btn edit" title={t('common.edit')}>
                                                <Edit size={18} />
                                            </Link>
                                            <button onClick={() => setDeleteModal({ open: true, id: product.id })} className="action-btn delete" title={t('common.delete')}>
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <div className="empty-state">
                        <PackageSearch size={64} />
                        <p>{t('common.noResults')}</p>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal.open && (
                    <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, id: null })}>
                        <motion.div 
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-icon-danger">
                                <Trash size={32} />
                            </div>
                            <h3>{t('admin.deleteProduct')}</h3>
                            <p>{t('common.deleteConfirm')}</p>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setDeleteModal({ open: false, id: null })} disabled={isDeleting}>
                                    {t('common.cancel')}
                                </button>
                                <button className="btn-danger" onClick={confirmDelete} disabled={isDeleting}>
                                    {isDeleting ? t('common.processing') : t('common.delete')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductList;