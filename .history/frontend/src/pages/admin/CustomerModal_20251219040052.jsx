import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, Calendar, MapPin, ChevronDown } from 'lucide-react';

const CustomerModal = ({ isOpen, onClose, customer, onSuccess }) => {
    // 1. Hook kiểm soát đóng mở và dữ liệu
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
        // Gọi API save tại đây
        console.log("Saving data:", formData);
        onSuccess();
        onClose();
    };

    // 2. Styles Object - Sử dụng "!important" để ghi đè style global
    const s = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)', 
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999
        },
        modal: {
            backgroundColor: '#ffffff',
            width: '640px', maxWidth: '95%',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex', flexDirection: 'column',
            textAlign: 'left', // Cố gắng reset alignment
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            overflow: 'hidden'
        },
        header: {
            padding: '24px 32px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#ffffff'
        },
        title: {
            fontSize: '20px', fontWeight: '800', color: '#1E293B', margin: 0,
            textAlign: 'left' 
        },
        closeBtn: {
            background: '#F1F5F9', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748B', transition: 'background 0.2s'
        },
        body: {
            padding: '32px',
            maxHeight: '70vh', overflowY: 'auto',
            background: '#ffffff'
        },
        
        // Grid Layout mạnh mẽ hơn
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', // Chia đôi cột đều nhau
            gap: '24px',
            marginBottom: '24px'
        },
        fullWidth: {
            marginBottom: '24px',
            gridColumn: '1 / -1' // Chiếm hết bề ngang
        },

        // Label style (Quan trọng: ép căn trái)
        label: {
            display: 'block',
            fontSize: '13px', fontWeight: '700', color: '#475569',
            marginBottom: '8px',
            textTransform: 'uppercase', letterSpacing: '0.02em',
            textAlign: 'left !important' // ÉP CĂN TRÁI
        },
        
        // Input Container
        inputWrapper: {
            position: 'relative',
            display: 'flex', alignItems: 'center', width: '100%'
        },
        
        // Icon bên trong input
        icon: {
            position: 'absolute', left: '14px', zIndex: 1,
            color: '#94A3B8', pointerEvents: 'none'
        },

        // Style Input chung
        input: {
            width: '100%', 
            padding: '12px 16px 12px 44px', // Padding trái né icon
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '15px', fontWeight: '500', color: '#0F172A',
            outline: 'none',
            backgroundColor: '#fff',
            transition: 'all 0.2s',
            boxSizing: 'border-box', // Chống vỡ layout
            height: '48px', // Chiều cao cố định đẹp hơn
            textAlign: 'left' // Ép chữ căn trái
        },

        // Style riêng cho Select để ẩn mũi tên mặc định xấu xí
        select: {
            width: '100%',
            padding: '12px 40px 12px 16px', // Padding phải né icon mũi tên
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '15px', fontWeight: '500', color: '#0F172A',
            outline: 'none',
            backgroundColor: '#fff',
            appearance: 'none', // Ẩn style mặc định trình duyệt
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            height: '48px',
            cursor: 'pointer'
        },
        
        // Textarea
        textarea: {
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            fontSize: '15px', fontWeight: '500', color: '#0F172A',
            outline: 'none',
            minHeight: '100px', resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
        },

        footer: {
            padding: '24px 32px',
            background: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'flex-end', gap: '12px'
        },
        
        // Buttons
        btnSecondary: {
            padding: '12px 24px', borderRadius: '10px',
            border: '1px solid #E2E8F0', background: 'white',
            fontWeight: '600', color: '#64748B', cursor: 'pointer',
            fontSize: '14px'
        },
        btnPrimary: {
            padding: '12px 24px', borderRadius: '10px',
            border: 'none',
            background: '#E11D48', // Màu đỏ chủ đạo
            color: 'white', fontWeight: '600', cursor: 'pointer',
            fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.2)'
        }
    };

    return (
        <div style={s.overlay}>
            {/* CSS Reset cục bộ & Animations */}
            <style>{`
                /* Ép toàn bộ text trong modal về căn trái */
                .custom-modal-wrapper * { text-align: left; } 
                
                /* Hiệu ứng focus input */
                .custom-input:focus { border-color: #E11D48 !important; box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1) !important; }
                
                /* Hiệu ứng modal xuất hiện */
                @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div style={s.modal} className="custom-modal-wrapper">
                {/* Header */}
                <div style={s.header}>
                    <div>
                        <h2 style={s.title}>{customer ? 'Edit Customer' : 'Add Customer'}</h2>
                        <div style={{fontSize: '14px', color: '#64748B', marginTop: '4px'}}>
                            {customer ? 'Update customer details below.' : 'Create a new customer profile.'}
                        </div>
                    </div>
                    <button style={s.closeBtn} onClick={onClose} title="Close">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{margin: 0, width: '100%'}}>
                    <div style={s.body}>
                        {/* Hàng 1: Full Name (Full width) */}
                        <div style={s.fullWidth}>
                            <label style={s.label}>Full Name <span style={{color: '#E11D48'}}>*</span></label>
                            <div style={s.inputWrapper}>
                                <User size={18} style={s.icon} />
                                <input 
                                    style={s.input} 
                                    className="custom-input"
                                    value={formData.full_name}
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="e.g. Nguyen Van A"
                                    required
                                />
                            </div>
                        </div>

                        {/* Grid 2 cột: Phone - Gender */}
                        <div style={s.grid}>
                            <div>
                                <label style={s.label}>Phone Number <span style={{color: '#E11D48'}}>*</span></label>
                                <div style={s.inputWrapper}>
                                    <Phone size={18} style={s.icon} />
                                    <input 
                                        style={s.input} 
                                        className="custom-input"
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        placeholder="0912..."
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={s.label}>Gender</label>
                                <div style={s.inputWrapper}>
                                    {/* Select Box Custom */}
                                    <select 
                                        style={s.select}
                                        className="custom-input"
                                        value={formData.gender}
                                        onChange={e => setFormData({...formData, gender: e.target.value})}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {/* Icon mũi tên tự tạo đẹp hơn mặc định */}
                                    <ChevronDown size={16} style={{position: 'absolute', right: '14px', color: '#64748B', pointerEvents: 'none'}} />
                                </div>
                            </div>
                        </div>

                        {/* Grid 2 cột: Email - DOB */}
                        <div style={s.grid}>
                            <div>
                                <label style={s.label}>Email Address</label>
                                <div style={s.inputWrapper}>
                                    <Mail size={18} style={s.icon} />
                                    <input 
                                        type="email"
                                        style={s.input} 
                                        className="custom-input"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={s.label}>Date of Birth</label>
                                <div style={s.inputWrapper}>
                                    <Calendar size={18} style={s.icon} />
                                    <input 
                                        type="date"
                                        style={s.input} 
                                        className="custom-input"
                                        value={formData.dob}
                                        onChange={e => setFormData({...formData, dob: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hàng cuối: Address */}
                        <div style={{marginBottom: 0}}>
                            <label style={s.label}>Address</label>
                            <div style={s.inputWrapper}>
                                <textarea 
                                    style={s.textarea}
                                    className="custom-input"
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                    placeholder="Enter full address here..."
                                />
                                <MapPin size={16} style={{position: 'absolute', right: '12px', bottom: '12px', color: '#94A3B8'}} />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={s.footer}>
                        <button type="button" style={s.btnSecondary} onClick={onClose}>Cancel</button>
                        <button type="submit" style={s.btnPrimary}>
                            <Save size={18} /> Save Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;