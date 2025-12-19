import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import VariantManager from '../../components/VariantManager';
import { 
    Package, 
    Tag, 
    DollarSign, 
    ImageIcon, 
    Save, 
    ArrowLeft, 
    Info, 
    Layers, 
    FileText 
} from 'lucide-react';
import { motion } from 'framer-motion';
import './ProductForm.css';

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
                } catch (err) {
                    console.error("Failed to fetch product", err);
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
        } catch (err) {
            setError(err.response?.data?.error || 'Error');
        }
    };

    return (
        <motion.div 
            className="product-form-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header Area */}
            <div className="form-header-bar">
                <div className="header-left">
                    <button onClick={() => navigate('/admin/products')} className="btn-back-circle">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1>{id ? t('admin.editProduct') : t('admin.addProduct')}</h1>
                        <p className="subtitle">Thiết lập thông tin, giá cả và thuộc tính sản phẩm</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn-cancel-glass">
                        {t('common.cancel')}
                    </button>
                    <button type="submit" form="product-form" className="btn-save-gradient">
                        <Save size={18} />
                        {id ? t('common.save') : 'Đăng sản phẩm'}
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {message && <div className="alert-box success-glass">{message}</div>}
            {error && <div className="alert-box error-glass">{error}</div>}

            <form id="product-form" onSubmit={handleSubmit} className="form-bento-grid">
                
                {/* Main Content Area */}
                <div className="bento-main">
                    
                    {/* Basic Info Card */}
                    <div className="premium-card">
                        <div className="card-header-icon">
                            <Package size={20} color="#E31E24" />
                            <h2>Thông tin sản phẩm</h2>
                        </div>
                        <div className="input-group">
                            <label>{t('admin.productName')}</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                placeholder="VD: Áo Polo Canifa thun lạnh cao cấp"
                            />
                        </div>
                        <div className="grid-2-col">
                            <div className="input-group">
                                <label>Mã SKU (Định danh)</label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="VD: CAN-001" />
                            </div>
                            <div className="input-group">
                                <label>Mã vạch (Barcode)</label>
                                <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} placeholder="893..." />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>{t('admin.description')}</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows="5" 
                                placeholder="Mô tả chất liệu, đặc điểm nổi bật..."
                            />
                        </div>
                    </div>

                    {/* Attributes Card */}
                    <div className="premium-card">
                        <div className="card-header-icon">
                            <Layers size={20} color="#E31E24" />
                            <h2>Phân loại & Thuộc tính</h2>
                        </div>
                        <div className="grid-2-col">
                            <div className="input-group">
                                <label>Chất liệu</label>
                                <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="Cotton, Spandex..." />
                            </div>
                            <div className="input-group">
                                <label>Danh mục</label>
                                <select name="category_id" value={formData.category_id} onChange={handleChange}>
                                    <option value="1">{t('navbar.men')}</option>
                                    <option value="2">{t('navbar.women')}</option>
                                    <option value="3">{t('navbar.kids')}</option>
                                    <option value="4">Phụ kiện</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Variant Manager Card */}
                    <div className="premium-card variant-section">
                        <VariantManager variants={variants} setVariants={setVariants} />
                    </div>
                </div>

                {/* Sidebar Area */}
                <div className="bento-sidebar">
                    
                    {/* Price Card */}
                    <div className="premium-card highlight-price">
                        <div className="card-header-icon">
                            <DollarSign size={20} color="#E31E24" />
                            <h2>Giá bán lẻ</h2>
                        </div>
                        <div className="input-group">
                            <label>Giá niêm yết (VNĐ)</label>
                            <div className="price-input-container">
                                <input 
                                    type="number" 
                                    name="price" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <span className="currency-label">₫</span>
                            </div>
                        </div>
                    </div>

                    {/* Media Card */}
                    <div className="premium-card">
                        <div className="card-header-icon">
                            <ImageIcon size={20} color="#E31E24" />
                            <h2>Hình ảnh đại diện</h2>
                        </div>
                        <div className="input-group">
                            <label>Đường dẫn (URL)</label>
                            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
                        </div>
                        <div className="image-preview-frame">
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" />
                            ) : (
                                <div className="no-image-placeholder">
                                    <ImageIcon size={48} strokeWidth={1} />
                                    <span>Chưa có ảnh</span>
                                </div>
                            )}
                        </div>
                        <div className="info-helper">
                            <Info size={14} />
                            <span>Ảnh sẽ hiển thị trên trang chủ và danh mục.</span>
                        </div>
                    </div>

                </div>
            </form>
        </motion.div>
    );
};

export default ProductForm;