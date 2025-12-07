import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import SaleLayout from '../../components/SaleLayout';
import { useTranslation } from '../../hooks/useTranslation';
import './NewOrder.css';

const NewOrder = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerForm, setShowCustomerForm] = useState(false);

    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');

    const [newCustomer, setNewCustomer] = useState({
        phone: '',
        full_name: '',
        email: '',
        address: '',
        city: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, customersRes] = await Promise.all([
                api.get('/products.php'),
                api.get('/sale/customers.php')
            ]);
            setProducts(productsRes.data);
            setCustomers(customersRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    const searchCustomers = async (query) => {
        if (!query.trim()) return;
        try {
            const response = await api.get(`/sale/customers.php?search=${encodeURIComponent(query)}`);
            setCustomers(response.data);
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.product_id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                product_id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            }]);
        }
    };

    const updateQuantity = (productId, qty) => {
        if (qty < 1) {
            setCart(cart.filter(item => item.product_id !== productId));
        } else {
            setCart(cart.map(item =>
                item.product_id === productId ? { ...item, quantity: qty } : item
            ));
        }
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal - discount;

    const handleSubmit = async () => {
        if (cart.length === 0) {
            alert(t('sale.emptyCart'));
            return;
        }

        if (!selectedCustomer && !newCustomer.phone) {
            alert(t('sale.selectCustomer'));
            return;
        }

        setSubmitting(true);
        try {
            const orderData = {
                items: cart.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity
                })),
                discount: discount,
                notes: notes
            };

            if (selectedCustomer) {
                orderData.customer_id = selectedCustomer.id;
                orderData.address = selectedCustomer.address;
            } else {
                orderData.customer_phone = newCustomer.phone;
                orderData.customer_name = newCustomer.full_name;
                orderData.customer_email = newCustomer.email;
                orderData.address = newCustomer.address;
                orderData.city = newCustomer.city;
            }

            const response = await api.post('/sale/orders.php', orderData);

            if (response.data.success) {
                alert(`${t('sale.orderCreated')} #${response.data.order_id}`);
                navigate('/sale/orders');
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Error creating order');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value) => {
        return parseInt(value || 0).toLocaleString() + 'đ';
    };

    if (loading) {
        return (
            <SaleLayout>
                <div className="sale-loading">
                    <div className="loading-spinner"></div>
                    <p>{t('common.loading')}</p>
                </div>
            </SaleLayout>
        );
    }

    return (
        <SaleLayout>
            <div className="new-order">
                <h1>➕ {t('sale.createOrder')}</h1>

                <div className="order-grid">
                    {/* Products */}
                    <div className="products-section">
                        <h3>📦 {t('sale.selectProducts')}</h3>
                        <div className="products-grid">
                            {products.map(product => (
                                <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                                    <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                                    <div className="product-info">
                                        <span className="name">{product.name}</span>
                                        <span className="price">{formatCurrency(product.price)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cart & Customer */}
                    <div className="cart-section">
                        {/* Customer Selection */}
                        <div className="customer-selection">
                            <h3>👤 {t('sale.customer')}</h3>

                            {selectedCustomer ? (
                                <div className="selected-customer">
                                    <div className="customer-info">
                                        <strong>{selectedCustomer.full_name}</strong>
                                        <span>{selectedCustomer.phone}</span>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)}>✕</button>
                                </div>
                            ) : (
                                <>
                                    <div className="customer-search">
                                        <input
                                            type="text"
                                            placeholder={t('sale.searchCustomers')}
                                            value={customerSearch}
                                            onChange={(e) => {
                                                setCustomerSearch(e.target.value);
                                                searchCustomers(e.target.value);
                                            }}
                                        />
                                    </div>

                                    {customerSearch && customers.length > 0 && (
                                        <div className="customer-results">
                                            {customers.slice(0, 5).map(c => (
                                                <div key={c.id} className="customer-option" onClick={() => {
                                                    setSelectedCustomer(c);
                                                    setCustomerSearch('');
                                                }}>
                                                    <span>{c.full_name}</span>
                                                    <span>{c.phone}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        className="btn-new-customer-toggle"
                                        onClick={() => setShowCustomerForm(!showCustomerForm)}
                                    >
                                        {showCustomerForm ? '▲ ' : '▼ '}
                                        {t('sale.newCustomer')}
                                    </button>

                                    {showCustomerForm && (
                                        <div className="new-customer-form">
                                            <input
                                                type="tel"
                                                placeholder={t('sale.phone') + ' *'}
                                                value={newCustomer.phone}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder={t('sale.fullName') + ' *'}
                                                value={newCustomer.full_name}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, full_name: e.target.value })}
                                            />
                                            <input
                                                type="email"
                                                placeholder={t('sale.email')}
                                                value={newCustomer.email}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder={t('sale.address')}
                                                value={newCustomer.address}
                                                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="cart-items">
                            <h3>🛒 {t('sale.cartItems')}</h3>
                            {cart.length === 0 ? (
                                <p className="empty-cart">{t('sale.emptyCart')}</p>
                            ) : (
                                <ul>
                                    {cart.map(item => (
                                        <li key={item.product_id}>
                                            <div className="item-info">
                                                <span className="name">{item.name}</span>
                                                <span className="price">{formatCurrency(item.price)}</span>
                                            </div>
                                            <div className="item-controls">
                                                <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                                                <button className="remove" onClick={() => removeFromCart(item.product_id)}>✕</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Discount & Notes */}
                        <div className="order-extras">
                            <div className="discount-input">
                                <label>{t('sale.discount')}</label>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="notes-input">
                                <label>{t('sale.notes')}</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows="2"
                                />
                            </div>
                        </div>

                        {/* Total & Submit */}
                        <div className="order-summary">
                            <div className="summary-row">
                                <span>{t('sale.subtotal')}</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="summary-row discount">
                                    <span>{t('sale.discount')}</span>
                                    <span>-{formatCurrency(discount)}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>{t('sale.total')}</span>
                                <span>{formatCurrency(total)}</span>
                            </div>

                            <button
                                className="btn-create-order"
                                onClick={handleSubmit}
                                disabled={submitting || cart.length === 0}
                            >
                                {submitting ? t('common.loading') : t('sale.confirmOrder')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SaleLayout>
    );
};

export default NewOrder;
