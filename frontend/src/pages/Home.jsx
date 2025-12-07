import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products.php');
                setProducts(response.data);
                setFilteredProducts(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch products", error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        let result = [...products];

        // Search filter
        if (searchTerm) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Price filter
        if (priceFilter !== 'all') {
            const price = parseInt(priceFilter);
            if (priceFilter === '500000') {
                result = result.filter(p => parseInt(p.price) < 500000);
            } else if (priceFilter === '500000-1000000') {
                result = result.filter(p => parseInt(p.price) >= 500000 && parseInt(p.price) <= 1000000);
            } else if (priceFilter === '1000000') {
                result = result.filter(p => parseInt(p.price) > 1000000);
            }
        }

        // Sort
        if (sortBy === 'price-low') {
            result.sort((a, b) => parseInt(a.price) - parseInt(b.price));
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => parseInt(b.price) - parseInt(a.price));
        } else if (sortBy === 'name') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }
        // newest is default order from API

        setFilteredProducts(result);
    }, [products, searchTerm, priceFilter, sortBy]);

    const clearFilters = () => {
        setSearchTerm('');
        setPriceFilter('all');
        setSortBy('newest');
    };

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

                    {/* Search and Filter Bar */}
                    <div className="filter-bar">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
                            )}
                        </div>

                        <div className="filter-options">
                            <select
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">Tất cả giá</option>
                                <option value="500000">Dưới 500.000đ</option>
                                <option value="500000-1000000">500.000đ - 1.000.000đ</option>
                                <option value="1000000">Trên 1.000.000đ</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="price-low">Giá thấp → cao</option>
                                <option value="price-high">Giá cao → thấp</option>
                                <option value="name">Tên A-Z</option>
                            </select>
                        </div>
                    </div>

                    {/* Results count */}
                    {(searchTerm || priceFilter !== 'all') && (
                        <div className="filter-results">
                            <span>Tìm thấy {filteredProducts.length} sản phẩm</span>
                            <button className="btn-clear-filters" onClick={clearFilters}>
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Đang tải sản phẩm...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <p>Không tìm thấy sản phẩm nào</p>
                            <button className="btn-clear-filters" onClick={clearFilters}>
                                Xóa bộ lọc
                            </button>
                        </div>
                    ) : (
                        <div className="product-grid">
                            {filteredProducts.map(product => (
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
                    )}
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h3>CANIFA</h3>
                            <p>Thời trang cho mọi người</p>
                        </div>
                        <div className="footer-links">
                            <Link to="/orders">Đơn hàng của tôi</Link>
                            <Link to="/cart">Giỏ hàng</Link>
                        </div>
                    </div>
                    <p className="copyright">&copy; 2024 CANIFA. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
