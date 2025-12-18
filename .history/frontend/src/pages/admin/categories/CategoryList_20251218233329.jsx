import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { useToast } from '../../../contexts/ToastContext';
import {
    Plus, Edit, Trash, Search, ChevronRight, 
    CornerDownRight, Layers, CheckCircle, AlertCircle, List, X
} from 'lucide-react';
import './CategoryList.css';

const CategoryList = () => {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const stats = {
        total: categories.length,
        active: categories.filter(c => c.status === 'active').length,
        parent: categories.filter(c => !c.parent_id).length
    };

    return (
        <div className="category-container">
            <header className="page-header-new">
                <div className="header-left">
                    <h1>{t('admin.categories')}</h1>
                    <p>Manage your product taxonomy and hierarchy</p>
                </div>
                <button className="btn-add-new" onClick={handleAddClick}>
                    <Plus size={20} />
                    <span>Add Category</span>
                </button>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><List size={24} /></div>
                    <div>
                        <span className="stat-label">Total</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><CheckCircle size={24} /></div>
                    <div>
                        <span className="stat-label">Active</span>
                        <span className="stat-value">{stats.active}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange"><Layers size={24} /></div>
                    <div>
                        <span className="stat-label">Main</span>
                        <span className="stat-value">{stats.parent}</span>
                    </div>
                </div>
            </div>

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
                                <th>Parent</th>
                                <th>Products</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i}><td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>Loading...</td></tr>
                                ))
                            ) : filteredCategories.map((category) => (
                                <tr key={category.id}>
                                    <td>
                                        <div className="name-cell">
                                            {category.parent_id && <CornerDownRight size={18} className="sub-icon" />}
                                            <div>
                                                <div className="name-text">{category.name}</div>
                                                {category.description && <div className="desc-text">{category.description}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {category.parent_name ? (
                                            <span className="parent-badge">{category.parent_name}</span>
                                        ) : <span style={{color:'#cbd5e1'}}>—</span>}
                                    </td>
                                    <td>
                                        <span className="count-badge">{category.product_count || 0}</span>
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
                                            <button className="btn-edit" onClick={() => handleEditClick(category)}>
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                className="btn-delete" 
                                                disabled={category.product_count > 0}
                                                onClick={() => setDeleteModal({ open: true, id: category.id })}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-blur">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3>{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={18}/></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Summer Collection"
                                />
                            </div>
                            <div className="input-group">
                                <label>Parent Category</label>
                                <select
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                >
                                    <option value="">None (Root)</option>
                                    {categories.filter(c => !editingCategory || c.id !== editingCategory.id).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description..."
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

            {deleteModal.open && (
                <div className="modal-blur">
                    <div className="modal-box" style={{ maxWidth: '400px' }}>
                        <div className="modal-body" style={{textAlign:'center', padding:'40px 32px'}}>
                            <div style={{background:'#fee2e2', color:'#ef4444', width:'64px', height:'64px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px'}}>
                                <AlertCircle size={32} />
                            </div>
                            <h3 style={{margin:'0 0 8px 0', fontSize:'20px'}}>Are you sure?</h3>
                            <p style={{color:'#64748b', margin:0}}>This action cannot be undone. All data will be lost.</p>
                        </div>
                        <div className="modal-footer" style={{justifyContent:'center', background:'white'}}>
                            <button className="btn-cancel" onClick={() => setDeleteModal({ open: false, id: null })}>Cancel</button>
                            <button className="btn-save" style={{background:'#ef4444'}} onClick={async () => {
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