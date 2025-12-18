import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { useToast } from '../../../contexts/ToastContext';
import {
    Plus, Edit, Trash, Search, ChevronRight, 
    CornerDownRight, Layers, CheckCircle, AlertCircle, List
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

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/admin/categories.php');
            setCategories(response.data);
        } catch (error) {
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
            showError(error.response?.data?.error || 'Failed to save');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await api.post('/admin/categories.php', { action: 'toggle_status', id, status: newStatus });
            fetchCategories();
            success(t('common.saveSuccess'));
        } catch (error) {
            showError('Update failed');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Quick Stats
    const stats = {
        total: categories.length,
        active: categories.filter(c => c.status === 'active').length,
        parent: categories.filter(c => !c.parent_id).length
    };

    return (
        <div className="category-container">
            {/* Header Section */}
            <header className="page-header-new">
                <div className="header-left">
                    <div className="icon-box">
                        <Layers size={24} />
                    </div>
                    <div>
                        <h1>{t('admin.categories')}</h1>
                        <p>Manage product classification and hierarchy</p>
                    </div>
                </div>
                <button className="btn-add-new" onClick={handleAddClick}>
                    <Plus size={20} />
                    <span>Add Category</span>
                </button>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><List size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Total Categories</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><CheckCircle size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Active</span>
                        <span className="stat-value">{stats.active}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange"><Layers size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Main Categories</span>
                        <span className="stat-value">{stats.parent}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="main-card">
                <div className="card-toolbar">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Category Name</th>
                                <th>Parent Category</th>
                                <th>Product Count</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="skeleton-row">
                                        <td colSpan="5"><div className="skeleton-line"></div></td>
                                    </tr>
                                ))
                            ) : filteredCategories.map((category) => (
                                <tr key={category.id} className={category.parent_id ? 'sub-row' : 'parent-row'}>
                                    <td>
                                        <div className="name-cell">
                                            {category.parent_id && <CornerDownRight size={16} className="sub-icon" />}
                                            <div>
                                                <span className="name-text">{category.name}</span>
                                                {category.description && <p className="desc-text">{category.description}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {category.parent_name ? (
                                            <span className="parent-badge">{category.parent_name}</span>
                                        ) : <span className="root-badge">Root</span>}
                                    </td>
                                    <td>
                                        <div className="count-badge">
                                            {category.product_count || 0} Products
                                        </div>
                                    </td>
                                    <td>
                                        <label className="switch-status">
                                            <input 
                                                type="checkbox" 
                                                checked={category.status === 'active'} 
                                                onChange={() => handleToggleStatus(category.id, category.status)}
                                            />
                                            <span className="slider"></span>
                                            <span className="status-label">{category.status}</span>
                                        </label>
                                    </td>
                                    <td>
                                        <div className="actions-group">
                                            <button className="btn-edit" title="Edit" onClick={() => handleEditClick(category)}>
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                className="btn-delete" 
                                                title="Delete"
                                                disabled={category.product_count > 0}
                                                onClick={() => setDeleteModal({ open: true, id: category.id })}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredCategories.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">No categories found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Modern Style */}
            {showModal && (
                <div className="modal-blur">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3>{editingCategory ? 'Update Category' : 'Add New Category'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><Plus style={{transform: 'rotate(45deg)'}} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Category Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Men's Jackets"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Parent Category</label>
                                    <select
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    >
                                        <option value="">None (Root Category)</option>
                                        {categories.filter(c => !editingCategory || c.id !== editingCategory.id).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group mt-3">
                                <label>Short Description</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter category details..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="modal-blur">
                    <div className="modal-box" style={{ maxWidth: '400px' }}>
                        <div className="modal-body text-center py-4">
                            <div className="delete-icon-box">
                                <AlertCircle size={48} color="#ef4444" />
                            </div>
                            <h3 className="mt-3">Are you sure?</h3>
                            <p className="text-muted">This action cannot be undone. This category will be permanently removed.</p>
                        </div>
                        <div className="modal-footer justify-content-center">
                            <button className="btn-cancel" onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</button>
                            <button className="btn-save" style={{ background: '#ef4444' }} onClick={async () => {
                                try {
                                    await api.post('/admin/categories.php', { action: 'delete', id: deleteModal.id });
                                    success(t('common.deleteSuccess'));
                                    fetchCategories();
                                    setDeleteModal({ open: false, id: null });
                                } catch (err) { showError('Delete failed'); }
                            }}>Delete Now</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;