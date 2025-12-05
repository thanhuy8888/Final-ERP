import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log('Fetching products from:', api.defaults.baseURL);
                const response = await api.get('/products.php');
                console.log('Products response:', response.data);
                setProducts(response.data.slice(0, 8));
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch products", error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);


    return (
        <div className="home-page">
            <Navbar />

            <section className="hero-section">
                <div className="hero-content">
                    <h1>THỜI TRANG CHO MỌI NGƯỜI</h1>
                    <p>Khám phá bộ sưu tập mới nhất với chất liệu cao cấp</p>
                    <Link to="/" className="btn-shop-now">MUA NGAY</Link>
                </div>
            </section>

            <section className="products-section">
                <div className="container">
                    <h2 className="section-title">SẢN PHẨM MỚI</h2>

                    <div className="product-grid">
                        {products.map(product => (
                            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                                <div className="product-image-wrapper">
                                    <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-price">{parseInt(product.price).toLocaleString()}đ</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <p>&copy; 2024 CANIFA. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
