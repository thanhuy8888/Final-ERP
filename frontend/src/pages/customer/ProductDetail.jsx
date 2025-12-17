import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import Navbar from '../../components/Navbar';
import './ProductDetail.css';

const ProductDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [message, setMessage] = useState('');
    const [adding, setAdding] = useState(false);

    // Get unique sizes and colors
    const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];
    const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    useEffect(() => {
        fetchProduct();
    }, [id]);

    useEffect(() => {
        // Find matching variant when size/color changes
        if (selectedSize && selectedColor && variants.length > 0) {
            const match = variants.find(v => v.size === selectedSize && v.color === selectedColor);
            setSelectedVariant(match || null);
        } else if (variants.length === 0) {
            setSelectedVariant(null);
        }
    }, [selectedSize, selectedColor, variants]);

    const fetchProduct = async () => {
        try {
            const [productRes, variantsRes] = await Promise.all([
                api.get(`/products.php?id=${id}`),
                api.get(`/variants.php?product_id=${id}`)
            ]);

            // API now returns single product directly when id is provided
            const found = productRes.data.error ? null : productRes.data;
            setProduct(found);
            // Ensure data is array to prevent map crash
            setVariants(Array.isArray(variantsRes.data) ? variantsRes.data : []);

            // Auto-select first available size/color
            if (variantsRes.data?.length > 0) {
                const firstVar = variantsRes.data[0];
                setSelectedSize(firstVar.size || '');
                setSelectedColor(firstVar.color || '');
            }
        } catch (error) {
            console.error("Error fetching product", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async () => {
        setAdding(true);
        try {
            const response = await api.post('/cart.php', {
                action: 'add',
                product_id: product.id,
                variant_id: selectedVariant?.variant_id || null,
                quantity: quantity
            });
            if (response.data.success) {
                setMessage('✓ ' + t('product.addedToCart'));
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error("Add to cart failed", error);
            setMessage('✗ ' + t('product.addToCartError'));
        } finally {
            setAdding(false);
        }
    };

    const getVariantStock = () => {
        if (selectedVariant) {
            return parseInt(selectedVariant.stock) || 0;
        }
        return 999; // No variant system, assume available
    };

    const isOutOfStock = variants.length > 0 && getVariantStock() === 0;

    if (loading) {
        return (
            <div className="product-detail-page">
                <Navbar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <Navbar />
                <div className="not-found">
                    <h2>{t('product.notFound')}</h2>
                    <Link to="/" className="btn-back">← {t('product.backHome')}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            <Navbar />

            <div className="container">
                <div className="breadcrumb">
                    <Link to="/">{t('product.home')}</Link> / <span>{product.name}</span>
                </div>

                <div className="product-detail-grid">
                    <div className="product-image-section">
                        <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                    </div>

                    <div className="product-info-section">
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-price-large">
                            {parseInt(selectedVariant?.price_adjustment
                                ? parseInt(product.price) + parseInt(selectedVariant.price_adjustment)
                                : product.price
                            ).toLocaleString()}{t('common.currency')}
                        </p>

                        {/* Size Selection */}
                        {sizes.length > 0 && (
                            <div className="variant-selector">
                                <label>{t('product.size')}:</label>
                                <div className="variant-options">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            className={`variant-btn ${selectedSize === size ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color Selection */}
                        {colors.length > 0 && (
                            <div className="variant-selector">
                                <label>{t('product.color')}:</label>
                                <div className="variant-options">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            className={`variant-btn color ${selectedColor === color ? 'selected' : ''}`}
                                            onClick={() => setSelectedColor(color)}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stock Info */}
                        {variants.length > 0 && selectedVariant && (
                            <div className={`stock-info ${isOutOfStock ? 'out-of-stock' : ''}`}>
                                {isOutOfStock
                                    ? '❌ ' + t('product.outOfStock')
                                    : `✓ ${t('product.inStock')} ${getVariantStock()} ${t('common.products')}`
                                }
                            </div>
                        )}

                        <div className="product-description">
                            <h3>{t('product.description')}</h3>
                            <p>{product.description || t('product.defaultDescription')}</p>
                        </div>

                        <div className="quantity-selector">
                            <label>{t('product.quantity')}:</label>
                            <div className="quantity-controls">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                <input
                                    type="number"
                                    min="1"
                                    max={getVariantStock() || 99}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>

                        <button
                            onClick={addToCart}
                            className="btn-add-to-cart"
                            disabled={adding || isOutOfStock}
                        >
                            {adding ? t('product.adding') : isOutOfStock ? t('product.soldOut') : t('product.addToCart')}
                        </button>

                        {message && (
                            <p className={`cart-message ${message.includes('✓') ? 'success' : 'error'}`}>
                                {message}
                            </p>
                        )}

                        <div className="product-extra-info">
                            <div className="extra-item">
                                <span>🚚</span>
                                <p>{t('product.freeShipping')}</p>
                            </div>
                            <div className="extra-item">
                                <span>↩️</span>
                                <p>{t('product.freeReturn')}</p>
                            </div>
                            <div className="extra-item">
                                <span>✅</span>
                                <p>{t('product.authentic')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
