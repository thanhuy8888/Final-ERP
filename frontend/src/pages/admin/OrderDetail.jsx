import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/admin/orders.php?id=${id}`);
            setOrder(response.data);
        } catch (error) {
            console.error("Failed to fetch order", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const updateStatus = async (newStatus) => {
        try {
            await api.post('/admin/orders.php', { id, status: newStatus });
            fetchOrder();
            alert('Cập nhật trạng thái thành công');
        } catch (error) {
            console.error("Failed to update status", error);
            alert('Cập nhật thất bại');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!order) return <div>Không tìm thấy đơn hàng</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>Chi tiết đơn hàng #{id}</h1>
                <button onClick={() => navigate('/admin/orders')} className="btn-primary">← Quay lại</button>
            </div>

            <div className="admin-card">
                <h3>Thông tin khách hàng</h3>
                <p><strong>Tên:</strong> {order.username}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleString('vi-VN')}</p>

                <h3 style={{ marginTop: '20px' }}>Trạng thái đơn hàng</h3>
                <p>Hiện tại: <strong>{order.status}</strong></p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => updateStatus('pending')} className="btn-primary">Pending</button>
                    <button onClick={() => updateStatus('processing')} className="btn-primary">Processing</button>
                    <button onClick={() => updateStatus('completed')} className="btn-primary">Completed</button>
                    <button onClick={() => updateStatus('cancelled')} className="btn-danger">Cancelled</button>
                </div>
            </div>

            <div className="admin-card" style={{ marginTop: '20px' }}>
                <h3>Sản phẩm trong đơn hàng</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Sản phẩm</th>
                            <th>Giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map(item => (
                            <tr key={item.id}>
                                <td><img src={item.image || '/placeholder.jpg'} alt={item.product_name} /></td>
                                <td>{item.product_name}</td>
                                <td>{parseInt(item.price).toLocaleString()}đ</td>
                                <td>{item.quantity}</td>
                                <td>{parseInt(item.price * item.quantity).toLocaleString()}đ</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                    Tổng cộng: {parseInt(order.total_amount).toLocaleString()}đ
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
