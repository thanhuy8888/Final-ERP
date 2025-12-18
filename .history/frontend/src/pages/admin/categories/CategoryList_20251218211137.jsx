import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { useToast } from '../../../contexts/ToastContext';
import {
    Tag,
    Plus,
    Edit,
    Trash,
    MoreVertical,
    Check,
    X,
    Search,
    ChevronRight,
    CornerDownRight
} from 'lucide-react';
import './CategoryList.css';

const CategoryList = () => {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parent_id: '',
        status: 'active'
    });

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories.php');
            setCategories(response.data);
        } catch (error) {
            console.error(error);
            showError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '', parent_id: '', status: 'active' });
        setShowModal(true);
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            parent_id: category.parent_id || '',
            status: category.status
        });
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        setDeleteModal({ open: true, id });
    };

    const confirmDelete = async () => {
        try {
            await api.post('/admin/categories.php', {
                action: 'delete',
                id: deleteModal.id
            });
            success(t('common.deleteSuccess'));
            fetchCategories();
            setDeleteModal({ open: false, id: null });
        } catch (error) {
            showError(error.response?.data?.error || t('common.deleteError'));
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            showError('Category name is required');
            return;
        }

        try {
            const payload = {
                ...formData,
                action: editingCategory ? 'update' : 'create',
                id: editingCategory ? editingCategory.id : undefined
            };

            await api.post('/admin/categories.php', payload);
            success(t('common.saveSuccess'));
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            showError(error.response?.data?.error || 'Failed to save category');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await api.post('/admin/categories.php', {
                action: 'toggle_status',
                id,
                status: newStatus
            });
            fetchCategories(); // Optimistic update would be better but refreshing is safer for now
            success(t('common.saveSuccess'));
        } catch (error) {
            showError('Failed to update status');
        }
    };

    // Filter categories
    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Build hierarchy for dropdown
    const parentOptions = categories.filter(c =>
        // Cannot pick itself as parent, and generally no circular (simple check)
        (!editingCategory || c.id !== editingCategory.id)
    );

    return (
        <div className="category-list-page">
            <div className="page-header">
                <div>
                    <h1>{t('admin.categories')}</h1>
                    <p className="subtitle">Manage product classifications</p>
                </div>
                <button className="btn-primary" onClick={handleAddClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px' }}>
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div className="content-card">
                <div className="toolbar">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">{t('common.loading')}</div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Parent Category</th>
                                    <th>Product Count</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.map((category) => (
                                    <tr key={category.id}>
                                        <td>
                                            <div className="category-name-cell">
                                                {category.parent_id && (
                                                    <CornerDownRight size={14} className="text-muted ms-2 me-2" />
                                                )}
                                                <span className="fw-bold">{category.name}</span>
                                            </div>
                                            {category.description && (
                                                <small className="text-muted d-block">{category.description}</small>
                                            )}
                                        </td>
                                        <td>
                                            {category.parent_name ? (
                                                <span className="badge badge-neutral">{category.parent_name}</span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            {category.product_count > 0 ? (
                                                <span className="badge badge-blue">{category.product_count} products</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className={`status-toggle ${category.status}`}
                                                onClick={() => handleToggleStatus(category.id, category.status)}
                                            >
                                                {category.status}
                                            </button>
                                        </td>
                                        <td className="text-right">
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon text-blue"
                                                    onClick={() => handleEditClick(category)}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon text-red"
                                                    onClick={() => handleDeleteClick(category.id)}
                                                    title="Delete"
                                                    disabled={category.product_count > 0} // Visual indicator
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCategories.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            No categories found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingCategory ? 'Edit Category' : 'New Category'}</h3>

                        <div className="form-group">
                            <label>Category Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter category name..."
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Parent Category</label>
                            <select
                                value={formData.parent_id}
                                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                            >
                                <option value="">None (Top Level)</option>
                                {parentOptions.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this category..."
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSave}>
                                {editingCategory ? 'Save Changes' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteModal.open && (
                <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, id: null })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', color: '#EF4444' }}>
                            <div style={{ background: '#FEE2E2', padding: '12px', borderRadius: '50%' }}>
                                <Trash size={32} />
                            </div>
                        </div>
                        <h3 className="mb-2">{t('common.delete')}?</h3>
                        <p className="text-muted mb-4">{t('common.deleteConfirm')}</p>
                        <div className="modal-actions justify-content-center">
                            <button className="btn-secondary" onClick={() => setDeleteModal({ open: false, id: null })}>
                                {t('common.cancel')}
                            </button>
                            <button className="btn-danger" onClick={confirmDelete}>
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;
