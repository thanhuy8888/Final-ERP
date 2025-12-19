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

    // Thống kê nhanh
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
                        <p>Quản lý cấu trúc danh mục sản phẩm của hệ thống</p>
                    </div>
                </div>
                <button className="btn-add-new" onClick={handleAddClick}>
                    <Plus size={20} />
                    <span>Thêm danh mục</span>
                </button>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue"><List size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Tổng danh mục</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><CheckCircle size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Đang hoạt động</span>
                        <span className="stat-value">{stats.active}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange"><Layers size={20} /></div>
                    <div className="stat-info">
                        <span className="stat-label">Danh mục chính</span>
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
                            placeholder="Tìm kiếm danh mục..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Tên danh mục</th>
                                <th>Danh mục cha</th>
                                <th>Số sản phẩm</th>
                                <th>Trạng thái</th>
                                <th className="text-center">Thao tác</th>
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
                                        ) : <span className="root-badge">Gốc</span>}
                                    </td>
                                    <td>
                                        <div className="count-badge">
                                            {category.product_count || 0} SP
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

            {/* Modal - Modern Style */}
            {showModal && (
                <div className="modal-blur">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3>{editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><Plus style={{transform: 'rotate(45deg)'}} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Tên danh mục</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ví dụ: Áo khoác Nam"
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Danh mục cha</label>
                                    <select
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    >
                                        <option value="">Không có (Danh mục gốc)</option>
                                        {categories.filter(c => !editingCategory || c.id !== editingCategory.id).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="input-group mt-3">
                                <label>Mô tả ngắn</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Nhập mô tả về danh mục này..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                            <button className="btn-save" onClick={handleSave}>Lưu thông tin</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;