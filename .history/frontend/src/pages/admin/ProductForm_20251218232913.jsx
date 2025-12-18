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
                } catch (err) { setError("Failed to load product details"); }
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
        } catch (err) { setError(err.response?.data?.error || 'An error occurred while saving'); }
    };

    return (
        <motion.div 
            className="product-form-container"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header Section */}
            <div className="form-header-bar">
                <div className="header-left">
                    <button onClick={() => navigate('/admin/products')} className="btn-back-circle">
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{marginLeft: '20px'}}>
                        <h1>{id ? "Edit Product" : "Add New Product"}</h1>
                        <p className="subtitle">Manage inventory and configure product attributes</p>
                    </div>
                </div>
                <div className="header-actions" style={{display:'flex', gap:'12px'}}>
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn-cancel-glass">
                        Cancel
                    </button>
                    <button type="submit" form="product-form" className="btn-save-gradient">
                        <Save size={18} /> {id ? "Save Changes" : "Publish Product"}
                    </button>
                </div>
            </div>

            {message && <div className="alert-box success-glass">{message}</div>}
            {error && <div className="alert-box error-glass">{error}</div>}

            <form id="product-form" onSubmit={handleSubmit} className="form-bento-grid">
                
                {/* Left Column - Main Info */}
                <div className="bento-main">
                    <div className="premium-card">
                        <div className="card-header-icon">
                            <Package size={22} color="#E31E24" strokeWidth={2.5} />
                            <h2>General Information</h2>
                        </div>
                        <div className="input-group">
                            <label>Product Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                placeholder="e.g. Premium Denim Jacket" 
                            />
                        </div>
                        <div className="grid-2-col">
                            <div className="input-group">
                                <label>SKU Code</label>
                                <input 
                                    type="text" 
                                    name="sku" 
                                    value={formData.sku} 
                                    onChange={handleChange} 
                                    placeholder="e.g. DNM-001" 
                                />
                            </div>
                            <div className="input-group">
                                <label>Barcode (EAN/UPC)</label>
                                <input 
                                    type="text" 
                                    name="barcode" 
                                    value={formData.barcode} 
                                    onChange={handleChange} 
                                    placeholder="893XXXXXXXXXX" 
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Product Description</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                rows="6" 
                                placeholder="Write a detailed description of the product..." 
                            />
                        </div>
                    </div>

                    <div className="premium-card">
                        <div className="card-header-icon">
                            <Layers size={22} color="#E31E24" strokeWidth={2.5} />
                            <h2>Organization & Material</h2>
                        </div>
                        <div className="grid-2-col">
                            <div className="input-group">
                                <label>Material</label>
                                <input 
                                    type="text" 
                                    name="material" 
                                    value={formData.material} 
                                    onChange={handleChange} 
                                    placeholder="e.g. 100% Cotton, Denim" 
                                />
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <select name="category_id" value={formData.category_id} onChange={handleChange}>
                                    <option value="1">Men</option>
                                    <option value="2">Women</option>
                                    <option value="3">Kids</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Variant Section */}
                    <div className="premium-card">
                        <VariantManager variants={variants} setVariants={setVariants} />
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="bento-sidebar">
                    <div className="premium-card highlight-price">
                        <div className="card-header-icon">
                            <DollarSign size={22} color="#E31E24" strokeWidth={2.5} />
                            <h2>Pricing</h2>
                        </div>
                        <div className="input-group">
                            <label>Retail Price</label>
                            <div className="price-input-container">
                                <input 
                                    type="number" 
                                    name="price" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    required 
                                />
                                <span className="currency-label">VND</span>
                            </div>
                        </div>
                        <div className="info-helper" style={{marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                            <CheckCircle2 size={16} color="#05CD99" />
                            <span style={{fontSize: '13px', color: '#64748B'}}>Price includes VAT & fees</span>
                        </div>
                    </div>

                    <div className="premium-card">
                        <div className="card-header-icon">
                            <ImageIcon size={22} color="#E31E24" strokeWidth={2.5} />
                            <h2>Product Media</h2>
                        </div>
                        <div className="input-group">
                            <label>Image URL</label>
                            <input 
                                type="text" 
                                name="image" 
                                value={formData.image} 
                                onChange={handleChange} 
                                placeholder="Paste image link here..." 
                            />
                        </div>
                        <div className="image-preview-frame">
                            {formData.image ? (
                                <img src={formData.image} alt="Product Preview" />
                            ) : (
                                <div className="no-image-placeholder">
                                    <ImageIcon size={48} color="#CBD5E0" strokeWidth={1} />
                                    <p style={{marginTop: '10px', fontSize: '13px'}}>No image preview available</p>
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