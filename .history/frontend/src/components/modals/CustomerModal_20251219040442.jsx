import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

const CustomerModal = ({ isOpen, onClose, customer, onSuccess }) => {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        gender: 'other',
        dob: '',
        address: ''
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                id: customer.id,
                full_name: customer.full_name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                gender: customer.gender || 'other',
                dob: customer.dob || '',
                address: customer.address || ''
            });
        } else {
            setFormData({
                full_name: '',
                phone: '',
                email: '',
                gender: 'other',
                dob: '',
                address: ''
            });
        }
    }, [customer, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (customer) {
                // Update
                await api.put('/admin/customers.php', formData);
                success('Customer updated successfully');
            } else {
                // Create
                await api.post('/admin/customers.php', formData);
                success('Customer created successfully');
            }
            onSuccess();
            onClose();
        } catch (err) {
            error(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px', width: '90%' }}>
                <div className="modal-header">
                    <h3>{customer ? 'Edit Customer' : 'New Customer'}</h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div className="form-group">
                        <label>Full Name <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            className="modern-input"
                            required
                            value={formData.full_name}
                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Phone <span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                className="modern-input"
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Gender</label>
                            <select
                                className="modern-select"
                                value={formData.gender}
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Email</label>
                            <input
                                type="email"
                                className="modern-input"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                className="modern-input"
                                value={formData.dob}
                                onChange={e => setFormData({ ...formData, dob: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            className="modern-input"
                            style={{ height: '80px', paddingTop: '8px' }}
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                        <button type="button" className="btn-modern secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-modern primary" disabled={loading} style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}>
                            <Save size={16} /> {loading ? 'Saving...' : 'Save Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;
