import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useTranslation } from '../../hooks/useTranslation';
import './Home.css';

const Home = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    // State from URL params
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, total: 0, total_pages: 1 });
    const [filterOptions, setFilterOptions] = useState({ available_materials: [], price_range: { min: 0, max: 0 } });

    // Filter states from URL
    const searchTerm = searchParams.get('search') || '';
    const minPrice = searchParams.get('min_price') || '';
    const maxPrice = searchParams.get('max_price') || '';
    const material = searchParams.get('material') || '';
    const sortBy = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            if (minPrice) params.set('min_price', minPrice);
            if (maxPrice) params.set('max_price', maxPrice);
            if (material) params.set('material', material);
            if (sortBy) params.set('sort', sortBy);
            params.set('page', page.toString());
            params.set('limit', '12');

            const response = await api.get(`/products.php?${params.toString()}`);
            setProducts(response.data.products);
            setPagination(response.data.pagination);
            setFilterOptions(response.data.filters);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, minPrice, maxPrice, material, sortBy, page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        // Reset to page 1 when filters change
        if (key !== 'page') {
            newParams.delete('page');
        }
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    const hasActiveFilters = searchTerm || minPrice || maxPrice || material || sortBy !== 'newest';

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

                    {/* Advanced Filter Bar */}
                    <div className="filter-bar advanced">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder={t('home.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => updateFilter('search', e.target.value)}
                            />
                            {searchTerm && (
                                <button className="clear-search" onClick={() => updateFilter('search', '')}>✕</button>
                            )}
                        </div>

                        <div className="filter-options">
                            {/* Price Range */}
                            <div className="price-range-filter">
                                <input
                                    type="number"
                                    placeholder={t('home.minPrice')}
                                    value={minPrice}
                                    onChange={(e) => updateFilter('min_price', e.target.value)}
                                    className="price-input"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder={t('home.maxPrice')}
                                    value={maxPrice}
                                    onChange={(e) => updateFilter('max_price', e.target.value)}
                                    className="price-input"
                                />
                            </div>

                            {/* Material Filter */}
                            {filterOptions.available_materials.length > 0 && (
                                <select
                                    value={material}
                                    onChange={(e) => updateFilter('material', e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">{t('home.allMaterials')}</option>
                                    {filterOptions.available_materials.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            )}

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => updateFilter('sort', e.target.value)}
                                className="filter-select"
                            >
                                <option value="newest">{t('home.newest')}</option>
                                <option value="price_asc">{t('home.priceLowHigh')}</option>
                                <option value="price_desc">{t('home.priceHighLow')}</option>
                                <option value="name_asc">{t('home.nameAZ')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Results count and clear */}
                    {hasActiveFilters && (
                        <div className="filter-results">
                            <span>{t('home.found')} {pagination.total} {t('common.products')}</span>
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
                    ) : products.length === 0 ? (
                        <div className="no-products">
                            <p>{t('home.noProducts')}</p>
                            <button className="btn-clear-filters" onClick={clearFilters}>
                                {t('common.clearFilters')}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="product-grid">
                                {products.map(product => (
                                    <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                                        <div className="product-image-wrapper">
                                            <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                                            {product.material && (
                                                <span className="product-material">{product.material}</span>
                                            )}
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-name">{product.name}</h3>
                                            <p className="product-price">{parseInt(product.price).toLocaleString()}{t('common.currency')}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.total_pages > 1 && (
                                <div className="pagination">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => updateFilter('page', (page - 1).toString())}
                                    >
                                        ← {t('home.prevPage')}
                                    </button>
                                    <span>{t('home.page')} {page} / {pagination.total_pages}</span>
                                    <button
                                        disabled={page >= pagination.total_pages}
                                        onClick={() => updateFilter('page', (page + 1).toString())}
                                    >
                                        {t('home.nextPage')} →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;

