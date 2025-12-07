import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [], total_price: 0 });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address: '',
        city: '',
        notes: '',
        payment_method: 'cod'
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart.php');
            setCart(response.data);
            if (response.data.items?.length === 0) {
                navigate('/cart');
            }
        } catch (error) {
            console.error("Failed to fetch cart", error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.full_name.trim()) newErrors.full_name = 'Vui lòng nhập họ tên';
        if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
        if (!/^[0-9]{10,11}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ';
        if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
        if (!formData.city.trim()) newErrors.city = 'Vui lòng chọn tỉnh/thành';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setProcessing(true);
        try {
            const response = await api.post('/checkout.php', formData);
            if (response.data.success) {
                setOrderSuccess(response.data);
            }
        } catch (error) {
            setErrors({ submit: error.response?.data?.error || 'Có lỗi xảy ra khi đặt hàng' });
        } finally {
            setProcessing(false);
        }
    };

    if (!user) {
        return (
            <div className="checkout-page">
                <Navbar />
                <div className="checkout-container">
                    <div className="login-required">
                        <h2>🔐 Vui lòng đăng nhập</h2>
                        <p>Bạn cần đăng nhập để tiến hành thanh toán</p>
                        <Link to="/login" className="btn-login">Đăng nhập ngay</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="checkout-page">
                <Navbar />
                <div className="checkout-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    if (orderSuccess) {
        return (
            <div className="checkout-page">
                <Navbar />
                <div className="checkout-container">
                    <div className="order-success">
                        <div className="success-icon">✓</div>
                        <h2>Đặt hàng thành công!</h2>
                        <p>Mã đơn hàng: <strong>#{orderSuccess.order_id}</strong></p>
                        <p>Cảm ơn bạn đã mua sắm tại CANIFA</p>
                        <div className="success-actions">
                            <Link to="/orders" className="btn-view-orders">Xem đơn hàng</Link>
                            <Link to="/" className="btn-continue">Tiếp tục mua sắm</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <Navbar />

            <div className="checkout-container">
                <h1>Thanh toán</h1>

                <div className="checkout-content">
                    <div className="checkout-form-section">
                        <h2>📦 Thông tin giao hàng</h2>

                        {errors.submit && <div className="error-banner">{errors.submit}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Họ và tên *</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="Nguyễn Văn A"
                                        className={errors.full_name ? 'error' : ''}
                                    />
                                    {errors.full_name && <span className="field-error">{errors.full_name}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Số điện thoại *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="0901234567"
                                        className={errors.phone ? 'error' : ''}
                                    />
                                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ *</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Số nhà, tên đường, phường/xã"
                                    className={errors.address ? 'error' : ''}
                                />
                                {errors.address && <span className="field-error">{errors.address}</span>}
                            </div>

                            <div className="form-group">
                                <label>Tỉnh/Thành phố *</label>
                                <select
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className={errors.city ? 'error' : ''}
                                >
                                    <option value="">-- Chọn tỉnh/thành --</option>
                                    <option value="Hà Nội">Hà Nội</option>
                                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                    <option value="Đà Nẵng">Đà Nẵng</option>
                                    <option value="Hải Phòng">Hải Phòng</option>
                                    <option value="Cần Thơ">Cần Thơ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                                {errors.city && <span className="field-error">{errors.city}</span>}
                            </div>

                            <div className="form-group">
                                <label>Ghi chú</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Ghi chú cho người giao hàng..."
                                    rows="3"
                                />
                            </div>

                            <h2>💳 Phương thức thanh toán</h2>

                            <div className="payment-methods">
                                <label className={`payment-option ${formData.payment_method === 'cod' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={formData.payment_method === 'cod'}
                                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                    />
                                    <span className="payment-icon">💵</span>
                                    <div>
                                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                                        <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                                    </div>
                                </label>

                                <label className={`payment-option ${formData.payment_method === 'bank' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bank"
                                        checked={formData.payment_method === 'bank'}
                                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                    />
                                    <span className="payment-icon">🏦</span>
                                    <div>
                                        <strong>Chuyển khoản ngân hàng</strong>
                                        <p>Chuyển khoản trước khi giao hàng</p>
                                    </div>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn-place-order"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="spinner"></span>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        Đặt hàng - {parseInt(cart.total_price).toLocaleString()}đ
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="order-summary-section">
                        <h2>🛒 Đơn hàng của bạn</h2>

                        <div className="order-items">
                            {cart.items?.map(item => (
                                <div key={item.id} className="order-item">
                                    <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                                    <div className="item-info">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-qty">x{item.quantity}</span>
                                    </div>
                                    <span className="item-price">{parseInt(item.subtotal).toLocaleString()}đ</span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Tạm tính</span>
                                <span>{parseInt(cart.total_price).toLocaleString()}đ</span>
                            </div>
                            <div className="summary-row">
                                <span>Phí vận chuyển</span>
                                <span className="free">Miễn phí</span>
                            </div>
                            <div className="summary-row total">
                                <span>Tổng cộng</span>
                                <span>{parseInt(cart.total_price).toLocaleString()}đ</span>
                            </div>
                        </div>

                        <Link to="/cart" className="btn-back-cart">← Quay lại giỏ hàng</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
