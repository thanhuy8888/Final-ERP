import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { useToast } from '../../../contexts/ToastContext';
import {
    Tag,
    Plus,
    Edit,
    Trash,
    Search,
    ChevronRight,
    CornerDownRight,
    FolderTree,
    Info,
    AlertCircle
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
        setLoading(true);
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
            setCategories(categories.map(c => c.id === id ? { ...c, status: newStatus } : c));
            success(t('common.saveSuccess'));
        } catch (error) {
            showError('Failed to update status');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const parentOptions = categories.filter(c => !editingCategory || c.id !== editingCategory.id);

    return (
        <motion.div 
            className="category-list-page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="page-header">
                <div className="header-left">
                    <div className="breadcrumb">
                        <span>{t('admin.panel')}</span> 
                        <ChevronRight size={14} /> 
                        <span className="active">{t('admin.categories')}</span>
                    </div>
                    <h1>📁 {t('admin.categories')}</h1>
                    <p className="subtitle">Quản lý và phân loại danh mục sản phẩm hệ thống</p>
                </div>
                <button className="btn-primary" onClick={handleAddClick}>
                    <Plus size={18} /> {t('admin.addCategory') || 'Thêm danh mục'}
                </button>
            </div>

            <div className="content-card">
                <div className="toolbar">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="summary-info">
                        <span>{filteredCategories.length} danh mục</span>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>{t('common.loading')}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Tên danh mục</th>
                                    <th>Danh mục cha</th>
                                    <th>Sản phẩm</th>
                                    <th>Trạng thái</th>
                                    <th className="text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredCategories.map((category) => (
                                        <motion.tr 
                                            key={category.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td>
                                                <div className="category-name-cell">
                                                    <div className="category-icon-wrapper">
                                                        {category.parent_id ? <CornerDownRight size={16} /> : <FolderTree size={16} />}
                                                    </div>
                                                    <div>
                                                        <span className="cat-name">{category.name}</span>
                                                        {category.description && (
                                                            <small className="cat-desc">{category.description}</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {category.parent_name ? (
                                                    <span className="badge badge-neutral">{category.parent_name}</span>
                                                ) : <span className="text-muted">—</span>}
                                            </td>
                                            <td>
                                                <span className="badge badge-blue">
                                                    {category.product_count || 0} items
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`status-toggle ${category.status}`}
                                                    onClick={() => handleToggleStatus(category.id, category.status)}
                                                >
                                                    {category.status === 'active' ? '● Active' : '○ Inactive'}
                                                </button>
                                            </td>
                                            <td className="text-right">
                                                <div className="action-buttons">
                                                    <button className="btn-icon text-blue" onClick={() => handleEditClick(category)}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        className="btn-icon text-red" 
                                                        onClick={() => setDeleteModal({ open: true, id: category.id })}
                                                        disabled={category.product_count > 0}
                                                        title={category.product_count > 0 ? "Cannot delete category with products" : "Delete"}
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {filteredCategories.length === 0 && (
                            <div className="empty-box">
                                <AlertCircle size={40} />
                                <p>Không tìm thấy danh mục nào</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay" onClick={() => setShowModal(false)}>
                        <motion.div 
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3>{editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h3>
                            
                            <div className="form-group">
                                <label>Tên danh mục</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nhập tên..."
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label>Danh mục cha</label>
                                <select
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                >
                                    <option value="">Không có (Danh mục gốc)</option>
                                    {parentOptions.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Mô tả ngắn gọn..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Trạng thái hiển thị</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Hoạt động (Active)</option>
                                    <option value="inactive">Ẩn (Inactive)</option>
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button className="btn-primary" onClick={handleSave}>Lưu thông tin</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal.open && (
                    <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, id: null })}>
                        <motion.div 
                            className="modal-content confirm-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-icon-danger">
                                <Trash size={32} />
                            </div>
                            <h3>Xóa danh mục?</h3>
                            <p>Hành động này không thể hoàn tác. Dữ liệu danh mục sẽ bị xóa vĩnh viễn.</p>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setDeleteModal({ open: false, id: null })}>Hủy</button>
                                <button className="btn-danger" onClick={confirmDelete}>Xác nhận xóa</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CategoryList;