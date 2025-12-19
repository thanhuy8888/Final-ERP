import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../../components/Modal'; // Import Modal
import './StockLookup.css';

const SaleStockLookup = () => {
    const { t } = useTranslation();
    const [stock, setStock] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Action Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null); // 'suggest' or 'branch'
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalData, setModalData] = useState([]);

    // SVG Icons
    const Icons = {
        Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
        Magic: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4M3 5h4" /></svg>,
        Store: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8" /></svg>,
        Box: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" /></svg>
    };

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async (query = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/sale/stock.php?search=${encodeURIComponent(query)}`);
            setStock(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchStock(search);
    };

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { label: t('stockLookup.outOfStock'), class: 'out-of-stock' };
        if (quantity <= 5) return { label: t('stockLookup.criticalStock'), class: 'critical' };
        if (quantity <= 10) return { label: t('stockLookup.lowStock'), class: 'warning' };
        return { label: t('stockLookup.goodStock'), class: 'good' };
    };

    // --- Action Logic ---
    const handleSuggest = (item) => {
        setSelectedItem(item);
        setModalType('suggest');

        // Find candidates: Same Category, In Stock, Different Product ID (exclude self)
        const candidates = stock.filter(s =>
            s.product_id !== item.product_id &&
            s.quantity_on_hand > 0 &&
            (item.category_id ? s.category_id === item.category_id : true)
        );

        // Deduplicate: Keep only one variant per Product ID
        const uniqueSuggestions = [];
        const seenProductIds = new Set();

        for (const candidate of candidates) {
            // Use product_id as key, fallback to name if missing (though should be present)
            const key = candidate.product_id || candidate.product_name;

            if (!seenProductIds.has(key)) {
                seenProductIds.add(key);
                uniqueSuggestions.push(candidate);
                if (uniqueSuggestions.length >= 3) break; // Limit to 3 unique products
            }
        }

        setModalData(uniqueSuggestions);
        setShowModal(true);
    };

    const handleCheckBranch = async (item) => {
        setSelectedItem(item);
        setModalType('branch');
        setModalData([]); // clear previous data
        setShowModal(true);

        try {
            // Fetch real data from backend
            const res = await api.get(`/sale/stock.php?product_id=${item.product_id}&variant_id=${item.variant_id || 0}`);
            setModalData(res.data);
        } catch (error) {
            console.error("Error fetching branch stock:", error);
            // Optionally handle error state here
        }
    };
    // --------------------

    const filteredStock = stock.filter(item => {
        const status = getStockStatus(item.quantity_on_hand);
        if (selectedStatus === 'all') return true;
        return status.class === selectedStatus;
    });

    const stockStats = {
        total: stock.length,
        critical: stock.filter(i => getStockStatus(i.quantity_on_hand).class === 'critical').length,
        warning: stock.filter(i => getStockStatus(i.quantity_on_hand).class === 'warning').length,
        good: stock.filter(i => getStockStatus(i.quantity_on_hand).class === 'good').length,
        outOfStock: stock.filter(i => i.quantity_on_hand === 0).length,
    };

    return (
        <div className="stock-lookup-page">

            {/* Stock Statistics */}
            <div className="stock-stats-grid">
                <div className="stat-card">
                    <div className="stat-label">{t('stockLookup.totalSKU')}</div>
                    <div className="stat-value">{stockStats.total}</div>
                </div>
                <div className="stat-card critical-stat">
                    <div className="stat-label">{t('stockLookup.criticalStock')}</div>
                    <div className="stat-value">{stockStats.critical}</div>
                </div>
                <div className="stat-card warning-stat">
                    <div className="stat-label">{t('stockLookup.lowStock')}</div>
                    <div className="stat-value">{stockStats.warning}</div>
                </div>
                <div className="stat-card good-stat">
                    <div className="stat-label">{t('stockLookup.goodStock')}</div>
                    <div className="stat-value">{stockStats.good}</div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="stock-controls">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder={t('stockLookup.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">
                        <Icons.Search /> {t('common.search')}
                    </button>
                </form>

                <div className="status-filter">
                    {['all', 'critical', 'warning', 'good'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${selectedStatus === status ? 'active' : ''}`}
                            onClick={() => setSelectedStatus(status)}
                        >
                            {status === 'all' ? t('stockLookup.allStatus') :
                                status === 'critical' ? t('stockLookup.criticalStock') :
                                    status === 'warning' ? t('stockLookup.lowStock') : t('stockLookup.goodStock')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stock Table */}
            <div className="stock-table-wrapper">
                {loading ? (
                    <div className="loading-state">{t('common.loading')}</div>
                ) : (
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>{t('stockLookup.store')}</th>
                                <th>{t('stockLookup.product')}</th>
                                <th>{t('stockLookup.variant')}</th>
                                <th>{t('stockLookup.stock')}</th>
                                <th>{t('stockLookup.status')}</th>
                                <th>{t('stockLookup.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStock.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-results">
                                        {t('stockLookup.noProductsFound') || t('dashboard.noProductsFound')}
                                    </td>
                                </tr>
                            ) : (
                                filteredStock.map((item, idx) => {
                                    const status = getStockStatus(item.quantity_on_hand);
                                    return (
                                        <tr key={idx} className={`stock-row ${status.class}`}>
                                            <td className="store-cell">{item.store_name}</td>
                                            <td className="product-cell">
                                                <div className="product-info">
                                                    <img
                                                        src={item.image || '/placeholder.jpg'}
                                                        alt=""
                                                        className="product-image"
                                                    />
                                                    <div className="product-details">
                                                        <div className="product-name">{item.product_name}</div>
                                                        <div className="product-sku">{item.sku}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="variant-cell">
                                                {item.size ? `${item.size} / ${item.color}` : 'Standard'}
                                                {item.variant_sku && (
                                                    <div className="variant-sku">{item.variant_sku}</div>
                                                )}
                                            </td>
                                            <td className="quantity-cell">
                                                <span className={`quantity-badge ${status.class}`}>
                                                    {item.quantity_on_hand}
                                                </span>
                                            </td>
                                            <td className="status-cell">
                                                <span className={`status-badge ${status.class}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="action-cell">
                                                <div className="action-wrapper">
                                                    {item.quantity_on_hand === 0 && (
                                                        <button
                                                            className="btn-action-sm suggest"
                                                            onClick={() => handleSuggest(item)}
                                                            title={t('stockLookup.suggest')}
                                                        >
                                                            <Icons.Magic /> {t('stockLookup.suggest')}
                                                        </button>
                                                    )}
                                                    {(item.quantity_on_hand > 0 && item.quantity_on_hand <= 5) && (
                                                        <button
                                                            className="btn-action-sm branch"
                                                            onClick={() => handleCheckBranch(item)}
                                                            title={t('stockLookup.findBranch')}
                                                        >
                                                            <Icons.Store /> {t('stockLookup.findBranch')}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="stock-footer">
                <p>{t('stockLookup.showing', { count: filteredStock.length, total: stock.length })}</p>
            </div>

            {/* Action Modals */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalType === 'suggest' ? t('stockLookup.suggestTitle') : t('stockLookup.branchTitle')}
                icon={modalType === 'suggest' ? '✨' : '🏢'}
                actions={
                    <button className="modal-btn primary" onClick={() => setShowModal(false)}>{t('stockLookup.close')}</button>
                }
            >
                {modalType === 'suggest' ? (
                    <div className="suggestion-list">
                        <p>{t('stockLookup.suggestMsg')}</p>
                        {modalData.length > 0 ? (
                            <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                                {modalData.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px', border: '1px solid #eee', padding: '8px', borderRadius: '6px' }}>
                                        <img src={s.image || '/placeholder.jpg'} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '4px' }} alt="" />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{s.product_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                {s.size} / {s.color} - <span dangerouslySetInnerHTML={{ __html: t('stockLookup.inStock', { count: s.quantity_on_hand }) }}></span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (<p style={{ color: '#999', fontStyle: 'italic' }}>{t('stockLookup.noSuggestion')}</p>)}
                    </div>
                ) : (
                    <div className="branch-list">
                        <p dangerouslySetInnerHTML={{ __html: t('stockLookup.branchMsg') }}></p>
                        <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                            {modalData.length > 0 ? modalData.map((b, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8f9fa', borderRadius: '6px' }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{b.store_name}</div>
                                        {/* Distance is not available in backend yet */}
                                        {/* <div style={{ fontSize: '0.8rem', color: '#666' }}>Cách đây {b.distance}</div> */}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: b.quantity_on_hand > 0 ? '#27ae60' : '#999' }}>
                                            {b.quantity_on_hand > 0 ? t('stockLookup.inStock', { count: b.quantity_on_hand }) : t('stockLookup.soldOut')}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: '#999', fontStyle: 'italic' }}>{t('stockLookup.noBranchData')}</p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SaleStockLookup;
