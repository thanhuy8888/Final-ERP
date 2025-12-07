import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders.php');
            setOrders(response.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetail = async (orderId) => {
        try {
            const response = await api.get(`/orders.php?id=${orderId}`);
            setSelectedOrder(response.data);
        } catch (error) {
            console.error("Failed to fetch order", error);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { label: 'Chờ xử lý', class: 'pending' },
            processing: { label: 'Đang xử lý', class: 'processing' },
            shipped: { label: 'Đang giao', class: 'shipped' },
            completed: { label: 'Hoàn thành', class: 'completed' },
            cancelled: { label: 'Đã hủy', class: 'cancelled' }
        };
        const s = statusMap[status] || { label: status, class: 'pending' };
        return <span className={`status-badge ${s.class}`}>{s.label}</span>;
    };

    if (!user) {
        return (
            <div className="orders-page">
                <Navbar />
                <div className="orders-container">
                    <div className="login-required">
                        <h2>🔐 Vui lòng đăng nhập</h2>
                        <p>Đăng nhập để xem lịch sử đơn hàng</p>
                        <Link to="/login" className="btn-login">Đăng nhập ngay</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="orders-page">
                <Navbar />
                <div className="orders-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <Navbar />

            <div className="orders-container">
                <h1>📦 Lịch sử đơn hàng</h1>

                {orders.length === 0 ? (
                    <div className="orders-empty">
                        <div className="empty-icon">📦</div>
                        <h2>Chưa có đơn hàng nào</h2>
                        <p>Hãy bắt đầu mua sắm ngay!</p>
                        <Link to="/" className="btn-shop">Mua sắm ngay</Link>
                    </div>
                ) : (
                    <div className="orders-content">
                        <div className="orders-list">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    className={`order-card ${selectedOrder?.id === order.id ? 'active' : ''}`}
                                    onClick={() => fetchOrderDetail(order.id)}
                                >
                                    <div className="order-header">
                                        <span className="order-id">Đơn hàng #{order.id}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div className="order-info">
                                        <p className="order-date">
                                            📅 {new Date(order.created_at).toLocaleDateString('vi-VN', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p className="order-items-count">{order.item_count} sản phẩm</p>
                                    </div>
                                    <div className="order-total">
                                        {parseInt(order.total_amount).toLocaleString()}đ
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-detail-panel">
                            {selectedOrder ? (
                                <>
                                    <div className="detail-header">
                                        <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                                        {getStatusBadge(selectedOrder.status)}
                                    </div>

                                    <div className="detail-items">
                                        <h3>Sản phẩm</h3>
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="detail-item">
                                                <img src={item.product_image || '/placeholder.jpg'} alt={item.product_name} />
                                                <div className="item-info">
                                                    <span className="item-name">{item.product_name}</span>
                                                    <span className="item-qty">Số lượng: {item.quantity}</span>
                                                </div>
                                                <span className="item-price">
                                                    {(parseInt(item.price) * item.quantity).toLocaleString()}đ
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="detail-summary">
                                        <div className="summary-row">
                                            <span>Phương thức thanh toán</span>
                                            <span>{selectedOrder.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Tổng cộng</span>
                                            <span>{parseInt(selectedOrder.total_amount).toLocaleString()}đ</span>
                                        </div>
                                    </div>

                                    {selectedOrder.notes && (
                                        <div className="detail-notes">
                                            <h3>Ghi chú</h3>
                                            <p>{selectedOrder.notes}</p>
                                        </div>
                                    )}

                                    <button
                                        className="btn-invoice"
                                        onClick={() => window.open(`http://localhost/Final-ERP/api/invoice.php?order_id=${selectedOrder.id}`, '_blank')}
                                    >
                                        🧾 Xem & In hóa đơn
                                    </button>
                                </>
                            ) : (
                                <div className="no-selection">
                                    <p>👈 Chọn đơn hàng để xem chi tiết</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
