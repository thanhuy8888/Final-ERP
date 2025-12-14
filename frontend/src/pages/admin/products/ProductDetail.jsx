import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { ArrowLeft, Edit, Clock, Package, Tag, Layers, History, User, Plus, Trash, Eye, Barcode, Check, X, RotateCcw } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');

    // Variant Modal State
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);
    const [variantForm, setVariantForm] = useState({
        sku: '',
        barcode: '',
        size: '',
        color: '',
        quantity: 0,
        price_adjustment: 0
    });

    // Delete Confirmation State
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/admin/products.php?id=${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error("Failed to fetch product", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const handleAddVariant = () => {
        setEditingVariant(null);
        setVariantForm({ sku: `${product.sku}-`, barcode: '', size: '', color: '', quantity: 0, price_adjustment: 0 });
        setShowVariantModal(true);
    };

    const handleEditVariant = (variant) => {
        setEditingVariant(variant);
        setVariantForm({ ...variant });
        setShowVariantModal(true);
    };

    const handleSaveVariant = async () => {
        try {
            const payload = {
                ...variantForm,
                product_id: parseInt(id),
                action: editingVariant ? 'update' : 'create',
                id: editingVariant ? editingVariant.variant_id : undefined
            };

            await api.post('/admin/variants.php', payload);
            setShowVariantModal(false);
            fetchProduct(); // Refresh
            success(t('common.saveSuccess'));
        } catch (error) {
            showError('Failed to save variant: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleToggleStatus = async (variantId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await api.post('/admin/variants.php', {
                action: 'toggle_status',
                id: variantId,
                status: newStatus
            });
            fetchProduct();
            success(t('common.saveSuccess'));
        } catch (error) {
            console.error("Failed to toggle status", error);
            showError("Failed to update status");
        }
    };

    const handleDeleteVariantClick = (variantId) => {
        setDeleteModal({ open: true, id: variantId });
    };

    const confirmDeleteVariant = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await api.post('/admin/variants.php', {
                action: 'delete',
                id: deleteModal.id
            });
            fetchProduct();
            setDeleteModal({ open: false, id: null });
            success(t('common.deleteSuccess'));
        } catch (error) {
            showError('Cannot delete: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsDeleting(false);
        }
    };

    const generateBarcode = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setVariantForm(prev => ({ ...prev, barcode: `893${timestamp}${random}` }));
    };

    if (loading) return <div className="loading-center">{t('common.loading')}</div>;
    if (!product) return <div className="error-center">Product not found</div>;

    const renderAuditValue = (val) => {
        if (!val) return '-';
        try {
            const parsed = JSON.parse(val);
            return <pre className="json-view">{JSON.stringify(parsed, null, 2)}</pre>;
        } catch (e) {
            return val;
        }
    };

    return (
        <div className="product-detail-page">
            <div className="detail-header">
                <Link to="/admin/products" className="back-link">
                    <ArrowLeft size={18} /> {t('common.back')}
                </Link>
                <div className="header-content">
                    <div className="title-section">
                        <h1>{product.name}</h1>
                        <span className={`status-badge ${product.status}`}>{product.status || 'Active'}</span>
                    </div>
                    <Link to={`/admin/products/edit/${product.id}`} className="btn-primary">
                        <Edit size={16} /> {t('common.edit')}
                    </Link>
                </div>
            </div>

            <div className="detail-tabs">
                <button
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <Package size={16} /> General Info
                </button>
                <button
                    className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('variants')}
                >
                    <Layers size={16} /> Variants (SKU)
                </button>
                <button
                    className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('audit')}
                >
                    <History size={16} /> Audit Log
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'general' && (
                    <div className="info-grid">
                        <div className="info-card">
                            <h3>Basic Information</h3>
                            <div className="info-row">
                                <label>Category</label>
                                <span>{product.category_name || '-'}</span>
                            </div>
                            <div className="info-row">
                                <label>Price</label>
                                <span className="price">{Number(product.price).toLocaleString()}₫</span>
                            </div>
                            <div className="info-row">
                                <label>SKU</label>
                                <span>{product.sku || '-'}</span>
                            </div>
                            <div className="info-row">
                                <label>Material</label>
                                <span>{product.material || '-'}</span>
                            </div>
                            <div className="info-row">
                                <label>Created At</label>
                                <span>{new Date(product.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="info-card image-card">
                            <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                        </div>
                        <div className="info-card full-width">
                            <h3>Description</h3>
                            <p>{product.description || 'No description available.'}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'variants' && (
                    <div className="variants-section">
                        <div className="section-actions mb-4" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                            <button className="btn-primary" onClick={handleAddVariant} style={{ fontSize: '13px', padding: '8px 12px' }}>
                                <Plus size={16} /> Add Variant
                            </button>
                        </div>
                        <div className="variants-list table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>SKU / Barcode</th>
                                        <th>Attribute (Size/Color)</th>
                                        <th>Stock</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.variants?.map((v, i) => (
                                        <tr key={v.variant_id || i} className={v.status === 'inactive' ? 'row-inactive' : ''}>
                                            <td>
                                                <div className="fw-bold">{v.sku || '-'}</div>
                                                <div className="text-muted text-small">{v.barcode || 'No Barcode'}</div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="badge badge-neutral">{v.size}</span>
                                                    <span className="color-dot" style={{ backgroundColor: v.color }} title={v.color}></span>
                                                </div>
                                            </td>
                                            <td>
                                                {v.quantity > 0 ? (
                                                    <span className="text-green fw-bold">{v.quantity}</span>
                                                ) : (
                                                    <span className="text-red">Out of Stock</span>
                                                )}
                                                <Link to="/admin/inventory" className="ms-2 text-muted" title="Go to Inventory"><Eye size={12} /></Link>
                                            </td>
                                            <td>
                                                {v.price_adjustment > 0 ? (
                                                    <span className="text-green">+{Number(v.price_adjustment).toLocaleString()}₫</span>
                                                ) : (
                                                    v.price_adjustment < 0 ? (
                                                        <span className="text-red">{Number(v.price_adjustment).toLocaleString()}₫</span>
                                                    ) : '-'
                                                )}
                                                <div className="text-muted text-small">
                                                    = {Number(Number(product.price) + Number(v.price_adjustment)).toLocaleString()}₫
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className={`status-toggle ${v.status || 'active'}`}
                                                    onClick={() => handleToggleStatus(v.variant_id, v.status || 'active')}
                                                >
                                                    {v.status || 'active'}
                                                </button>
                                            </td>
                                            <td className="text-right">
                                                <div className="action-buttons">
                                                    <button onClick={() => handleEditVariant(v)} className="btn-icon text-blue" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteVariantClick(v.variant_id)} className="btn-icon text-red" title="Delete">
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!product.variants || product.variants.length === 0) && (
                                        <tr><td colSpan="6" className="text-center">No variants found. Add one to start selling!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="audit-list">
                        <div className="timeline">
                            {product.audit_logs?.map((log) => (
                                <div key={log.id} className="timeline-item">
                                    <div className="timeline-icon">
                                        <Clock size={14} />
                                    </div>
                                    <div className="timeline-content">
                                        <div className="timeline-header">
                                            <span className="user-name">
                                                <User size={12} /> {log.user_name || 'System'}
                                            </span>
                                            <span className="action-tag">{log.action}</span>
                                            <span className="date">{new Date(log.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="changes-grid">
                                            {log.old_value && (
                                                <div className="change-box old">
                                                    <strong>Before:</strong>
                                                    {renderAuditValue(log.old_value)}
                                                </div>
                                            )}
                                            {log.new_value && (
                                                <div className="change-box new">
                                                    <strong>After:</strong>
                                                    {renderAuditValue(log.new_value)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!product.audit_logs || product.audit_logs.length === 0) && (
                                <div className="text-center text-muted">No history available</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Variant Modal (Edit/Add) */}
            {showVariantModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingVariant ? 'Edit Variant' : 'Add New Variant'}</h3>
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Size</label>
                                <input
                                    type="text"
                                    value={variantForm.size}
                                    onChange={e => setVariantForm({ ...variantForm, size: e.target.value })}
                                    placeholder="S, M, L..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Color (Hex/Name)</label>
                                <div className="d-flex gap-2">
                                    <input
                                        type="text"
                                        value={variantForm.color}
                                        onChange={e => setVariantForm({ ...variantForm, color: e.target.value })}
                                        placeholder="#FF0000 or Red"
                                    />
                                    <input
                                        type="color"
                                        value={variantForm.color.startsWith('#') ? variantForm.color : '#000000'}
                                        onChange={e => setVariantForm({ ...variantForm, color: e.target.value })}
                                        style={{ width: '40px', padding: 0, height: '38px' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>SKU</label>
                                <input
                                    type="text"
                                    value={variantForm.sku}
                                    onChange={e => setVariantForm({ ...variantForm, sku: e.target.value })}
                                    placeholder="Unique SKU"
                                />
                            </div>
                            <div className="form-group">
                                <label>Barcode</label>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        value={variantForm.barcode}
                                        onChange={e => setVariantForm({ ...variantForm, barcode: e.target.value })}
                                        placeholder="Scan or Generate"
                                    />
                                    <button type="button" className="btn-secondary" onClick={generateBarcode} title="Generate">
                                        <Barcode size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="form-group-row">
                            <div className="form-group">
                                <label>Price Adjustment (+/-)</label>
                                <input
                                    type="number"
                                    value={variantForm.price_adjustment}
                                    onChange={e => setVariantForm({ ...variantForm, price_adjustment: e.target.value })}
                                    placeholder="Use negative for discount (e.g. -50000)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Initial Stock</label>
                                <input
                                    type="number"
                                    value={variantForm.quantity}
                                    onChange={e => setVariantForm({ ...variantForm, quantity: e.target.value })}
                                    disabled={!!editingVariant} // Disable editing stock here per requirements
                                    title={editingVariant ? "Manage stock in Inventory module" : "Initial stock"}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-text" onClick={() => setShowVariantModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveVariant}>Save Variant</button>
                        </div>
                    </div>
                </div>
            )}

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
                                onClick={confirmDeleteVariant}
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

export default ProductDetail;
