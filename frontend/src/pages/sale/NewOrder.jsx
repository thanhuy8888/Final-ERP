import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import SaleLayout from '../../components/SaleLayout';
import { useTranslation } from '../../hooks/useTranslation';
import './NewOrder.css';
import './BarcodePayment.css';

import Modal from '../../components/Modal';

const NewOrder = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Modal state
    const [successModal, setSuccessModal] = useState({ open: false, orderId: null });
    const [draftModal, setDraftModal] = useState(false);
    const [showDraftSaveSuccess, setShowDraftSaveSuccess] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerForm, setShowCustomerForm] = useState(false);

    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('');

    // Barcode and Payment state
    const [barcodeInput, setBarcodeInput] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const [newCustomer, setNewCustomer] = useState({
        phone: '',
        full_name: '',
        email: '',
        address: '',
        city: ''
    });

    useEffect(() => {
        fetchData();
        checkDraft();
    }, []);

    // Handle Re-order or Draft Resume
    useEffect(() => {
        const handleReorder = async () => {
            if (location.state?.reorderId) {
                try {
                    const res = await api.get(`/sale/orders.php?id=${location.state.reorderId}`);
                    const orderData = res.data;

                    if (orderData && orderData.items) {
                        // Populate Cart
                        const reOrderItems = orderData.items.map(item => ({
                            product_id: item.product_id,
                            name: item.product_name,
                            price: parseFloat(item.price),
                            quantity: parseInt(item.quantity)
                        }));
                        setCart(reOrderItems);

                        // Populate Customer
                        if (orderData.customer_id) {
                            setSelectedCustomer({
                                id: orderData.customer_id,
                                full_name: orderData.customer_name,
                                phone: orderData.customer_phone,
                                address: orderData.shipping_address
                            });
                        } else if (orderData.customer_phone) {
                            // For guest customers
                            setNewCustomer({
                                phone: orderData.customer_phone || '',
                                full_name: orderData.customer_name || '',
                                email: orderData.customer_email || '',
                                address: orderData.shipping_address || '',
                                city: ''
                            });
                            setShowCustomerForm(true);
                        }
                    }

                    window.history.replaceState({}, document.title);
                } catch (err) {
                    console.error("Failed to load reorder data", err);
                    alert(t('dashboard.loadReorderError'));
                }
            } else if (location.state?.draft) {
                const draft = location.state.draft;
                setCart(draft.cart || []);
                setSelectedCustomer(draft.customer || null);
                setDiscount(draft.discount || 0);
                setNotes(draft.notes || '');
                window.history.replaceState({}, document.title);
            }
        };

        handleReorder();
    }, [location.state, t]);

    const fetchData = async () => {
        try {
            const [productsRes, customersRes] = await Promise.all([
                api.get('/products.php'),
                api.get('/sale/customers.php')
            ]);
            // Extract products array from response
            let productsData = [];
            if (Array.isArray(productsRes.data)) {
                productsData = productsRes.data;
            } else if (productsRes.data && Array.isArray(productsRes.data.products)) {
                productsData = productsRes.data.products;
            }
            setProducts(productsData);

            // Extract customers array from response
            let customersData = [];
            if (Array.isArray(customersRes.data)) {
                customersData = customersRes.data;
            } else if (customersRes.data && Array.isArray(customersRes.data.customers)) {
                customersData = customersRes.data.customers;
            }
            setCustomers(customersData);
        } catch (error) {
            console.error('Failed to fetch data', error);
            setProducts([]);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const checkDraft = () => {
        // Legacy single draft check (migration) or just ignore if we move fully to list
        // For now, let's stop auto-checking single key
    };

    const loadDraft = () => {
        // Now handled via location.state mostly
    };

    const discardDraft = () => {
        // Only for legacy
        localStorage.removeItem('order_draft');
        setDraftModal(false);
    };

    const saveDraft = () => {
        const draft = {
            id: Date.now(), // Unique ID
            cart,
            customer: selectedCustomer,
            discount,
            notes,
            timestamp: new Date().toISOString()
        };

        // Get existing drafts
        let drafts = [];
        try {
            const saved = localStorage.getItem('sale_drafts');
            if (saved) drafts = JSON.parse(saved);
        } catch (e) {
            drafts = [];
        }

        // Add new draft
        drafts.unshift(draft); // Add to top
        localStorage.setItem('sale_drafts', JSON.stringify(drafts));

        setShowDraftSaveSuccess(true);
    };

    const searchCustomers = async (query) => {
        if (!query.trim()) return;
        try {
            const response = await api.get(`/sale/customers.php?search=${encodeURIComponent(query)}`);
            const customersData = Array.isArray(response.data)
                ? response.data
                : (response.data?.customers || []);
            setCustomers(customersData);
        } catch (error) {
            console.error('Search failed', error);
            setCustomers([]);
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
                price: parseFloat(product.price),
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

    // Calculate membership discount
    const membershipDiscount = selectedCustomer?.loyalty?.tier_discount
        ? Math.floor(subtotal * (selectedCustomer.loyalty.tier_discount / 100))
        : 0;

    const totalAfterMembershipDiscount = subtotal - membershipDiscount;
    const total = totalAfterMembershipDiscount - discount;
    const vat = Math.floor(total * 0.1); // 10% VAT
    const finalTotal = total + vat;

    // Calculate points to be earned
    const pointsToEarn = selectedCustomer?.loyalty
        ? Math.floor((finalTotal / 1000) * (selectedCustomer.loyalty.tier_multiplier || 1))
        : 0;

    // Barcode search handler
    const handleBarcodeSearch = async (barcode) => {
        if (!barcode.trim()) return;
        try {
            const res = await api.get(`/products.php?barcode=${encodeURIComponent(barcode)}`);
            if (res.data && !res.data.error) {
                addToCart(res.data);
                setBarcodeInput(''); // Clear input
            } else {
                alert(t('dashboard.productNotFound'));
            }
        } catch (err) {
            console.error('Barcode search failed:', err);
            alert(t('dashboard.barcodeError'));
        }
    };

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

            // Add payment method
            orderData.payment_method = paymentMethod;

            const response = await api.post('/sale/orders.php', orderData);

            if (response.data && (response.data.success || response.data.order_id)) {
                setSuccessModal({ open: true, orderId: response.data.order_id || response.data.id });
                localStorage.removeItem('order_draft'); // Clear draft on success
            }
        } catch (error) {
            alert(error.response?.data?.error || t('dashboard.errorCreating'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setSuccessModal({ open: false, orderId: null });
        navigate('/sale/orders');
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
        <div className="new-order">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>➕ {t('sale.createOrder')}</h1>
                <button className="btn-save-draft" onClick={saveDraft} disabled={cart.length === 0}>
                    💾 {t('dashboard.saveDraft')}
                </button>
            </div>

            <div className="order-grid">
                {/* Products */}
                <div className="products-section">
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, flex: '0 0 auto' }}>📦 {t('sale.selectProducts')}</h3>
                        {/* Barcode Scanner - Compact */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 16px',
                            background: '#f8f9fa',
                            border: '2px solid #e9ecef',
                            borderRadius: '10px'
                        }}>
                            <span style={{ color: '#6c757d', fontSize: '1.2rem' }}>📷</span>
                            <input
                                type="text"
                                placeholder={t('dashboard.barcodePlaceholder')}
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleBarcodeSearch(barcodeInput);
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px 14px',
                                    border: 'none',
                                    background: 'white',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            />
                        </div>
                    </div>
                    <div className="products-grid">
                        {Array.isArray(products) && products.length > 0 ? (
                            products.map(product => (
                                <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                                    <div className="card-image-wrapper" style={{ position: 'relative' }}>
                                        <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                                        <span className={`stock-badge ${product.total_quantity == 0 ? 'out' : product.total_quantity <= 5 ? 'low' : ''}`}>
                                            📦 {product.total_quantity}
                                        </span>
                                    </div>
                                    <div className="product-info">
                                        <span className="name">{product.name}</span>
                                        <span className="price">{formatCurrency(product.price)}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ padding: '20px', color: '#666' }}>{t('dashboard.noProductsFound')}</p>
                        )}
                    </div>
                </div>

                {/* Cart & Customer */}
                <div className="cart-section">
                    <div className="cart-scroll-area">
                        {/* Customer Selection - FIRST */}
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
                                            {/* ... (other inputs) */}
                                            <input type="email" placeholder={t('sale.email')} value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                                            <input type="text" placeholder={t('sale.address')} value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Cart Items - SECOND */}
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
                    </div>

                    {/* Total & Submit - ULTRA COMPACT */}
                    <div style={{ padding: '12px', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        {/* Summary - Inline Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                            <span>{t('dashboard.subtotal')}: <strong>{formatCurrency(total)}</strong></span>
                            <span>{t('dashboard.vat')}: <strong>{formatCurrency(vat)}</strong></span>
                            {membershipDiscount > 0 && <span style={{ color: '#27ae60' }}>{t('dashboard.discountLabel')}: <strong>-{formatCurrency(membershipDiscount)}</strong></span>}
                            <span style={{ color: '#e74c3c', fontSize: '14px' }}>{t('dashboard.totalLabel')}: <strong>{formatCurrency(finalTotal)}</strong></span>
                        </div>

                        {/* Points Preview */}
                        {pointsToEarn > 0 && (
                            <div style={{ fontSize: '11px', color: '#856404', background: '#fff9e6', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px', textAlign: 'center' }}>
                                ⭐ {t('dashboard.pointsEarned', { points: pointsToEarn })}
                            </div>
                        )}

                        {/* Payment Method - Horizontal Compact */}
                        <div style={{ marginBottom: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>💳 {t('dashboard.payment')}:</div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    type="button"
                                    className={paymentMethod === 'cash' ? 'active' : ''}
                                    onClick={() => setPaymentMethod('cash')}
                                    style={{
                                        flex: 1,
                                        padding: '6px',
                                        border: paymentMethod === 'cash' ? '2px solid #0d6efd' : '2px solid #dee2e6',
                                        background: paymentMethod === 'cash' ? '#0d6efd' : 'white',
                                        color: paymentMethod === 'cash' ? 'white' : '#333',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    💵 {t('dashboard.cash')}
                                </button>
                                <button
                                    type="button"
                                    className={paymentMethod === 'card' ? 'active' : ''}
                                    onClick={() => setPaymentMethod('card')}
                                    style={{
                                        flex: 1,
                                        padding: '6px',
                                        border: paymentMethod === 'card' ? '2px solid #0d6efd' : '2px solid #dee2e6',
                                        background: paymentMethod === 'card' ? '#0d6efd' : 'white',
                                        color: paymentMethod === 'card' ? 'white' : '#333',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    💳 {t('dashboard.card')}
                                </button>
                                <button
                                    type="button"
                                    className={paymentMethod === 'qr' ? 'active' : ''}
                                    onClick={() => setPaymentMethod('qr')}
                                    style={{
                                        flex: 1,
                                        padding: '6px',
                                        border: paymentMethod === 'qr' ? '2px solid #0d6efd' : '2px solid #dee2e6',
                                        background: paymentMethod === 'qr' ? '#0d6efd' : 'white',
                                        color: paymentMethod === 'qr' ? 'white' : '#333',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    📱 {t('dashboard.qr')}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="btn-create-order"
                            onClick={handleSubmit}
                            disabled={submitting || cart.length === 0}
                            style={{ padding: '10px', fontSize: '14px', marginTop: '0' }}
                        >
                            {submitting ? t('common.loading') : t('sale.confirmOrder')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <Modal
                isOpen={successModal.open}
                onClose={handleCloseModal}
                title={t('sale.orderCreated') || 'Thành công'}
                icon="✅"
                actions={
                    <button className="modal-btn primary" onClick={handleCloseModal}>
                        {t('common.ok') || 'OK'} - {t('dashboard.viewOrder')}
                    </button>
                }
            >
                <p>{t('dashboard.orderCreatedMsg', { id: successModal.orderId })}</p>
                <p>{t('dashboard.totalAmount')}: <strong>{formatCurrency(total)}</strong></p>
            </Modal>

            {/* Draft Found Modal */}
            <Modal
                isOpen={draftModal}
                onClose={discardDraft}
                title={t('dashboard.draftFound')}
                icon="💾"
                actions={
                    <>
                        <button className="modal-btn" onClick={discardDraft} style={{ background: '#999', color: 'white' }}>{t('dashboard.cancel')}</button>
                        <button className="modal-btn primary" onClick={loadDraft}>{t('dashboard.restore')}</button>
                    </>
                }
            >
                <p>{t('dashboard.draftFoundMsg')}</p>
                <p>{t('dashboard.restoreQuestion')}</p>
            </Modal>

            {/* Save Draft Success Modal */}
            <Modal
                isOpen={showDraftSaveSuccess}
                onClose={() => setShowDraftSaveSuccess(false)}
                title={t('dashboard.draftSaved')}
                icon="✅"
                actions={
                    <button className="modal-btn primary" onClick={() => setShowDraftSaveSuccess(false)}>
                        OK
                    </button>
                }
            >
                <p>{t('dashboard.draftSavedMsg')}</p>
                <p>{t('dashboard.draftSavedDetail')}</p>
            </Modal>
        </div>
    );
};

export default NewOrder;
