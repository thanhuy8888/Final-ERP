import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, Mail, Award, CreditCard } from 'lucide-react';

const CustomerModal = ({ isOpen, onClose, customer, onSuccess }) => {
    // Nếu không mở thì không render gì cả
    if (!isOpen) return null;

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        membership_tier: 'bronze',
        loyalty_points: 0
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                full_name: customer.full_name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                membership_tier: customer.membership_tier || 'bronze',
                loyalty_points: customer.loyalty_points || 0
            });
        } else {
            setFormData({ full_name: '', email: '', phone: '', membership_tier: 'bronze', loyalty_points: 0 });
        }
    }, [customer, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Gọi API save tại đây
        // await api.post(...)
        console.log("Saving data:", formData);
        onSuccess(); // Reload table
        onClose();   // Đóng modal
    };

    // --- STYLES CHO MODAL ---
    const s = {
        overlay: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', // Màu tối mờ
            backdropFilter: 'blur(4px)', // Hiệu ứng kính mờ
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, animation: 'fadeIn 0.2s ease-out'
        },
        modal: {
            background: 'white', width: '500px', maxWidth: '90%',
            borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        },
        header: {
            padding: '24px 32px', borderBottom: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#fff'
        },
        title: { fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 },
        closeBtn: { background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' },
        body: { padding: '32px', overflowY: 'auto', maxHeight: '70vh' },
        formGroup: { marginBottom: '20px' },
        label: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' },
        inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
        icon: { position: 'absolute', left: '16px', color: '#94A3B8' },
        input: {
            width: '100%', padding: '12px 16px 12px 48px', // padding left để tránh icon
            borderRadius: '12px', border: '1px solid #E2E8F0',
            fontSize: '15px', color: '#0F172A', fontWeight: '500', outline: 'none',
            transition: 'border 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box' // Quan trọng để không vỡ layout
        },
        row: { display: 'flex', gap: '20px' },
        footer: {
            padding: '20px 32px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'flex-end', gap: '12px'
        },
        btnCancel: { padding: '12px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600', color: '#475569', cursor: 'pointer' },
        btnSave: { 
            padding: '12px 24px', borderRadius: '12px', border: 'none', 
            background: '#E11D48', color: 'white', fontWeight: '600', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(225, 29, 72, 0.2)'
        }
    };

    return (
        <div style={s.overlay}>
             <style>{`
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                input:focus, select:focus { border-color: #E11D48 !important; box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1) !important; }
            `}</style>
            
            <div style={s.modal}>
                <div style={s.header}>
                    <h2 style={s.title}>{customer ? 'Edit Customer' : 'Create Customer'}</h2>
                    <button style={s.closeBtn} onClick={onClose}><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={s.body}>
                        {/* Name Input */}
                        <div style={s.formGroup}>
                            <label style={s.label}>Full Name</label>
                            <div style={s.inputWrapper}>
                                <User size={18} style={s.icon} />
                                <input 
                                    style={s.input} 
                                    value={formData.full_name} 
                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                    placeholder="e.g. Nguyen Van A"
                                    required
                                />
                            </div>
                        </div>

                        <div style={s.row}>
                            {/* Phone Input */}
                            <div style={{...s.formGroup, flex: 1}}>
                                <label style={s.label}>Phone Number</label>
                                <div style={s.inputWrapper}>
                                    <Phone size={18} style={s.icon} />
                                    <input 
                                        style={s.input} 
                                        value={formData.phone} 
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        placeholder="0912..."
                                    />
                                </div>
                            </div>
                            {/* Email Input */}
                            <div style={{...s.formGroup, flex: 1}}>
                                <label style={s.label}>Email Address</label>
                                <div style={s.inputWrapper}>
                                    <Mail size={18} style={s.icon} />
                                    <input 
                                        type="email"
                                        style={s.input} 
                                        value={formData.email} 
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={s.row}>
                             {/* Tier Select */}
                             <div style={{...s.formGroup, flex: 1}}>
                                <label style={s.label}>Membership Tier</label>
                                <div style={s.inputWrapper}>
                                    <Award size={18} style={s.icon} />
                                    <select 
                                        style={{...s.input, appearance: 'none', cursor: 'pointer'}} 
                                        value={formData.membership_tier}
                                        onChange={e => setFormData({...formData, membership_tier: e.target.value})}
                                    >
                                        <option value="bronze">Bronze</option>
                                        <option value="silver">Silver</option>
                                        <option value="gold">Gold</option>
                                        <option value="platinum">Platinum</option>
                                        <option value="diamond">Diamond</option>
                                    </select>
                                </div>
                            </div>
                            {/* Points Input */}
                            <div style={{...s.formGroup, flex: 1}}>
                                <label style={s.label}>Loyalty Points</label>
                                <div style={s.inputWrapper}>
                                    <CreditCard size={18} style={s.icon} />
                                    <input 
                                        type="number"
                                        style={s.input} 
                                        value={formData.loyalty_points} 
                                        onChange={e => setFormData({...formData, loyalty_points: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={s.footer}>
                        <button type="button" style={s.btnCancel} onClick={onClose}>Cancel</button>
                        <button type="submit" style={s.btnSave}>
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;