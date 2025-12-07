import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import './Home.css';

const Home = () => {
    const { t } = useTranslation();
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
                    <h1>{t('home.heroTitle')}</h1>
                    <p>{t('home.heroSubtitle')}</p>
                    <Link to="/" className="btn-shop-now">{t('home.shopNow')}</Link>
                </div>
            </section>

            <section className="products-section">
                <div className="container">
                    <h2 className="section-title">{t('home.newProducts')}</h2>

                    {/* Search and Filter Bar */}
                    <div className="filter-bar">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder={t('home.searchPlaceholder')}
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
                                <option value="all">{t('home.allPrices')}</option>
                                <option value="500000">{t('home.under500k')}</option>
                                <option value="500000-1000000">{t('home.500kTo1m')}</option>
                                <option value="1000000">{t('home.over1m')}</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="newest">{t('home.newest')}</option>
                                <option value="price-low">{t('home.priceLowHigh')}</option>
                                <option value="price-high">{t('home.priceHighLow')}</option>
                                <option value="name">{t('home.nameAZ')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Results count */}
                    {(searchTerm || priceFilter !== 'all') && (
                        <div className="filter-results">
                            <span>{t('home.found')} {filteredProducts.length} {t('common.products')}</span>
                            <button className="btn-clear-filters" onClick={clearFilters}>
                                {t('common.clearFilters')}
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>{t('home.loadingProducts')}</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <p>{t('home.noProducts')}</p>
                            <button className="btn-clear-filters" onClick={clearFilters}>
                                {t('common.clearFilters')}
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
                                        <p className="product-price">{parseInt(product.price).toLocaleString()}{t('common.currency')}</p>
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
                            <p>{t('home.footerSlogan')}</p>
                        </div>
                        <div className="footer-links">
                            <Link to="/orders">{t('home.myOrders')}</Link>
                            <Link to="/cart">{t('navbar.cart')}</Link>
                        </div>
                    </div>
                    <p className="copyright">&copy; 2024 CANIFA. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
