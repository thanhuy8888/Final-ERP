import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { useToast } from '../../../contexts/ToastContext';
import {
    Plus, Edit, Trash, Search, ChevronRight, 
    CornerDownRight, Layers, CheckCircle, AlertCircle, List, X
} from 'lucide-react';


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

    // --- INLINE STYLES CHO NHANH & ĐẢM BẢO CHUẨN ---
    const s = {
        pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
        headerTitle: { fontSize: '28px', fontWeight: '800', color: '#0F172A', margin: 0 },
        headerSub: { color: '#64748B', marginTop: '4px', fontSize: '15px' },
        btnAdd: { background: '#E11D48', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.2)' },
        
        // Stats
        statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' },
        statCard: { background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 4px 6px -2px rgba(0,0,0,0.03)' },
        statIcon: (color) => ({ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color === 'blue' ? '#EFF6FF' : color === 'green' ? '#F0FDF4' : '#FFF7ED', color: color === 'blue' ? '#3B82F6' : color === 'green' ? '#16A34A' : '#F97316' }),
        
        // Main Card
        mainCard: { background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' },
        toolbar: { padding: '20px 24px', borderBottom: '1px solid #F1F5F9' },
        searchBox: { display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '10px 16px', width: '300px' },
        searchInput: { border: 'none', background: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '14px', color: '#0F172A' },
        
        // Table
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { padding: '16px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' },
        td: { padding: '16px 24px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', verticalAlign: 'middle', color: '#334155' },
        
        // Name Column
        nameCell: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
        subIcon: { color: '#94A3B8', marginTop: '4px' },
        nameText: { fontWeight: '600', color: '#0F172A', display: 'block' },
        descText: { fontSize: '13px', color: '#64748B', marginTop: '2px', display: 'block', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        
        // Badges
        badge: (type) => ({ 
            padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', 
            background: type === 'root' ? '#F1F5F9' : '#EFF6FF', 
            color: type === 'root' ? '#475569' : '#3B82F6',
            border: `1px solid ${type === 'root' ? '#E2E8F0' : '#DBEAFE'}`
        }),
        countBadge: { background: '#FFF1F2', color: '#E11D48', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
        
        // Actions
        btnAction: (color) => ({ 
            width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${color === 'red' ? '#FECACA' : '#E2E8F0'}`, 
            background: color === 'red' ? '#FEF2F2' : 'white', 
            color: color === 'red' ? '#EF4444' : '#64748B', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' 
        }),

        // Modal Styles
        modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' },
        modalBox: { background: 'white', width: '500px', borderRadius: '20px', padding: '0', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
        modalHeader: { padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        modalBody: { padding: '24px' },
        modalFooter: { padding: '20px 24px', background: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #F1F5F9' },
        inputGroup: { marginBottom: '16px' },
        label: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '6px', textTransform: 'uppercase' },
        input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }
    };

    return (
        <div style={{ padding: '32px 40px', background: '#F8FAFC', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            {/* Header Section */}
            <header style={s.pageHeader}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48' }}>
                        <Layers size={24} />
                    </div>
                    <div>
                        <h1 style={s.headerTitle}>{t('admin.categories')}</h1>
                        <p style={s.headerSub}>Manage product classification and hierarchy</p>
                    </div>
                </div>
                <button style={s.btnAdd} onClick={handleAddClick}>
                    <Plus size={20} />
                    <span>Add Category</span>
                </button>
            </header>

            {/* Stats Cards */}
            <div style={s.statsGrid}>
                <div style={s.statCard}>
                    <div style={s.statIcon('blue')}><List size={22} /></div>
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Total Categories</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{stats.total}</div>
                    </div>
                </div>
                <div style={s.statCard}>
                    <div style={s.statIcon('green')}><CheckCircle size={22} /></div>
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Active</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{stats.active}</div>
                    </div>
                </div>
                <div style={s.statCard}>
                    <div style={s.statIcon('orange')}><Layers size={22} /></div>
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Main Categories</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{stats.parent}</div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div style={s.mainCard}>
                <div style={s.toolbar}>
                    <div style={s.searchBox}>
                        <Search size={18} color="#94A3B8" />
                        <input
                            style={s.searchInput}
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table style={s.table}>
                    <thead>
                        <tr>
                            <th style={s.th}>Category Name</th>
                            <th style={s.th}>Parent Category</th>
                            <th style={s.th}>Product Count</th>
                            <th style={s.th}>Status</th>
                            {/* CĂN PHẢI HEADER ACTIONS */}
                            <th style={{...s.th, textAlign: 'right', paddingRight: '32px'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading data...</td></tr>
                        ) : filteredCategories.map((category) => (
                            <tr key={category.id} style={{ background: 'white' }}>
                                <td style={s.td}>
                                    <div style={s.nameCell}>
                                        {category.parent_id && <CornerDownRight size={16} style={s.subIcon} />}
                                        <div>
                                            <span style={s.nameText}>{category.name}</span>
                                            {category.description && <span style={s.descText}>{category.description}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td style={s.td}>
                                    {category.parent_name ? (
                                        <span style={s.badge('sub')}>{category.parent_name}</span>
                                    ) : <span style={s.badge('root')}>Root</span>}
                                </td>
                                <td style={s.td}>
                                    <span style={s.countBadge}>{category.product_count || 0} Products</span>
                                </td>
                                <td style={s.td}>
                                    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            style={{ opacity: 0, width: 0, height: 0 }}
                                            checked={category.status === 'active'} 
                                            onChange={() => handleToggleStatus(category.id, category.status)}
                                        />
                                        <div style={{ width: '36px', height: '20px', background: category.status === 'active' ? '#10B981' : '#E2E8F0', borderRadius: '20px', position: 'relative', transition: 'background 0.2s' }}>
                                            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: category.status === 'active' ? '18px' : '2px', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}></div>
                                        </div>
                                        <span style={{ marginLeft: '8px', fontSize: '13px', fontWeight: '600', color: category.status === 'active' ? '#059669' : '#64748B' }}>
                                            {category.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </label>
                                </td>
                                {/* CĂN PHẢI NỘI DUNG ACTIONS */}
                                <td style={{...s.td, textAlign: 'right', paddingRight: '24px'}}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button style={s.btnAction('gray')} title="Edit" onClick={() => handleEditClick(category)}>
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            style={s.btnAction('red')} 
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
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={s.modalOverlay}>
                    <div style={s.modalBox}>
                        <div style={s.modalHeader}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                                {editingCategory ? 'Update Category' : 'Add New Category'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={s.modalBody}>
                            <div style={s.inputGroup}>
                                <label style={s.label}>Category Name</label>
                                <input
                                    style={s.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Men's Jackets"
                                />
                            </div>
                            <div style={s.inputGroup}>
                                <label style={s.label}>Parent Category</label>
                                <select
                                    style={s.input}
                                    value={formData.parent_id}
                                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                >
                                    <option value="">None (Root Category)</option>
                                    {categories.filter(c => !editingCategory || c.id !== editingCategory.id).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: 0 }}>
                                <label style={s.label}>Description</label>
                                <textarea
                                    style={{ ...s.input, minHeight: '80px', resize: 'vertical' }}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter details..."
                                />
                            </div>
                        </div>
                        <div style={s.modalFooter}>
                            <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600', color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSave} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#E11D48', fontWeight: '600', color: 'white', cursor: 'pointer' }}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.open && (
                <div style={s.modalOverlay}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '400px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#EF4444' }}>
                            <AlertCircle size={32} />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0F172A' }}>Are you sure?</h3>
                        <p style={{ color: '#64748B', marginBottom: '24px' }}>This category will be permanently deleted.</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button onClick={() => setDeleteModal({ open: false, id: null })} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600', color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={async () => {
                                try {
                                    await api.post('/admin/categories.php', { action: 'delete', id: deleteModal.id });
                                    success(t('common.deleteSuccess'));
                                    fetchCategories();
                                    setDeleteModal({ open: false, id: null });
                                } catch (err) { showError('Delete failed'); }
                            }} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#EF4444', fontWeight: '600', color: 'white', cursor: 'pointer' }}>Delete Now</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;