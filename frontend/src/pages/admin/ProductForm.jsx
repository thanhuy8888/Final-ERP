import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '1',
        image: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            // Fetch product data for editing
            const fetchProduct = async () => {
                try {
                    const response = await api.get('/admin/products.php');
                    const product = response.data.find(p => p.id == id);
                    if (product) {
                        setFormData({
                            name: product.name,
                            description: product.description || '',
                            price: product.price,
                            category_id: product.category_id || '1',
                            image: product.image || ''
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch product", error);
                }
            };
            fetchProduct();
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const payload = id ? { ...formData, id } : formData;
            const response = await api.post('/admin/products.php', payload);

            if (response.data.success) {
                setMessage(response.data.message);
                setTimeout(() => navigate('/admin/products'), 1500);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Có lỗi xảy ra');
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>{id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>
            </div>

            <div className="admin-card" style={{ maxWidth: '600px' }}>
                {message && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}
                {error && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tên sản phẩm:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Mô tả:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Giá:</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Danh mục:</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                            <option value="1">Nam</option>
                            <option value="2">Nữ</option>
                            <option value="3">Bé trai</option>
                            <option value="4">Bé gái</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>URL Hình ảnh:</label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" className="btn-primary">{id ? 'Cập nhật' : 'Thêm sản phẩm'}</button>
                        <button type="button" onClick={() => navigate('/admin/products')} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '5px', background: 'white', cursor: 'pointer' }}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
