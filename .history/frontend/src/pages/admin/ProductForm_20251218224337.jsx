import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import VariantManager from '../../components/VariantManager';
import { Package, FileText, Image as ImageIcon, Tag, DollarSign, ArrowLeft, Save, X } from 'lucide-react';
import './ProductForm.css';

const ProductForm = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', sku: '', barcode: '', material: '',
        description: '', price: '', category_id: '1', image: ''
    });
    const [variants, setVariants] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
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
                } catch (err) { setError("Failed to load product"); }
            };
            fetchProduct();
        }
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, id: id || null, variants: variants };
            const response = await api.post('/admin/products.php', payload);
            if (response.data.success) {
                setMessage(response.data.message);
                setTimeout(() => navigate('/admin/products'), 1500);
            }
        } catch (err) { setError(err.response?.data?.error || 'Error'); }
    };

    return (
        <div className="product-form-container">
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => navigate('/admin/products')} className="btn-cancel" style={{ padding: '8px' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                        {id ? t('admin.editProduct') : t('admin.addProduct')}
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn-cancel">
                        {t('common.cancel')}
                    </button>
                    <button type="submit" form="product-form" className="btn-save">
                        <Save size={18} style={{ marginRight: '8px' }} />
                        {id ? t('common.save') : t('admin.addProduct')}
                    </button>
                </div>
            </div>

            {message && <div className="alert-success" style={{ padding: '15px', background: '#ecfdf5', color: '#059669', borderRadius: '12px', marginBottom: '20px', border: '1px solid #bbf7d0' }}>{message}</div>}
            {error && <div className="alert-error" style={{ padding: '15px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', marginBottom: '20px', border: '1px solid #fecaca' }}>{error}</div>}

            <form id="product-form" onSubmit={handleSubmit} className="form-grid">
                {/* Cột trái: Thông tin chính */}
                <div className="form-left">
                    <div className="form-section-card">
                        <h2 className="section-title"><Package size={20} color="#E31E24" /> {t('admin.overview')}</h2>
                        <div className="input-group">
                            <label>{t('admin.productName')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nhập tên sản phẩm..." />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="input-group">
                                <label>SKU</label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="VD: POLO-001" />
                            </div>
                            <div className="input-group">
                                <label>Barcode</label>
                                <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} placeholder="Mã vạch..." />
                            </div>
                        </div>
                        <div className="input-group" style={{ marginTop: '10px' }}>
                            <label>{t('admin.description')}</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Mô tả chi tiết sản phẩm..." />
                        </div>
                    </div>

                    <div className="form-section-card">
                        <h2 className="section-title"><Tag size={20} color="#E31E24" /> Phân loại & Thuộc tính</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="input-group">
                                <label>Chất liệu (Material)</label>
                                <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="Cotton, lụa..." />
                            </div>
                            <div className="input-group">
                                <label>Danh mục (Category)</label>
                                <select name="category_id" value={formData.category_id} onChange={handleChange}>
                                    <option value="1">{t('navbar.men')}</option>
                                    <option value="2">{t('navbar.women')}</option>
                                    <option value="3">{t('navbar.kids')}</option>
                                    <option value="4">Phụ kiện</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section-card">
                        <VariantManager variants={variants} setVariants={setVariants} />
                    </div>
                </div>

                {/* Cột phải: Giá & Ảnh */}
                <div className="form-right">
                    <div className="form-section-card">
                        <h2 className="section-title"><DollarSign size={20} color="#E31E24" /> {t('admin.price')}</h2>
                        <div className="input-group">
                            <label>Giá bán lẻ (VNĐ)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#E31E24' }} />
                        </div>
                    </div>

                    <div className="form-section-card">
                        <h2 className="section-title"><ImageIcon size={20} color="#E31E24" /> Hình ảnh</h2>
                        <div className="input-group">
                            <label>URL Hình ảnh</label>
                            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
                        </div>
                        <div className="image-preview-box">
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" />
                            ) : (
                                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                    <ImageIcon size={48} strokeWidth={1} />
                                    <p style={{ fontSize: '12px' }}>Chưa có ảnh</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;