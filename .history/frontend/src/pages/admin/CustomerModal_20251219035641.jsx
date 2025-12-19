import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, MapPin, Calendar, ChevronDown } from 'lucide-react';
import api from '../../api/axios'; // Đảm bảo đường dẫn đúng

const CustomerModal = ({ isOpen, onClose, customer, onSuccess }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        gender: 'Other',
        email: '',
        dob: '',
        address: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (customer) {
            // Fill dữ liệu nếu đang Edit
            setFormData({
                full_name: customer.full_name || '',
                phone: customer.phone || '',
                gender: customer.gender || 'Other',
                email: customer.email || '',
                dob: customer.dob || '', // Format YYYY-MM-DD
                address: customer.address || ''
            });
        } else {
            // Reset form nếu tạo mới
            setFormData({ full_name: '', phone: '', gender: 'Other', email: '', dob: '', address: '' });
        }
    }, [customer, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Logic gọi API (Create hoặc Update)
            // const url = customer ? `/admin/customers.php?id=${customer.id}` : '/admin/customers.php';
            // const method = customer ? 'put' : 'post';
            // await api[method](url, formData);
            
            console.log("Saving...", formData);
            
            // Giả lập delay để test UI loading
            await new Promise(r => setTimeout(r, 500));
            
            onSuccess(); // Refresh list
            onClose();   // Close modal
        } catch (error) {
            console.error(error);
            alert("Failed to save customer");
        } finally {
            setLoading(false);
        }
    };

    // --- STYLES OBJECT ---
    const s = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)', // Màu nền tối hơn chút cho sâu
            backdropFilter: 'blur(8px)', // Blur mạnh hơn cho đẹp
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, animation: 'fadeIn 0.2s ease-out'
        },
        modal: {
            background: '#ffffff', width: '600px', maxWidth: '95%',
            borderRadius: '20px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex', flexDirection: 'column',
            animation: 'zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        },
        header: {
            padding: '24px 32px', borderBottom: '1px solid #E2E8F0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        },
        title: { fontSize: '22px', fontWeight: '800', color: '#1E293B', margin: 0, letterSpacing: '-0.5px' },
        closeBtn: {
            background: '#F1F5F9', border: 'none', borderRadius: '12px', 
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            cursor: 'pointer', color: '#64748B', transition: 'all 0.2s'
        },
        body: { padding: '32px', overflowY: 'auto', maxHeight: '75vh' },
        
        // Grid System
        row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
        fullRow: { marginBottom: '24px' },
        
        label: { 
            display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', 
            marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' 
        },
        required: { color: '#E11D48', marginLeft: '4px' },
        
        inputGroup: { position: 'relative' },
        icon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' },
        
        input: {
            width: '100%', padding: '12px 16px 12px 44px', // padding left né icon
            borderRadius: '10px', border: '1px solid #CBD5E1',
            fontSize: '15px', color: '#1E293B', fontWeight: '500', outline: 'none',
            transition: 'all 0.2s ease', backgroundColor: '#fff',
            boxSizing: 'border-box', height: '46px'
        },
        textarea: {
            width: '100%', padding: '12px 16px', borderRadius: '10px', 
            border: '1px solid #CBD5E1', fontSize: '15px', color: '#1E293B', 
            fontWeight: '500', outline: 'none', minHeight: '80px', resize: 'vertical',
            fontFamily: 'inherit', boxSizing: 'border-box'
        },
        select: {
            width: '100%', padding: '12px 16px 12px 16px', 
            borderRadius: '10px', border: '1px solid #CBD5E1',
            fontSize: '15px', color: '#1E293B', fontWeight: '500', outline: 'none',
            backgroundColor: '#fff', appearance: 'none', height: '46px', cursor: 'pointer'
        },
        
        footer: {
            padding: '24px 32px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0',
            display: 'flex', justifyContent: 'flex-end', gap: '12px',
            borderRadius: '0 0 20px 20px'
        },
        btnCancel: {
            padding: '12px 24px', borderRadius: '10px', border: '1px solid #CBD5E1', 
            background: 'white', fontWeight: '600', color: '#475569', cursor: 'pointer',
            fontSize: '14px', transition: 'all 0.2s'
        },
        btnSave: {
            padding: '12px 24px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)', // Gradient đỏ
            color: 'white', fontWeight: '600', cursor: 'pointer',
            fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.3)', transition: 'transform 0.1s'
        }
    };

    return (
        <div style={s.overlay}>
            <style>{`
                @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                input:focus, select:focus, textarea:focus { 
                    border-color: #E11D48 !important; 
                    box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1) !important; 
                }
                /* Hover effects */
                button:active { transform: scale(0.98); }
            `}</style>
            
            <div style={s.modal}>
                {/* Header */}
                <div style={s.header}>
                    <div>
                        <h2 style={s.title}>{customer ? 'Edit Customer' : 'New Customer'}</h2>
                        <div style={{fontSize: '14px', color: '#64748B', marginTop: '4px'}}>
                            {customer ? 'Update customer details below.' : 'Add a new customer to your list.'}
                        </div>
                    </div>
                    <button style={s.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={s.body}>
                        {/* Full Name */}
                        <div style={s.fullRow}>
                            <label style={s.label}>Full Name <span style={s.required}>*</span></label>
                            <div style={s.inputGroup}>
                                <User size={18} style={s.icon} />
                                <input 
                                    style={s.input} 
                                    name="full_name"
                                    value={formData.full_name} 
                                    onChange={handleChange}
                                    placeholder="e.g. Nguyen Van A"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone & Gender Row */}
                        <div style={s.row}>
                            <div>
                                <label style={s.label}>Phone <span style={s.required}>*</span></label>
                                <div style={s.inputGroup}>
                                    <Phone size={18} style={s.icon} />
                                    <input 
                                        style={s.input} 
                                        name="phone"
                                        value={formData.phone} 
                                        onChange={handleChange}
                                        placeholder="e.g. 0912345678"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={s.label}>Gender</label>
                                <div style={s.inputGroup}>
                                    {/* Custom chevron icon for select */}
                                    <ChevronDown size={16} style={{...s.icon, left: 'auto', right: '14px', color: '#64748B'}} />
                                    <select 
                                        style={s.select}
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Email & DOB Row */}
                        <div style={s.row}>
                            <div>
                                <label style={s.label}>Email</label>
                                <div style={s.inputGroup}>
                                    <Mail size={18} style={s.icon} />
                                    <input 
                                        type="email"
                                        style={s.input} 
                                        name="email"
                                        value={formData.email} 
                                        onChange={handleChange}
                                        placeholder="example@gmail.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={s.label}>Date of Birth</label>
                                <div style={s.inputGroup}>
                                    <Calendar size={18} style={s.icon} />
                                    <input 
                                        type="date"
                                        style={s.input} 
                                        name="dob"
                                        value={formData.dob} 
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div style={{marginBottom: 0}}>
                            <label style={s.label}>Address</label>
                            <div style={s.inputGroup}>
                                <textarea 
                                    style={s.textarea}
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter full address here..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={s.footer}>
                        <button type="button" style={s.btnCancel} onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" style={s.btnSave} disabled={loading}>
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={18} /> Save Customer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;