import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';

const AdminUsers = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'customer',
        is_active: true
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users.php');
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = editingUser ? { ...formData, id: editingUser.id } : formData;
            const response = await api.post('/admin/users.php', payload);
            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message });
                setShowForm(false);
                setEditingUser(null);
                resetForm();
                fetchUsers();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error' });
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            full_name: user.full_name || '',
            phone: user.phone || '',
            role: user.role,
            is_active: user.is_active
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm(t('common.delete') + '?')) return;
        try {
            await api.delete('/admin/users.php', { data: { id } });
            fetchUsers();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Delete failed' });
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            full_name: '',
            phone: '',
            role: 'customer',
            is_active: true
        });
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: '#e74c3c',
            sales: '#3498db',
            customer: '#2ecc71'
        };
        const labels = {
            admin: t('admin.roleAdmin'),
            sales: 'Sales',
            customer: t('admin.roleUser')
        };
        return (
            <span style={{
                background: colors[role] || '#95a5a6',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '12px'
            }}>
                {labels[role] || role.toUpperCase()}
            </span>
        );
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>{t('admin.userList')}</h1>
                <button className="btn-primary" onClick={() => {
                    setShowForm(true);
                    setEditingUser(null);
                    resetForm();
                }}>+ {t('admin.addUser')}</button>
            </div>

            {message.text && (
                <div style={{
                    padding: '10px 15px',
                    marginBottom: '15px',
                    borderRadius: '5px',
                    background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24'
                }}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <h3>{editingUser ? t('common.edit') : t('admin.addUser')}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label>{t('login.username')} *</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>{t('login.password')} *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>{t('checkout.fullName')}</label>
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>{t('checkout.phone')}</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>{t('admin.role')} *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="customer">{t('admin.roleUser')}</option>
                                    <option value="sales">Sales</option>
                                    <option value="admin">{t('admin.roleAdmin')}</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary">
                                {editingUser ? t('common.save') : t('common.add')}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} style={{
                                padding: '10px 20px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                background: 'white',
                                cursor: 'pointer'
                            }}>{t('common.cancel')}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('login.username')}</th>
                            <th>Email</th>
                            <th>{t('checkout.fullName')}</th>
                            <th>{t('admin.role')}</th>
                            <th>{t('admin.status')}</th>
                            <th>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.full_name || '-'}</td>
                                <td>{getRoleBadge(user.role)}</td>
                                <td>
                                    <span style={{
                                        color: user.is_active ? '#2ecc71' : '#e74c3c'
                                    }}>
                                        {user.is_active ? '✓ Active' : '✗ Locked'}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => handleEdit(user)} className="btn-edit">✏️</button>
                                    <button onClick={() => handleDelete(user.id)} className="btn-danger">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
