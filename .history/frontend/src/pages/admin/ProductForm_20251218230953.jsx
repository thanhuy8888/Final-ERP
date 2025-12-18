import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import VariantManager from '../../components/VariantManager';
import { 
    Package, Tag, DollarSign, ImageIcon, Save, 
    ArrowLeft, Info, Layers, CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';
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
        <motion.div 
            className="product-form-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header with improved Back Button */}
            <div className="form-header-bar">
                <div className="header-left">
                    <button onClick={() => navigate('/admin/products')} className="btn-back-circle">
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{marginLeft: '15px'}}>
                        <h1>{id ? t('admin.editProduct') : t('admin.addProduct')}</h1>
                        <p className="subtitle">Quản lý kho hàng và thiết lập thuộc tính sản phẩm</p>
                    </div>
                </div>
                <div className="header-actions" style={{display:'flex', gap:'12px'}}>
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn-cancel-glass">
                        {t('common.cancel')}
                    </button>
                    <button type="submit" form="product-form" className="btn-save-gradient">
                        <Save size={18} /> {id ? t('common.save') : 'Đăng sản phẩm'}
                    </button>
                </div>
            </div>

            {message && <div className="alert-box success-glass">{message}</div>}
            {error && <div className="alert-box error-glass">{error}</div>}

            <form id="product-form" onSubmit={handleSubmit} className="form-bento-grid">
                
                {/* Left Column (70% Width) */}
                <div className="bento-main">
                    <div className="premium-card">
                        <div className="card-header-icon">
                            <Package size={22} color="#E31E24" strokeWidth={2.5} />
                            <h2>Thông tin sản phẩm</h2>
                        </div>
                        <div className="input-group">
                            <label>{t('admin.productName')}</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="VD: Áo Khoác Denim Nam Cao Cấp" />
                        </div>
                        <div className="grid-2-col" style={{padding: 0}}>
                            <div className="input-group">
                                <label>Mã SKU</label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="VD: DENIM-001" />
                            </div>
                            <div className="input-group">
                                <label>Barcode</label>
                                <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} placeholder="893..." />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>{t('admin.description')}</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="6" placeholder="Mô tả chi tiết về sản phẩm..." />
                        </div>
                    </div>

                    <div className="premium-card">
                        <div className="card-header-icon">
                            <Layers size={22} color="#E31E24" strokeWidth={2.5} />
                            <h2>Phân loại hệ thống</h2>
                        </div>
                        <div className="grid-2-col" style={{padding: 0}}>
                            <div className="input-group">
                                <label>Chất liệu</label>
                                <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="Cotton, Denim..." />
                            </div>
                            <div className="input-group">
                                <label>Danh mục</label>
                                <select name="category_id" value={formData.category_id} onChange={handleChange}>
                                    <option value="1">{t('navbar.men')}</option>
                                    <option value="2">{t('navbar.women')}</option>
                                    <option value="3">{t('navbar.kids')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="premium-card">
                        <VariantManager variants={variants} setVariants={setVariants} />
                    </div>
                </div>

                {/* Right Column (30% Width) */}
                <div className="bento-sidebar">
                    <div className="premium-card highlight-price">
                        <div className="card-header-icon">
                            <DollarSign size={22} color="#E31E24" strokeWidth={2.5} />
                            <h2>Giá bán lẻ</h2>
                        </div>
                        <div className="input-group">
                            <div className="price-input-container">
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                                <span className="currency-label">VNĐ</span>
                            </div>
                        </div>
                        <div className="info-helper" style={{marginTop: '10px'}}>
                            <CheckCircle2 size={14} color="#05CD99" />
                            <span>Giá đã bao gồm thuế phí</span>
                        </div>
                    </div>

                    <div className="premium-card">
                        <div className="card-header-icon">
                            <ImageIcon size={22} color="#E31E24" strokeWidth={2.5} />
                            <h2>Hình ảnh sản phẩm</h2>
                        </div>
                        <div className="input-group">
                            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="Dán link ảnh tại đây..." />
                        </div>
                        <div className="image-preview-frame">
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" />
                            ) : (
                                <div className="no-image-placeholder">
                                    <ImageIcon size={48} color="#CBD5E0" strokeWidth={1} />
                                    <p style={{color: '#A0AEC0', fontSize: '12px'}}>Chưa có ảnh</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default ProductForm;