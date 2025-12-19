import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { Trash, Edit, Plus, User, Mail, Phone, Shield, Check, X, Lock, Unlock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminUsers = () => {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', full_name: '', phone: '', role: 'customer', is_active: true
    });
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users.php');
            setUsers(response.data);
        } catch (error) { console.error("Failed to fetch users", error); } 
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = editingUser ? { ...formData, id: editingUser.id } : formData;
            const response = await api.post('/admin/users.php', payload);
            if (response.data.success) {
                success(response.data.message);
                setShowForm(false);
                setEditingUser(null);
                resetForm();
                fetchUsers();
            }
        } catch (error) { showError(error.response?.data?.error || 'Error saving user'); }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username, email: user.email, password: '',
            full_name: user.full_name || '', phone: user.phone || '',
            role: user.role, is_active: user.is_active
        });
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await api.delete('/admin/users.php', { data: { id: deleteModal.id } });
            fetchUsers();
            setDeleteModal({ open: false, id: null });
            success(t('common.deleteSuccess'));
        } catch (error) { showError(error.response?.data?.error || 'Delete failed'); } 
        finally { setIsDeleting(false); }
    };

    const resetForm = () => {
        setFormData({ username: '', email: '', password: '', full_name: '', phone: '', role: 'customer', is_active: true });
    };

    // --- Styles ---
    const styles = {
        container: { padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#0f172a' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
        title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
        subtitle: { color: '#64748b', fontSize: '15px', margin: 0 },
        btnPrimary: { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s' },
        card: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '24px' },
        formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '24px' },
        inputGroup: { marginBottom: '0' },
        label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '6px' },
        input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
        td: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', verticalAlign: 'middle', color: '#334155' },
        badge: (role) => {
            const colors = { admin: { bg: '#fee2e2', text: '#991b1b' }, sales: { bg: '#e0e7ff', text: '#3730a3' }, customer: { bg: '#dcfce7', text: '#166534' } };
            const c = colors[role] || colors.customer;
            return { background: c.bg, color: c.text, padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', display: 'inline-block' };
        },
        status: (active) => ({ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: active ? '#16a34a' : '#dc2626' }),
        btnIcon: { width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
        modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', borderRadius: '20px', padding: '32px', width: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
    };

    return (
        <div style={styles.container}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>
            
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>{t('admin.userList')}</h1>
                    <p style={styles.subtitle}>Manage system access and user accounts.</p>
                </div>
                <button style={styles.btnPrimary} onClick={() => { setShowForm(true); setEditingUser(null); resetForm(); }}>
                    <Plus size={18} /> {t('admin.addUser')}
                </button>
            </div>

            {showForm && (
                <div style={styles.card}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{editingUser ? t('common.edit') : t('admin.addUser')}</h3>
                        <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} color="#64748b" /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            <div style={styles.inputGroup}><label style={styles.label}>{t('login.username')} *</label><input type="text" style={styles.input} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>Email *</label><input type="email" style={styles.input} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>{t('login.password')} {editingUser ? '(Leave blank to keep)' : '*'}</label><input type="password" style={styles.input} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingUser} /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>{t('checkout.fullName')}</label><input type="text" style={styles.input} value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} /></div>
                            <div style={styles.inputGroup}><label style={styles.label}>{t('checkout.phone')}</label><input type="text" style={styles.input} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>{t('admin.role')} *</label>
                                <select style={styles.input} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="customer">{t('admin.roleUser')}</option>
                                    <option value="sales">Sales</option>
                                    <option value="admin">{t('admin.roleAdmin')}</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ padding: '20px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>{t('common.cancel')}</button>
                            <button type="submit" style={{ ...styles.btnPrimary, padding: '10px 24px', boxShadow: 'none' }}>{editingUser ? t('common.save') : t('common.add')}</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={styles.card}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>User Info</th>
                            <th style={styles.th}>Contact</th>
                            <th style={styles.th}>{t('admin.role')}</th>
                            <th style={styles.th}>{t('admin.status')}</th>
                            <th style={{...styles.th, textAlign: 'right'}}>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} onMouseEnter={(e) => e.currentTarget.style.background = '#fcfdfe'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><User size={18} /></div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.username}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>ID: #{user.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} color="#94a3b8"/> {user.email}</div>
                                        {user.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} color="#94a3b8"/> {user.phone}</div>}
                                    </div>
                                </td>
                                <td style={styles.td}><span style={styles.badge(user.role)}>{user.role}</span></td>
                                <td style={styles.td}>
                                    <div style={styles.status(user.is_active)}>
                                        {user.is_active ? <Check size={14} /> : <X size={14} />}
                                        {user.is_active ? 'Active' : 'Locked'}
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button style={{...styles.btnIcon, background: '#f1f5f9', color: '#475569'}} onClick={() => handleEdit(user)}><Edit size={16} /></button>
                                        <button style={{...styles.btnIcon, background: '#fef2f2', color: '#ef4444'}} onClick={() => setDeleteModal({ open: true, id: user.id })}><Trash size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {deleteModal.open && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{ width: '64px', height: '64px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#dc2626' }}>
                            <Trash size={32} />
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a' }}>{t('common.delete')}?</h3>
                        <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>{t('common.deleteConfirm')}</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                            <button style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, color: '#64748b', cursor: 'pointer' }} onClick={() => setDeleteModal({ open: false, id: null })}>{t('common.cancel')}</button>
                            <button style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#dc2626', fontWeight: 600, color: 'white', cursor: 'pointer' }} onClick={confirmDelete} disabled={isDeleting}>{isDeleting ? '...' : t('common.delete')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;