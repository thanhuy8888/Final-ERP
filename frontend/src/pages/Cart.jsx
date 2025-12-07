import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import './Cart.css';

const Cart = () => {
    const { t } = useTranslation();
    const [cart, setCart] = useState({ items: [], total_price: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart.php');
            setCart(response.data);
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdating(productId);
        try {
            await api.post('/cart.php', {
                action: 'update',
                product_id: productId,
                quantity: newQuantity
            });
            await fetchCart();
        } catch (error) {
            console.error("Update failed", error);
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (productId) => {
        setUpdating(productId);
        try {
            await api.post('/cart.php', {
                action: 'remove',
                product_id: productId
            });
            await fetchCart();
        } catch (error) {
            console.error("Remove failed", error);
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <div className="cart-page">
                <Navbar />
                <div className="cart-loading">
                    <div className="loading-spinner"></div>
                    <p>{t('cart.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <Navbar />

            <div className="cart-container">
                <div className="cart-header">
                    <h1>🛒 {t('cart.title')}</h1>
                    <span className="cart-count">{cart.count || 0} {t('common.products')}</span>
                </div>

                {cart.items.length === 0 ? (
                    <div className="cart-empty">
                        <div className="empty-icon">🛒</div>
                        <h2>{t('cart.empty')}</h2>
                        <p>{t('cart.emptyMessage')}</p>
                        <Link to="/" className="btn-continue-shopping">
                            {t('cart.continueShopping')}
                        </Link>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cart.items.map(item => (
                                <div key={item.id} className={`cart-item ${updating === item.id ? 'updating' : ''}`}>
                                    <div className="item-image">
                                        <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                                    </div>

                                    <div className="item-details">
                                        <Link to={`/product/${item.id}`} className="item-name">
                                            {item.name}
                                        </Link>
                                        <p className="item-price-single">
                                            {parseInt(item.price).toLocaleString()}{t('common.currency')}
                                        </p>
                                    </div>

                                    <div className="item-quantity">
                                        <button
                                            className="qty-btn minus"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1 || updating === item.id}
                                        >
                                            −
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button
                                            className="qty-btn plus"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            disabled={updating === item.id}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="item-subtotal">
                                        <span className="subtotal-label">{t('cart.subtotal')}</span>
                                        <span className="subtotal-value">
                                            {parseInt(item.subtotal).toLocaleString()}{t('common.currency')}
                                        </span>
                                    </div>

                                    <button
                                        className="item-remove"
                                        onClick={() => removeItem(item.id)}
                                        disabled={updating === item.id}
                                        title={t('cart.removeItem')}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <h3>{t('cart.orderSummary')}</h3>

                            <div className="summary-row">
                                <span>{t('cart.tempTotal')} ({cart.count} {t('common.products')})</span>
                                <span>{parseInt(cart.total_price).toLocaleString()}{t('common.currency')}</span>
                            </div>

                            <div className="summary-row">
                                <span>{t('cart.shipping')}</span>
                                <span className="free-shipping">{t('cart.freeShipping')}</span>
                            </div>

                            <div className="summary-row discount">
                                <span>{t('cart.promoCode')}</span>
                                <input type="text" placeholder={t('cart.promoPlaceholder')} className="promo-input" />
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-total">
                                <span>{t('cart.total')}</span>
                                <span className="total-price">
                                    {parseInt(cart.total_price).toLocaleString()}{t('common.currency')}
                                </span>
                            </div>

                            <Link to="/checkout" className="btn-checkout">
                                {t('cart.checkout')}
                                <span className="btn-arrow">→</span>
                            </Link>

                            <Link to="/" className="btn-back-shopping">
                                ← {t('cart.backShopping')}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
