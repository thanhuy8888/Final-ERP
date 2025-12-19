import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, Calendar, MapPin, ChevronDown } from 'lucide-react';

const CustomerModal = ({ isOpen, onClose, customer, onSuccess }) => {
    // 1. Logic xử lý dữ liệu
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        gender: 'Male',
        email: '',
        dob: '',
        address: ''
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                full_name: customer.full_name || '',
                phone: customer.phone || '',
                gender: customer.gender || 'Male',
                email: customer.email || '',
                dob: customer.dob || '',
                address: customer.address || ''
            });
        } else {
            setFormData({ full_name: '', phone: '', gender: 'Male', email: '', dob: '', address: '' });
        }
    }, [customer, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Giả lập save
        console.log("Saving data:", formData);
        // await api.post(...)
        onSuccess();
        onClose();
    };

    // 2. Styles Object "Hạng nặng" (Dùng !important để ghi đè CSS cũ)
    const s = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)', // Màu nền tối sang trọng
            backdropFilter: 'blur(8px)', // Làm mờ hậu cảnh
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999, // Luôn nổi lên trên cùng
            animation: 'fadeIn 0.2s ease-out'
        },
        modalCard: {
            backgroundColor: '#ffffff',
            width: '600px', maxWidth: '95vw',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex', flexDirection: 'column',
            textAlign: 'left', // Quan trọng: Reset căn trái
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            overflow: 'hidden',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        },
        header: {
            padding: '24px 32px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#ffffff'
        },
        titleBox: { textAlign: 'left' },
        title: { fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: '1.2' },
        subtitle: { fontSize: '14px', color: '#64748B', marginTop: '4px', fontWeight: '500' },
        
        closeBtn: {
            background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748B', transition: 'all 0.2s'
        },

        body: {
            padding: '32px',
            maxHeight: '70vh', overflowY: 'auto',
            background: '#ffffff'
        },

        // Grid Layout: Chia cột cứng cáp
        gridRow: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', // Chia 2 cột đều nhau
            gap: '20px',
            marginBottom: '20px'
        },
        fullRow: { marginBottom: '20px' },

        // Label
        label: {
            display: 'block',
            fontSize: '13px', fontWeight: '700', color: '#334155',
            marginBottom: '8px',
            textTransform: 'uppercase', letterSpacing: '0.025em',
            textAlign: 'left' // Ép căn trái
        },
        required: { color: '#E11D48', marginLeft: '3px' },

        // Input Wrapper
        inputGroup: { position: 'relative', width: '100%' },
        
        // Icon
        icon: {
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
            color: '#94A3B8', pointerEvents: 'none', zIndex: 2
        },

        // Input Styling
        input: {
            width: '100%',
            padding: '12px 16px 12px 48px', // Padding trái lớn để chứa icon
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            fontSize: '15px', fontWeight: '500', color: '#0F172A',
            outline: 'none',
            backgroundColor: '#ffffff',
            transition: 'border 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box', // Chống vỡ layout
            height: '48px',
            textAlign: 'left'
        },

        // Select (Custom appearance)
        select: {
            width: '100%',
            padding: '12px 40px 12px 16px', // Padding phải để chứa mũi tên custom
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            fontSize: '15px', fontWeight: '500', color: '#0F172A',
            outline: 'none',
            backgroundColor: '#ffffff',
            appearance: 'none', // Ẩn style mặc định
            height: '48px',
            cursor: 'pointer',
            textAlign: 'left'
        },

        // Textarea
        textarea: {
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            fontSize: '15px', fontWeight: '500', color: '#0F172A',
            outline: 'none',
            minHeight: '100px', resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            textAlign: 'left'
        },

        // Footer
        footer: {
            padding: '24px 32px',
            background: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'flex-end', gap: '12px',
            borderRadius: '0 0 20px 20px'
        },
        
        btnCancel: {
            padding: '12px 24px', borderRadius: '12px',
            border: '1px solid #E2E8F0', background: 'white',
            fontWeight: '600', color: '#475569', cursor: 'pointer',
            fontSize: '14px', transition: 'all 0.2s'
        },
        btnSave: {
            padding: '12px 24px', borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)', // Gradient đỏ
            color: 'white', fontWeight: '600', cursor: 'pointer',
            fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)'
        }
    };

    return (
        <div style={s.overlay}>
            {/* Inject CSS để xử lý các trạng thái focus và animation */}
            <style>{`
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                /* Hiệu ứng Focus Input: Đổi màu viền và thêm shadow đỏ nhạt */
                .mod-input:focus, .mod-select:focus, .mod-textarea:focus {
                    border-color: #E11D48 !important;
                    box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.1) !important;
                }
                
                /* Hiệu ứng Hover Button Close */
                .mod-close:hover { background: #F1F5F9; color: #0F172A; }
                
                /* Hiệu ứng Hover Button Cancel */
                .mod-cancel:hover { background: #F8FAFC; border-color: #CBD5E1; }
                
                /* Hiệu ứng Button Save */
                .mod-save:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(225, 29, 72, 0.35); }
                .mod-save:active { transform: translateY(0); }

                /* Reset CSS Global mạnh tay */
                .customer-modal-reset * { text-align: left !important; box-sizing: border-box !important; }
            `}</style>

            <div style={s.modalCard} className="customer-modal-reset">
                {/* Header */}
                <div style={s.header}>
                    <div style={s.titleBox}>
                        <h2 style={s.title}>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
                        <div style={s.subtitle}>{customer ? 'Update customer details below.' : 'Create a new customer profile.'}</div>
                    </div>
                    <button style={s.closeBtn} className="mod-close" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ margin: 0, width: '100%' }}>
                    <div style={s.body}>
                        {/* Hàng 1: Full Name */}
                        <div style={s.fullRow}>
                            <label style={s.label}>Full Name <span style={s.required}>*</span></label>
                            <div style={s.inputGroup}>
                                <User size={18} style={s.icon} />
                                <input 
                                    style={s.input} 
                                    className="mod-input"
                                    value={formData.full_name} 
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="e.g. Nguyen Van A"
                                    required
                                />
                            </div>
                        </div>

                        {/* Hàng 2: Phone & Gender (Chia cột bằng Grid) */}
                        <div style={s.gridRow}>
                            <div>
                                <label style={s.label}>Phone Number <span style={s.required}>*</span></label>
                                <div style={s.inputGroup}>
                                    <Phone size={18} style={s.icon} />
                                    <input 
                                        style={s.input} 
                                        className="mod-input"
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        placeholder="0912..."
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={s.label}>Gender</label>
                                <div style={s.inputGroup}>
                                    <select 
                                        style={s.select}
                                        className="mod-select"
                                        value={formData.gender}
                                        onChange={e => setFormData({...formData, gender: e.target.value})}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {/* Icon mũi tên custom */}
                                    <ChevronDown size={16} style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none'}} />
                                </div>
                            </div>
                        </div>

                        {/* Hàng 3: Email & DOB */}
                        <div style={s.gridRow}>
                            <div>
                                <label style={s.label}>Email Address</label>
                                <div style={s.inputGroup}>
                                    <Mail size={18} style={s.icon} />
                                    <input 
                                        type="email"
                                        style={s.input} 
                                        className="mod-input"
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        placeholder="user@example.com"
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
                                        className="mod-input"
                                        value={formData.dob} 
                                        onChange={e => setFormData({...formData, dob: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hàng 4: Address */}
                        <div style={{marginBottom: 0}}>
                            <label style={s.label}>Address</label>
                            <div style={s.inputGroup}>
                                <textarea 
                                    style={s.textarea}
                                    className="mod-textarea"
                                    value={formData.address} 
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                    placeholder="Enter full address here..."
                                />
                                <MapPin size={16} style={{position: 'absolute', right: '16px', bottom: '16px', color: '#94A3B8'}} />
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div style={s.footer}>
                        <button type="button" style={s.btnCancel} className="mod-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" style={s.btnSave} className="mod-save">
                            <Save size={18} /> Save Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerMo