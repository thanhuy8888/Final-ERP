import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import VariantManager from '../../components/VariantManager';

const ProductForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        material: '',
        description: '',
        price: '',
        category_id: '1',
        image: ''
    });
    const [variants, setVariants] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            // Fetch product data for editing
            const fetchProduct = async () => {
                try {
                    // Use new endpoint that returns single product with variants
                    const response = await api.get(`/admin/products.php?id=${id}`);
                    const product = response.data;

                    if (product) {
                        setFormData({
                            name: product.name,
                            sku: product.sku || '',
                            barcode: product.barcode || '',
                            material: product.material || '',
                            description: product.description || '',
                            price: product.price,
                            category_id: product.category_id || '1',
                            image: product.image || ''
                        });
                        setVariants(product.variants || []);
                    }
                } catch (error) {
                    console.error("Failed to fetch product", error);
                    setError("Failed to load product");
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
            const payload = {
                ...formData,
                id: id || null,
                variants: variants
            };

            const response = await api.post('/admin/products.php', payload);

            if (response.data.success) {
                setMessage(response.data.message);
                setTimeout(() => navigate('/admin/products'), 1500);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Error');
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>{id ? t('admin.editProduct') : t('admin.addProduct')}</h1>
            </div>

            <div className="admin-card" style={{ maxWidth: '800px' }}>
                {message && <div style={{ padding: '10px', background: '#d4edda', color: '#155724', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}
                {error && <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('admin.productName')}:</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>SKU:</label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="EX: POLO-001"
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Barcode:</label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Material:</label>
                            <input
                                type="text"
                                name="material"
                                value={formData.material}
                                onChange={handleChange}
                                placeholder="Cotton, Polyester..."
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('admin.description')}:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('admin.price')}:</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Category:</label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                            >
                                <option value="1">{t('navbar.men')}</option>
                                <option value="2">{t('navbar.women')}</option>
                                <option value="3">{t('navbar.kids')}</option>
                                <option value="4">{t('navbar.kids')}</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>{t('admin.image')} URL:</label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                    </div>

                    {/* Variant Manager Component */}
                    <VariantManager variants={variants} setVariants={setVariants} />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button type="submit" className="btn-primary">{id ? t('common.save') : t('admin.addProduct')}</button>
                        <button type="button" onClick={() => navigate('/admin/products')} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '5px', background: 'white', cursor: 'pointer' }}>
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
