import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const Cart = () => {
    const [cart, setCart] = useState({ items: [], total_price: 0, count: 0 });
    const [loading, setLoading] = useState(true);

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
        try {
            if (newQuantity < 1) return; // Or handle remove
            await api.post('/cart.php', {
                action: 'update',
                product_id: productId,
                quantity: newQuantity
            });
            fetchCart();
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const removeItem = async (productId) => {
        try {
            await api.post('/cart.php', {
                action: 'remove',
                product_id: productId
            });
            fetchCart();
        } catch (error) {
            console.error("Remove failed", error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="cart-container">
            <h1>Giỏ hàng</h1>
            {cart.items.length === 0 ? (
                <p>Giỏ hàng trống. <Link to="/">Mua sắm ngay</Link></p>
            ) : (
                <>
                    <table className="cart-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Giá</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.items.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="cart-item-info">
                                            <img src={item.image || '/placeholder.jpg'} alt={item.name} width="50" />
                                            <span>{item.name}</span>
                                        </div>
                                    </td>
                                    <td>{parseInt(item.price).toLocaleString()}đ</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                        />
                                    </td>
                                    <td>{parseInt(item.subtotal).toLocaleString()}đ</td>
                                    <td>
                                        <button onClick={() => removeItem(item.id)}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="cart-summary">
                        <h3>Tổng cộng: {parseInt(cart.total_price).toLocaleString()}đ</h3>
                        <button className="checkout-btn">Thanh toán (Chưa làm)</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
