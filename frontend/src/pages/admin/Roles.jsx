import { useState, useEffect } from 'react';
import { Shield, Users, Check, X, XCircle } from 'lucide-react';
import axios from 'axios';
import './Orders.css';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, title: '', content: '' });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8081/Final-ERP/api/admin/get_roles.php');
            setRoles(res.data.roles || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const showModal = (title, content) => {
        setModal({ show: true, title, content });
    };

    // Define permissions matrix
    const permissions = [
        { key: 'dashboard', label: 'View Dashboard' },
        { key: 'orders', label: 'Manage Orders' },
        { key: 'products', label: 'Manage Products' },
        { key: 'inventory', label: 'Manage Inventory' },
        { key: 'customers', label: 'Manage Customers' },
        { key: 'promotions', label: 'Manage Promotions' },
        { key: 'reports', label: 'View Reports' },
        { key: 'users', label: 'Manage Users' },
        { key: 'settings', label: 'System Settings' }
    ];

    // Role permissions mapping (hardcoded for now)
    const rolePermissions = {
        'admin': ['dashboard', 'orders', 'products', 'inventory', 'customers', 'promotions', 'reports', 'users', 'settings'],
        'manager': ['dashboard', 'orders', 'products', 'inventory', 'customers', 'promotions', 'reports'],
        'sales': ['dashboard', 'orders', 'customers'],
        'warehouse': ['dashboard', 'inventory', 'products']
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="admin-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                        Roles & Permissions
                    </h1>
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Manage user roles and access control.
                    </p>
                </div>
                <button
                    className="btn-modern primary"
                    onClick={() => showModal('Add New Role', 'This feature would open a form to create a new role with:\n• Custom role name\n• Permission selection\n• User assignment')}
                    style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Shield size={18} /> Add New Role
                </button>
            </div>

            {/* Role Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {roles.map((role, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
                    const bgColors = ['#eff6ff', '#ecfdf5', '#fef3c7', '#f5f3ff'];
                    return (
                        <div key={index} className="kpi-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                            <button
                                onClick={() => showModal(`Edit "${role.role}" Role`, `Manage the "${role.role}" role:\n• Rename the role\n• Modify permissions\n• View ${role.user_count} assigned user${role.user_count !== 1 ? 's' : ''}`)}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '6px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <Shield size={16} color="#64748b" />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ background: bgColors[index % 4], padding: '10px', borderRadius: '8px' }}>
                                    <Shield size={20} color={colors[index % 4]} />
                                </div>
                                <span style={{ color: '#64748b', fontSize: '0.875rem', textTransform: 'capitalize' }}>{role.role}</span>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>
                                {role.user_count}
                            </h3>
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>users</p>
                        </div>
                    );
                })}
            </div>

            {/* Permissions Matrix */}
            <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={20} color="#3b82f6" />
                    Permission Matrix
                </h3>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '12px', color: '#64748b', fontWeight: '600' }}>Permission</th>
                                {roles.map((role, index) => (
                                    <th key={index} style={{ padding: '12px', color: '#64748b', fontWeight: '600', textAlign: 'center', textTransform: 'capitalize' }}>
                                        {role.role}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.map((permission, pIndex) => (
                                <tr key={pIndex} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', fontWeight: '500', color: '#0f172a' }}>
                                        {permission.label}
                                    </td>
                                    {roles.map((role, rIndex) => {
                                        const hasPermission = rolePermissions[role.role]?.includes(permission.key);
                                        return (
                                            <td key={rIndex} style={{ padding: '16px', textAlign: 'center' }}>
                                                <div
                                                    onClick={() => {
                                                        const action = hasPermission ? 'Revoke' : 'Grant';
                                                        showModal(`${action} Permission`, `Role: ${role.role}\nPermission: ${permission.label}\n\nThis would ${action.toLowerCase()} the "${permission.label}" permission ${hasPermission ? 'from' : 'to'} the "${role.role}" role.`);
                                                    }}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: hasPermission ? '#dcfce7' : '#fee2e2',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    {hasPermission ? (
                                                        <Check size={18} color="#16a34a" />
                                                    ) : (
                                                        <X size={18} color="#dc2626" />
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                        <strong>Note:</strong> Permission changes require system administrator access. Contact your IT department to modify role permissions.
                    </p>
                </div>
            </div>

            {/* Modal */}
            {modal.show && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setModal({ show: false, title: '', content: '' })}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            maxWidth: '500px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                            position: 'relative',
                            animation: 'slideIn 0.3s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setModal({ show: false, title: '', content: '' })}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <XCircle size={24} color="#64748b" />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px' }}>
                                <Shield size={24} color="#3b82f6" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                                {modal.title}
                            </h2>
                        </div>

                        <div style={{
                            fontSize: '0.95rem',
                            color: '#475569',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-line',
                            marginBottom: '24px'
                        }}>
                            {modal.content}
                        </div>

                        <button
                            onClick={() => setModal({ show: false, title: '', content: '' })}
                            className="btn-modern primary"
                            style={{
                                width: '100%',
                                background: '#3b82f6',
                                padding: '12px',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Roles;
