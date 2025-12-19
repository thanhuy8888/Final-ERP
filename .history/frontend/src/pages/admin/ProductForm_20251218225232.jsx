import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import VariantManager from '../../components/VariantManager';
import { 
    Package, FileText, Image as ImageIcon, Tag, 
    DollarSign, ArrowLeft, Save, X, Info 
} from 'lucide-react';
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
            const payload = { ...formData, id: id || null, variants: variants };
            const response = await api.post('/admin/products.php', payload);
            if (response.data.success) {
                setMessage(response.data.message);
                setTimeout(() => navigate('/admin/products'), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi hệ thống');
        }
    };

    return (
        <div className="product-form-container">
            {/* Top Bar Navigation */}
            <div className="form-header-bar">
                <div className="header-left">
                    <button onClick={() => navigate('/admin/products')} className="back-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1>{id ? t('admin.editProduct') : t('admin.addProduct')}</h1>
                        <p className="subtitle">Quản lý thông tin chi tiết của sản phẩm</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn-cancel">
                        Hủy
                    </button>
                    <button type="submit" form="product-main-form" className="btn-save">
                        <Save size={18} />
                        {id ? t('common.save') : t('admin.addProduct')}
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {message && <div className="alert-success-premium">{message}</div>}
            {error && <div className="alert-error-premium">{error}</div>}

            <form id="product-main-form" onSubmit={handleSubmit} className="form-grid">
                {/* Left Column: Primary Info */}
                <div className="column-left">
                    <div className="form-section-card">
                        <h2 className="section-title">
                            <Package size={20} color="#E31E24" /> 
                            Thông tin cơ bản
                        </h2>
                        <div className="input-group">
                            <label>{t('admin.productName')}</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                placeholder="Nhập tên sản phẩm..." 
                            />
                        </div>
                        <div className="input-row">
                            <div className="input-group">
                                <label>SKU (Mã định danh)</label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="VD: POLO-001" />
                            </div>
                            <div className="input-group">
                                <label>Barcode</label>
                                <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} placeholder="Mã vạch..." />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>{t('admin.description')}</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Mô tả tóm tắt sản phẩm..." />
                        </div>
                    </div>

                    <div className="form-section-card">
                        <h2 className="section-title">
                            <Tag size={20} color="#E31E24" /> 
                            Phân loại & Thuộc tính
                        </h2>
                        <div className="input-row">
                            <div className="input-group">
                                <label>Chất liệu</label>
                                <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="Cotton, lụa..." />
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

                    <div className="form-section-card">
                        <VariantManager variants={variants} setVariants={setVariants} />
                    </div>
                </div>

                {/* Right Column: Pricing & Media */}
                <div className="column-right">
                    <div className="form-section-card">
                        <h2 className="section-title">
                            <DollarSign size={20} color="#E31E24" /> 
                            Giá bán
                        </h2>
                        <div className="input-group">
                            <label>Giá niêm yết (VNĐ)</label>
                            <div className="price-input-wrapper">
                                <input 
                                    type="number" 
                                    name="price" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    required 
                                    className="price-input"
                                />
                                <span className="currency-unit">₫</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-section-card">
                        <h2 className="section-title">
                            <ImageIcon size={20} color="#E31E24" /> 
                            Hình ảnh đại diện
                        </h2>
                        <div className="input-group">
                            <label>URL Hình ảnh</label>
                            <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
                        </div>
                        <div className="image-preview-box">
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" />
                            ) : (
                                <div className="no-image">
                                    <ImageIcon size={48} strokeWidth={1} />
                                    <span>Chưa có ảnh</span>
                                </div>
                            )}
                        </div>
                        <div className="helper-text">
                            <Info size={14} />
                            Dán liên kết ảnh trực tiếp từ kho lưu trữ.
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;