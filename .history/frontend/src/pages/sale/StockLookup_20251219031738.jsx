import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../../components/Modal';
import './StockLookup.css';

const SaleStockLookup = () => {
    const { t } = useTranslation();
    const [stock, setStock] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [modalData, setModalData] = useState([]);

    // Sharp & Clean SVG Icons
    const Icons = {
        Search: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
        Magic: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>,
        Store: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8"></path></svg>,
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
        if (quantity === 0) return { label: t('stockLookup.outOfStock') || 'Sold Out', class: 'out-of-stock' };
        if (quantity <= 5) return { label: t('stockLookup.criticalStock') || 'Critical', class: 'critical' };
        if (quantity <= 10) return { label: t('stockLookup.lowStock') || 'Low', class: 'warning' };
        return { label: t('stockLookup.goodStock') || 'In Stock', class: 'good' };
    };

    const handleSuggest = (item) => {
        setModalType('suggest');
        // Logic tìm sản phẩm gợi ý (Giả lập hoặc gọi API)
        const candidates = stock.filter(s =>
            s.product_id !== item.product_id &&
            s.quantity_on_hand > 0 &&
            (item.category_id ? s.category_id === item.category_id : true)
        ).slice(0, 3);

        setModalData(candidates);
        setShowModal(true);
    };

    const handleCheckBranch = async (item) => {
        setModalType('branch');
        setModalData([]); 
        setShowModal(true);
        try {
            const res = await api.get(`/sale/stock.php?product_id=${item.product_id}&variant_id=${item.variant_id || 0}`);
            setModalData(res.data);
        } catch (error) { console.error(error); }
    };

    const filteredStock = stock.filter(item => {
        const status = getStockStatus(item.quantity_on_hand);
        return selectedStatus === 'all' || status.class === selectedStatus;
    });

    const stockStats = {
        total: stock.length,
        critical: stock.filter(i => getStockStatus(i.quantity_on_hand).class === 'critical').length,
        warning: stock.filter(i => getStockStatus(i.quantity_on_hand).class === 'warning').length,
        good: stock.filter(i => getStockStatus(i.quantity_on_hand).class === 'good').length,
    };

    return (
        <div className="stock-lookup-page">
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', color: '#2c3e50' }}>📦 {t('stockLookup.title') || 'Stock Lookup'}</h1>
                <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '14px' }}>Check inventory across all branches</p>
            </div>

            {/* Statistics */}
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

            {/* Controls */}
            <div className="stock-controls">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input" style={{ display: 'flex', padding: 0, overflow: 'hidden', alignItems: 'center' }}>
                         <span style={{ paddingLeft: '12px', color: '#999' }}><Icons.Search/></span>
                         <input
                            type="text"
                            placeholder={t('stockLookup.searchPlaceholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ border: 'none', padding: '12px', width: '100%', outline: 'none' }}
                        />
                    </div>
                    <button type="submit" className="search-btn">{t('common.search')}</button>
                </form>

                <div className="status-filter">
                    {['all', 'critical', 'warning', 'good'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${selectedStatus === status ? 'active' : ''}`}
                            onClick={() => setSelectedStatus(status)}
                        >
                            {status === 'all' ? 'All' : 
                             status === 'critical' ? 'Critical' : 
                             status === 'warning' ? 'Low' : 'Good'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="stock-table-wrapper">
                {loading ? <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading inventory...</div> : (
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>{t('stockLookup.product')}</th>
                                <th>{t('stockLookup.variant')}</th>
                                <th style={{textAlign: 'center'}}>{t('stockLookup.stock')}</th>
                                <th>{t('stockLookup.status')}</th>
                                <th style={{textAlign: 'right'}}>{t('stockLookup.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStock.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No products found</td></tr>
                            ) : filteredStock.map((item, idx) => {
                                const status = getStockStatus(item.quantity_on_hand);
                                return (
                                    <tr key={idx}>
                                        <td className="product-cell">
                                            <div className="product-info">
                                                <img src={item.image || 'https://via.placeholder.com/56'} alt="" className="product-image" />
                                                <div>
                                                    <div className="product-name">{item.product_name}</div>
                                                    <span className="product-sku">{item.sku}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="variant-cell">
                                            {item.size ? `${item.size} / ${item.color}` : 'Standard'}
                                        </td>
                                        <td className="quantity-cell">
                                            <span className={`quantity-badge ${status.class}`}>
                                                {item.quantity_on_hand}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${status.class}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td style={{textAlign: 'right'}}>
                                            <div style={{display: 'inline-flex', gap: '8px'}}>
                                                {item.quantity_on_hand === 0 && (
                                                    <button className="btn-action-sm suggest" onClick={() => handleSuggest(item)}>
                                                        <Icons.Magic /> Suggest
                                                    </button>
                                                )}
                                                {(item.quantity_on_hand > 0 && item.quantity_on_hand <= 5) && (
                                                    <button className="btn-action-sm branch" onClick={() => handleCheckBranch(item)}>
                                                        <Icons.Store /> Branches
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            
            <div className="stock-footer">
                Showing {filteredStock.length} of {stock.length} products
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalType === 'suggest' ? "✨ Alternative Suggestions" : "🏢 Stock in Other Branches"}
                icon={modalType === 'suggest' ? '✨' : '🏢'}
                actions={<button className="modal-btn primary" onClick={() => setShowModal(false)}>Close</button>}
            >
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {modalData.length > 0 ? modalData.map((d, i) => (
                         modalType === 'suggest' ? (
                            <div key={i} className="suggestion-item">
                                <img src={d.image || 'https://via.placeholder.com/40'} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} alt="" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{d.product_name}</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>
                                        Stock: <strong style={{ color: '#27ae60' }}>{d.quantity_on_hand}</strong>
                                    </div>
                                </div>
                            </div>
                         ) : (
                            <div key={i} className="branch-item">
                                <div style={{flex: 1}}>
                                    <div style={{ fontWeight: 600, color: '#2c3e50' }}>{d.store_name}</div>
                                    <div style={{ fontSize: '12px', color: '#888' }}>2.5km away</div>
                                </div>
                                <div style={{ fontWeight: 'bold', color: d.quantity_on_hand > 0 ? '#10b981' : '#9ca3af', fontSize: '16px' }}>
                                    {d.quantity_on_hand}
                                </div>
                            </div>
                         )
                    )) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                            {modalType === 'suggest' ? "No similar products available." : "No stock in other branches."}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default SaleStockLookup;