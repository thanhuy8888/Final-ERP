import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get('/products.php');
                const found = response.data.find(p => p.id == id);
                setProduct(found);
            } catch (error) {
                console.error("Error fetching product", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const addToCart = async () => {
        try {
            const response = await api.post('/cart.php', {
                action: 'add',
                product_id: product.id,
                quantity: quantity
            });
            if (response.data.success) {
                setMessage('✓ Đã thêm vào giỏ hàng!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error("Add to cart failed", error);
            setMessage('✗ Lỗi khi thêm vào giỏ hàng');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!product) return <div>Sản phẩm không tồn tại</div>;

    return (
        <div className="product-detail-page">
            <Navbar />

            <div className="container">
                <div className="product-detail-grid">
                    <div className="product-image-section">
                        <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                    </div>

                    <div className="product-info-section">
                        <h1 className="product-title">{product.name}</h1>
                        <p className="product-price-large">{parseInt(product.price).toLocaleString()}đ</p>

                        <div className="product-description">
                            <h3>Mô tả sản phẩm</h3>
                            <p>{product.description || 'Sản phẩm chất lượng cao'}</p>
                        </div>

                        <div className="quantity-selector">
                            <label>Số lượng:</label>
                            <div className="quantity-controls">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>

                        <button onClick={addToCart} className="btn-add-to-cart">THÊM VÀO GIỎ</button>
                        {message && <p className={`cart-message ${message.includes('✓') ? 'success' : 'error'}`}>{message}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
