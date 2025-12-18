import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, Calendar, MapPin, ChevronDown } from 'lucide-react';

const CustomerModal = ({ isOpen, onClose, customer, onSuccess }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        gender: 'Male', // Mặc định có giá trị để select hiển thị đẹp
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
        console.log("Saving:", formData);
        onSuccess();
        onClose();
    };

    // --- STYLES "CỨNG" (Đảm bảo không bị vỡ layout) ---
    const s = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999
        },
        modal: {
            background: 'white', width: '600px', maxWidth: '90%',
            borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column',
            textAlign: 'left', // QUAN TRỌNG: Ép toàn bộ nội dung căn trái
            fontFamily: '"Plus Jakarta Sans", sans-serif', // Hoặc font mặc định của bạn
            overflow: 'hidden'
        },
        header: {
            padding: '20px 24px', borderBottom: '1px solid #E2E8F0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#fff'
        },
        title: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#1E293B' },
        closeBtn: {
            background: '#F1F5F9', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748B'
        },
        body: { padding: '24px', maxHeight: '70vh', overflowY: 'auto' },
        
        // Form Layout
        formGroup: { marginBottom: '20px', width: '100%' },
        label: {
            display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569',
            marginBottom: '8px', textAlign: 'left' // Ép label căn trái
        },
        row: { display: 'flex', gap: '20px', width: '100%' },
        col: { flex: 1, display: 'flex', flexDirection: 'column' }, // Cột flex chiếm đều
        
        // Input Styles
        inputWrapper: { position: 'relative', width: '100%' },
        icon: {
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: '#94A3B8', pointerEvents: 'none'
        },
        input: {
            width: '100%', padding: '10px 12px 10px 40px', // Padding trái lớn để chứa icon
            borderRadius: '8px', border: '1px solid #CBD5E1',
            fontSize: '14px', color: '#1E293B', outline: 'none',
            boxSizing: 'border-box', // Đảm bảo padding không làm vỡ width
            height: '42px', backgroundColor: 'white'
        },
        selectWrapper: { position: 'relative', width: '100%' },
        select: {
            width: '100%', padding: '10px 36px 10px 12px',
            borderRadius: '8px', border: '1px solid #CBD5E1',
            fontSize: '14px', color: '#1E293B', outline: 'none',
            appearance: 'none', backgroundColor: 'white', height: '42px', cursor: 'pointer',
            boxSizing: 'border-box'
        },
        chevron: {
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            color: '#64748B', pointerEvents: 'none'
        },
        textarea: {
            width: '100%', padding: '12px', borderRadius: '8px',
            border: '1px solid #CBD5E1', fontSize: '14px', color: '#1E293B',
            outline: 'none', minHeight: '80px', resize: 'vertical',
            fontFamily: 'inherit', boxSizing: 'border-box'
        },
        
        // Footer
        footer: {
            padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0',
            display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center'
        },
        btnCancel: {
            padding: '10px 20px', borderRadius: '8px', border: '1px solid #CBD5E1',
            background: 'white', fontWeight: '600', color: '#475569', cursor: 'pointer',
            fontSize: '14px'
        },
        btnSave: {
            padding: '10px 24px', borderRadius: '8px', border: 'none',
            background: '#E11D48', color: 'white', fontWeight: '600',
            cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px',
            boxShadow: '0 2px 4px rgba(225, 29, 72, 0.2)'
        }
    };

    return (
        <div style={s.overlay}>
             {/* Thêm chút CSS animation inline */}
            <style>{`
                input:focus, select:focus, textarea:focus { border-color: #E11D48 !important; box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1) !important; }
            `}</style>

            <div style={s.modal}>
                <div style={s.header}>
                    <h2 style={s.title}>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
                    <button style={s.closeBtn} onClick={onClose}><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ margin: 0 }}>
                    <div style={s.body}>
                        {/* Hàng 1: Full Name */}
                        <div style={s.formGroup}>
                            <label style={s.label}>Full Name <span style={{color: '#E11D48'}}>*</span></label>
                            <div style={s.inputWrapper}>
                                <User size={18} style={s.icon} />
                                <input 
                                    style={s.input} 
                                    value={formData.full_name}
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Hàng 2: Phone & Gender */}
                        <div style={s.row}>
                            <div style={s.col}>
                                <label style={s.label}>Phone Number <span style={{color: '#E11D48'}}>*</span></label>
                                <div style={s.inputWrapper}>
                                    <Phone size={18} style={s.icon} />
                                    <input 
                                        style={s.input} 
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        placeholder="0912..."
                                        required
                                    />
                                </div>
                            </div>
                            <div style={s.col}>
                                <label style={s.label}>Gender</label>
                                <div style={s.selectWrapper}>
                                    <select 
                                        style={s.select}
                                        value={formData.gender}
                                        onChange={e => setFormData({...formData, gender: e.target.value})}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <ChevronDown size={16} style={s.chevron} />
                                </div>
                            </div>
                        </div>

                        {/* Hàng 3: Email & DOB */}
                        <div style={{...s.row, marginTop: '20px'}}>
                            <div style={s.col}>
                                <label style={s.label}>Email Address</label>
                                <div style={s.inputWrapper}>
                                    <Mail size={18} style={s.icon} />
                                    <input 
                                        type="email"
                                        style={s.input} 
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        placeholder="abc@example.com"
                                    />
                                </div>
                            </div>
                            <div style={s.col}>
                                <label style={s.label}>Date of Birth</label>
                                <div style={s.inputWrapper}>
                                    <Calendar size={18} style={s.icon} />
                                    <input 
                                        type="date"
                                        style={s.input} 
                                        value={formData.dob}
                                        onChange={e => setFormData({...formData, dob: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hàng 4: Address */}
                        <div style={{...s.formGroup, marginTop: '20px', marginBottom: 0}}>
                            <label style={s.label}>Address</label>
                            <div style={s.inputWrapper}>
                                <textarea 
                                    style={s.textarea}
                                    value={formData.address}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                    placeholder="Enter full address..."
                                />
                                {/* Icon định vị góc phải */}
                                <MapPin size={16} style={{position: 'absolute', right: '12px', bottom: '12px', color: '#94A3B8'}} />
                            </div>
                        </div>
                    </div>

                    <div style={s.footer}>
                        <button type="button" style={s.btnCancel} onClick={onClose}>Cancel</button>
                        <button type="submit" style={s.btnSave}>
                            <Save size={16} /> Save Customer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;