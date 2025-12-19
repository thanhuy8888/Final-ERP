import { useState, useEffect } from 'react';
import { Shield, Users, Check, X, XCircle, Lock } from 'lucide-react';
import axios from 'axios';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, title: '', content: '' });

    useEffect(() => { fetchRoles(); }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8081/Final-ERP/api/admin/get_roles.php');
            setRoles(res.data.roles || []);
        } catch (error) { console.error('Error fetching roles:', error); } 
        finally { setLoading(false); }
    };

    const showModal = (title, content) => { setModal({ show: true, title, content }); };

    const permissions = [
        { key: 'dashboard', label: 'View Dashboard' }, { key: 'orders', label: 'Manage Orders' },
        { key: 'products', label: 'Manage Products' }, { key: 'inventory', label: 'Manage Inventory' },
        { key: 'customers', label: 'Manage Customers' }, { key: 'promotions', label: 'Manage Promotions' },
        { key: 'reports', label: 'View Reports' }, { key: 'users', label: 'Manage Users' },
        { key: 'settings', label: 'System Settings' }
    ];

    const rolePermissions = {
        'admin': ['dashboard', 'orders', 'products', 'inventory', 'customers', 'promotions', 'reports', 'users', 'settings'],
        'manager': ['dashboard', 'orders', 'products', 'inventory', 'customers', 'promotions', 'reports'],
        'sales': ['dashboard', 'orders', 'customers'],
        'warehouse': ['dashboard', 'inventory', 'products']
    };

    // --- Styles ---
    const styles = {
        container: { padding: '32px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#0f172a' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' },
        title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
        subtitle: { color: '#64748b', fontSize: '15px', margin: 0 },
        btnPrimary: { background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', transition: 'all 0.2s' },
        kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' },
        kpiCard: (index) => {
            const colors = [
                { bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', shadow: 'rgba(99, 102, 241, 0.3)' },
                { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', shadow: 'rgba(16, 185, 129, 0.3)' },
                { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: 'rgba(245, 158, 11, 0.3)' },
                { bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', shadow: 'rgba(236, 72, 153, 0.3)' }
            ];
            const c = colors[index % 4];
            return { background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' };
        },
        kpiIconBox: (index) => {
             const colors = ['#eff6ff', '#ecfdf5', '#fffbeb', '#fdf2f8'];
             const textColors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
             return { width: '48px', height: '48px', borderRadius: '12px', background: colors[index % 4], color: textColors[index % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' };
        },
        card: { background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' },
        table: { width: '100%', borderCollapse: 'collapse' },
        th: { background: '#f8fafc', padding: '16px 24px', textAlign: 'center', fontSize: '12px', textTransform: 'uppercase', fontWeight: '700', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
        thFirst: { textAlign: 'left', paddingLeft: '24px' },
        td: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', verticalAlign: 'middle', color: '#334155', textAlign: 'center' },
        tdFirst: { textAlign: 'left', fontWeight: '600', color: '#0f172a' },
        checkIcon: (active) => ({ width: '28px', height: '28px', borderRadius: '50%', background: active ? '#dcfce7' : '#fee2e2', color: active ? '#16a34a' : '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }),
        modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: 'white', borderRadius: '20px', padding: '32px', width: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
    };

    return (
        <div style={styles.container}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Roles & Permissions</h1>
                    <p style={styles.subtitle}>Manage user roles and access control.</p>
                </div>
                <button style={styles.btnPrimary} onClick={() => showModal('Add New Role', 'Feature to create a new role coming soon.')}>
                    <Shield size={18} /> Add New Role
                </button>
            </div>

            <div style={styles.kpiGrid}>
                {roles.map((role, index) => (
                    <div key={index} style={styles.kpiCard(index)}>
                        <div style={styles.kpiIconBox(index)}><Shield size={24} /></div>
                        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>{role.user_count}</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px', textTransform: 'capitalize' }}>{role.role} Users</p>
                        <button 
                            onClick={() => showModal(`Edit ${role.role}`, `Edit details for ${role.role}`)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        >
                            <Lock size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <div style={styles.card}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Shield size={20} color="#8b5cf6" /> Permission Matrix
                    </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={{...styles.th, ...styles.thFirst}}>Permission</th>
                                {roles.map((role, index) => (
                                    <th key={index} style={styles.th}>{role.role}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((permission, pIndex) => (
                                <tr key={pIndex} onMouseEnter={(e) => e.currentTarget.style.background = '#fcfdfe'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{...styles.td, ...styles.tdFirst}}>{permission.label}</td>
                                    {roles.map((role, rIndex) => {
                                        const hasPermission = rolePermissions[role.role]?.includes(permission.key);
                                        return (
                                            <td key={rIndex} style={styles.td}>
                                                <div 
                                                    style={styles.checkIcon(hasPermission)}
                                                    onClick={() => showModal(hasPermission ? 'Revoke Access' : 'Grant Access', `Modify ${permission.label} for ${role.role}?`)}
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    {hasPermission ? <Check size={16} /> : <X size={16} />}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal.show && (
                <div style={styles.modalOverlay} onClick={() => setModal({ show: false, title: '', content: '' })}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <div style={{ width: '60px', height: '60px', background: '#f3e8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                                <Shield size={30} />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0', textAlign: 'center' }}>{modal.title}</h2>
                        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.6', textAlign: 'center', marginBottom: '24px', whiteSpace: 'pre-line' }}>{modal.content}</p>
                        <button onClick={() => setModal({ show: false, title: '', content: '' })} style={{ width: '100%', padding: '12px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Got it</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Roles;