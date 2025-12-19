import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../api/axios";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTranslation } from "../../hooks/useTranslation";
import "./Home.css";

const Home = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const priceTrackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(null); // 'min' or 'max'

  // State from URL params
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    total_pages: 1,
  });
  const [filterOptions, setFilterOptions] = useState({
    available_materials: [],
    price_range: { min: 0, max: 0 },
  });

  // Filter states from URL
  const searchTerm = searchParams.get("search") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const material = searchParams.get("material") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (minPrice) params.set("min_price", minPrice);
      if (maxPrice) params.set("max_price", maxPrice);
      if (material) params.set("material", material);
      if (sortBy) params.set("sort", sortBy);
      params.set("page", page.toString());
      params.set("limit", "12");

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

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Observe elements
    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [products]);

  // Price Range Slider Handlers
  const handlePriceSliderMouseDown = (type) => {
    setIsDragging(type);
  };

  const handlePriceSliderMouseMove = useCallback(
    (e) => {
      if (!isDragging || !priceTrackRef.current) return;

      const rect = priceTrackRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)
      );

      const priceMin = filterOptions.price_range.min || 0;
      const priceMax = filterOptions.price_range.max || 5000;
      const newPrice = Math.round(
        (percent / 100) * (priceMax - priceMin) + priceMin
      );

      if (isDragging === "min" && newPrice < (parseInt(maxPrice) || priceMax)) {
        updateFilter("min_price", newPrice.toString());
      } else if (
        isDragging === "max" &&
        newPrice > (parseInt(minPrice) || priceMin)
      ) {
        updateFilter("max_price", newPrice.toString());
      }
    },
    [isDragging, minPrice, maxPrice, filterOptions.price_range]
  );

  const handlePriceSliderMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handlePriceSliderMouseMove);
      window.addEventListener("mouseup", handlePriceSliderMouseUp);
      return () => {
        window.removeEventListener("mousemove", handlePriceSliderMouseMove);
        window.removeEventListener("mouseup", handlePriceSliderMouseUp);
      };
    }
  }, [isDragging, handlePriceSliderMouseMove]);

  // Calculate thumb positions
  const calculateThumbPosition = (value, type) => {
    const priceMin = filterOptions.price_range.min || 0;
    const priceMax = filterOptions.price_range.max || 5000;
    const currentValue =
      parseInt(value) || (type === "min" ? priceMin : priceMax);
    return ((currentValue - priceMin) / (priceMax - priceMin)) * 100;
  };

  const minThumbPosition = calculateThumbPosition(minPrice, "min");
  const maxThumbPosition = calculateThumbPosition(maxPrice, "max");

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when filters change
    if (key !== "page") {
      newParams.delete("page");
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm || minPrice || maxPrice || material || sortBy !== "newest";

  return (
    <div className="home-page">
      <Navbar />

      {/* Floating Decorative Elements */}
      <div className="decorative-shapes">
        <div
          className="shape shape-1"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div
          className="shape shape-2"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        ></div>
        <div
          className="shape shape-3"
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        ></div>
      </div>
      <section className="hero-section" ref={heroRef}>
        {/* Animated Background Blobs */}
        <div className="hero-background-animation">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge animate-on-scroll">
              <span className="badge-icon">✨</span>
              <span className="badge-text">New Collection 2025</span>
            </div>

            <h1 className="hero-title">
              <span className="title-line animate-on-scroll">
                Discover Your
              </span>
              <span className="title-line title-highlight animate-on-scroll">
                Perfect Style
              </span>
              <span className="title-emoji">🛍️</span>
            </h1>

            <p className="hero-description animate-on-scroll">
              {t("home.heroSubtitle") ||
                "Explore our curated collection of premium products designed for modern living"}
            </p>

            <ul className="hero-features animate-on-scroll">
              <li>
                <span className="feature-icon">✓</span> Premium Quality
                Guaranteed
              </li>
              <li>
                <span className="feature-icon">✓</span> Free Shipping Worldwide
              </li>
              <li>
                <span className="feature-icon">✓</span> 30-Day Easy Returns
              </li>
            </ul>

            <div className="hero-cta-group animate-on-scroll">
              <Link to="/" className="btn-shop-now btn-primary-animated">
                <span>{t("home.shopNow") || "Shop Now"}</span>
                <span className="btn-arrow">→</span>
              </Link>
              <a href="#products" className="btn-explore">
                <span>Explore Collection</span>
              </a>
            </div>

            <div className="hero-trust-indicators animate-on-scroll">
              <div className="trust-item">
                <span className="trust-icon">⭐</span>
                <span className="trust-text">4.9/5 Rating</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">👥</span>
                <span className="trust-text">50K+ Customers</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🏆</span>
                <span className="trust-text">Award Winner</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-wrapper animate-on-scroll">
              <div className="image-decoration decoration-1"></div>
              <div className="image-decoration decoration-2"></div>
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=900&fit=crop"
                alt="Featured Products"
                className="hero-main-image"
              />

              {/* Floating Stats Cards */}
              <div className="floating-stats" ref={statsRef}>
                <div className="stat-card stat-card-1">
                  <div className="stat-icon">🔥</div>
                  <div className="stat-number">2.5K+</div>
                  <div className="stat-label">Products</div>
                </div>
                <div className="stat-card stat-card-2">
                  <div className="stat-icon">💯</div>
                  <div className="stat-number">98%</div>
                  <div className="stat-label">Satisfaction</div>
                </div>
                <div className="stat-card stat-card-3">
                  <div className="stat-icon">⚡</div>
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section animate-on-scroll">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon-large">🚚</span>
              </div>
              <h3>Fast Delivery</h3>
              <p>Get your orders delivered within 2-3 business days</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon-large">🔒</span>
              </div>
              <h3>Secure Payment</h3>
              <p>100% secure transactions with encrypted checkout</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon-large">💝</span>
              </div>
              <h3>Gift Wrapping</h3>
              <p>Free premium gift wrapping on all orders</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon-large">🎯</span>
              </div>
              <h3>Quality First</h3>
              <p>Handpicked products with quality guarantee</p>
            </div>
          </div>
        </div>
      </section>

      <section className="products-section">
        <div className="container">
          <div className="products-layout">
            {/* Sidebar Filters */}
            <aside className="filters-sidebar">
              {/* Price Range Filter */}
              <div className="filter-group">
                <div className="filter-group-header">
                  <h3 className="filter-group-title">Price Range</h3>
                  <button
                    className="filter-reset-btn"
                    onClick={() => {
                      updateFilter("min_price", "");
                      updateFilter("max_price", "");
                    }}
                  >
                    Reset
                  </button>
                </div>
                <p className="filter-group-subtitle">
                  The average price is ${filterOptions.price_range.max || 3300}
                </p>
                <div className="price-range-slider">
                  {/* Price Chart Visualization */}
                  <div className="price-chart">
                    <svg viewBox="0 0 200 60" className="price-chart-svg">
                      <defs>
                        <linearGradient
                          id="priceGradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            style={{ stopColor: "#7C5CFC", stopOpacity: 0.8 }}
                          />
                          <stop
                            offset="100%"
                            style={{ stopColor: "#7C5CFC", stopOpacity: 0.1 }}
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0,45 Q 25,30 50,35 T 100,30 T 150,40 T 200,35 L 200,60 L 0,60 Z"
                        fill="url(#priceGradient)"
                      />
                      <path
                        d="M 0,45 Q 25,30 50,35 T 100,30 T 150,40 T 200,35"
                        fill="none"
                        stroke="#7C5CFC"
                        strokeWidth="2"
                      />
                    </svg>
                    <div className="price-markers">
                      <span className="price-marker price-marker-min">
                        ${minPrice || filterOptions.price_range.min || 20}
                      </span>
                      <span className="price-marker price-marker-max">
                        ${maxPrice || filterOptions.price_range.max || 1130}
                      </span>
                    </div>
                  </div>

                  {/* Slider Bar */}
                  <div className="price-range-bar">
                    <div className="price-range-track" ref={priceTrackRef}>
                      <div
                        className="price-range-fill"
                        style={{
                          left: `${minThumbPosition}%`,
                          width: `${maxThumbPosition - minThumbPosition}%`,
                        }}
                      ></div>
                      <div
                        className="price-thumb price-thumb-min"
                        style={{ left: `${minThumbPosition}%` }}
                        onMouseDown={() => handlePriceSliderMouseDown("min")}
                      ></div>
                      <div
                        className="price-thumb price-thumb-max"
                        style={{ left: `${maxThumbPosition}%` }}
                        onMouseDown={() => handlePriceSliderMouseDown("max")}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Star Rating Filter */}
              <div className="filter-group">
                <h3 className="filter-group-title">Star Rating</h3>
                <div className="rating-filters">
                  <label className="rating-option">
                    <input type="checkbox" />
                    <span className="rating-stars">★★★★★</span>
                    <span className="rating-label">4 Stars & up</span>
                  </label>
                </div>
              </div>

              {/* Material/Brand Filter */}
              {filterOptions.available_materials.length > 0 && (
                <div className="filter-group">
                  <h3 className="filter-group-title">Material</h3>
                  <button className="filter-reset-btn">Reset</button>
                  <div className="brand-filters">
                    {filterOptions.available_materials
                      .slice(0, 7)
                      .map((mat, index) => (
                        <label key={mat} className="brand-option">
                          <input
                            type="checkbox"
                            checked={material === mat}
                            onChange={(e) =>
                              updateFilter(
                                "material",
                                e.target.checked ? mat : ""
                              )
                            }
                          />
                          <span className="brand-icon">▲</span>
                          <span className="brand-name">{mat}</span>
                        </label>
                      ))}
                    {filterOptions.available_materials.length > 7 && (
                      <button className="more-brands-btn">More Material</button>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Options */}
              <div className="filter-group">
                <h3 className="filter-group-title">Delivery Options</h3>
                <div className="delivery-options">
                  <button
                    className={`delivery-btn ${
                      sortBy === "newest" ? "active" : ""
                    }`}
                    onClick={() => updateFilter("sort", "newest")}
                  >
                    Standard
                  </button>
                  <button className="delivery-btn">Pick Up</button>
                </div>
              </div>
            </aside>

            {/* Products Main Content */}
            <div className="products-main-content">
              {/* Search and Sort Bar */}
              <div className="products-top-bar">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="search-input-main"
                />
                <span className="search-icon-main">🔍</span>
              </div>

              {/* Active Filters Badge */}
              {hasActiveFilters && (
                <div className="active-filters-badge">
                  <span>🎯 {pagination.total} Products Found</span>
                  <button
                    onClick={clearFilters}
                    className="btn-clear-filters-top"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>{t("home.loadingProducts")}</p>
                </div>
              ) : products.length === 0 ? (
                <div className="no-products">
                  <p>{t("home.noProducts")}</p>
                  <button className="btn-clear-filters" onClick={clearFilters}>
                    {t("common.clearFilters")}
                  </button>
                </div>
              ) : (
                <>
                  <div className="product-grid">
                    {products.map((product, index) => (
                      <Link
                        to={`/product/${product.id}`}
                        key={product.id}
                        className="product-card animate-on-scroll"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="product-image-wrapper">
                          <div className="product-overlay">
                            <span className="quick-view-btn">Quick View</span>
                          </div>
                          <img
                            src={product.image || "/placeholder.jpg"}
                            alt={product.name}
                          />
                          {product.material && (
                            <span className="product-badge product-material">
                              {product.material}
                            </span>
                          )}
                          <div className="product-actions">
                            <button
                              className="action-btn"
                              title="Add to Wishlist"
                            >
                              <span>♥</span>
                            </button>
                            <button className="action-btn" title="Quick View">
                              <span>👁</span>
                            </button>
                          </div>
                        </div>
                        <div className="product-info">
                          <div className="product-rating">
                            <span className="stars">★★★★★</span>
                            <span className="rating-count">(4.8)</span>
                          </div>
                          <h3 className="product-name">{product.name}</h3>
                          <div className="product-price-wrapper">
                            <p className="product-price">
                              {parseInt(product.price).toLocaleString()}
                              {t("common.currency")}
                            </p>
                            <span className="product-stock">In Stock</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.total_pages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() =>
                          updateFilter("page", (page - 1).toString())
                        }
                        disabled={page === 1}
                      >
                        Previous
                      </button>
                      <span>
                        {t("home.page")} {page} / {pagination.total_pages}
                      </span>
                      <button
                        onClick={() =>
                          updateFilter("page", (page + 1).toString())
                        }
                        disabled={page === pagination.total_pages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
