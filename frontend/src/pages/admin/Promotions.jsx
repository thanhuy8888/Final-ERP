import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminPromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [formData, setFormData] = useState({
        promotion_code: '',
        promotion_name: '',
        description: '',
        discount_type: 'Percentage',
        discount_value: '',
        min_purchase_amount: 0,
        max_discount_amount: '',
        start_date: '',
        end_date: '',
        usage_limit: '',
        is_active: true
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchPromotions = async () => {
        try {
            const response = await api.get('/admin/promotions.php');
            setPromotions(response.data);
        } catch (error) {
            console.error("Failed to fetch promotions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = editingPromo ? { ...formData, promotion_id: editingPromo.promotion_id } : formData;
            const response = await api.post('/admin/promotions.php', payload);
            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message });
                setShowForm(false);
                setEditingPromo(null);
                resetForm();
                fetchPromotions();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Có lỗi xảy ra' });
        }
    };

    const handleEdit = (promo) => {
        setEditingPromo(promo);
        setFormData({
            promotion_code: promo.promotion_code,
            promotion_name: promo.promotion_name,
            description: promo.description || '',
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            min_purchase_amount: promo.min_purchase_amount || 0,
            max_discount_amount: promo.max_discount_amount || '',
            start_date: promo.start_date?.slice(0, 16) || '',
            end_date: promo.end_date?.slice(0, 16) || '',
            usage_limit: promo.usage_limit || '',
            is_active: promo.is_active
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa khuyến mãi này?')) return;
        try {
            await api.delete('/admin/promotions.php', { data: { promotion_id: id } });
            fetchPromotions();
        } catch (error) {
            setMessage({ type: 'error', text: 'Xóa thất bại' });
        }
    };

    const resetForm = () => {
        const now = new Date();
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        setFormData({
            promotion_code: '',
            promotion_name: '',
            description: '',
            discount_type: 'Percentage',
            discount_value: '',
            min_purchase_amount: 0,
            max_discount_amount: '',
            start_date: now.toISOString().slice(0, 16),
            end_date: nextMonth.toISOString().slice(0, 16),
            usage_limit: '',
            is_active: true
        });
    };

    const getStatusBadge = (promo) => {
        const now = new Date();
        const start = new Date(promo.start_date);
        const end = new Date(promo.end_date);

        if (!promo.is_active) {
            return <span style={{ background: '#95a5a6', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>Tắt</span>;
        }
        if (now < start) {
            return <span style={{ background: '#f39c12', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>Sắp diễn ra</span>;
        }
        if (now > end) {
            return <span style={{ background: '#e74c3c', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>Hết hạn</span>;
        }
        return <span style={{ background: '#2ecc71', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' }}>Đang chạy</span>;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>Quản lý khuyến mãi</h1>
                <button className="btn-primary" onClick={() => {
                    setShowForm(true);
                    setEditingPromo(null);
                    resetForm();
                }}>+ Thêm khuyến mãi</button>
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
                    <h3>{editingPromo ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div>
                                <label>Mã khuyến mãi *</label>
                                <input
                                    type="text"
                                    value={formData.promotion_code}
                                    onChange={(e) => setFormData({ ...formData, promotion_code: e.target.value.toUpperCase() })}
                                    required
                                    placeholder="VD: SALE20, NEWYEAR"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>Tên khuyến mãi *</label>
                                <input
                                    type="text"
                                    value={formData.promotion_name}
                                    onChange={(e) => setFormData({ ...formData, promotion_name: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>Loại giảm giá *</label>
                                <select
                                    value={formData.discount_type}
                                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="Percentage">Phần trăm (%)</option>
                                    <option value="Fixed Amount">Số tiền cố định (VNĐ)</option>
                                </select>
                            </div>
                            <div>
                                <label>Giá trị giảm *</label>
                                <input
                                    type="number"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                    required
                                    placeholder={formData.discount_type === 'Percentage' ? 'VD: 10' : 'VD: 50000'}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>Đơn tối thiểu</label>
                                <input
                                    type="number"
                                    value={formData.min_purchase_amount}
                                    onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                                    placeholder="0"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>Giảm tối đa (nếu %)</label>
                                <input
                                    type="number"
                                    value={formData.max_discount_amount}
                                    onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                    placeholder="Không giới hạn"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>Bắt đầu *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>Kết thúc *</label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label>Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="2"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary">
                                {editingPromo ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} style={{
                                padding: '10px 20px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                background: 'white',
                                cursor: 'pointer'
                            }}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Mã</th>
                            <th>Tên</th>
                            <th>Giảm giá</th>
                            <th>Đơn tối thiểu</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promotions.map(promo => (
                            <tr key={promo.promotion_id}>
                                <td><strong>{promo.promotion_code}</strong></td>
                                <td>{promo.promotion_name}</td>
                                <td>
                                    {promo.discount_type === 'Percentage'
                                        ? `${promo.discount_value}%`
                                        : `${parseInt(promo.discount_value).toLocaleString()}đ`}
                                </td>
                                <td>{parseInt(promo.min_purchase_amount).toLocaleString()}đ</td>
                                <td style={{ fontSize: '12px' }}>
                                    {new Date(promo.start_date).toLocaleDateString('vi-VN')}<br />
                                    → {new Date(promo.end_date).toLocaleDateString('vi-VN')}
                                </td>
                                <td>{getStatusBadge(promo)}</td>
                                <td>
                                    <button onClick={() => handleEdit(promo)} className="btn-edit">✏️</button>
                                    <button onClick={() => handleDelete(promo.promotion_id)} className="btn-danger">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPromotions;
