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

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [modalData, setModalData] = useState([]);

    // SVG Icons
    const Icons = {
        Search: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>,
        Box: () => <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
        Alert: () => <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
        Warning: () => <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
        Check: () => <svg width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
        Magic: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>,
        Store: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8"></path></svg>
    };

    useEffect(() => { fetchStock(); }, []);

    const fetchStock = async (query = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/sale/stock.php?search=${encodeURIComponent(query)}`);
            setStock(res.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); fetchStock(search); };

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { label: 'Sold Out', class: 'out-of-stock' };
        if (quantity <= 5) return { label: 'Critical', class: 'critical' };
        if (quantity <= 10) return { label: 'Low Stock', class: 'warning' };
        return { label: 'In Stock', class: 'good' };
    };

    const handleSuggest = (item) => {
        setModalType('suggest');
        const candidates = stock.filter(s => s.product_id !== item.product_id && s.quantity_on_hand > 0).slice(0, 3);
        setModalData(candidates);
        setShowModal(true);
    };

    const handleCheckBranch = async (item) => {
        setModalType('branch'); setModalData([]); setShowModal(true);
        try {
            const res = await api.get(`/sale/stock.php?product_id=${item.product_id}`);
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
            <div className="page-header">
                <h1>📦 Stock Lookup</h1>
                <p>Real-time inventory check across system</p>
            </div>

            {/* COLORFUL STATS GRID */}
            <div className="stock-stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon-box"><Icons.Box /></div>
                    <div className="stat-content">
                        <div className="stat-label">Total Items</div>
                        <div className="stat-value">{stockStats.total}</div>
                    </div>
                </div>
                <div className="stat-card critical">
                    <div className="stat-icon-box"><Icons.Alert /></div>
                    <div className="stat-content">
                        <div className="stat-label">Critical</div>
                        <div className="stat-value">{stockStats.critical}</div>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon-box"><Icons.Warning /></div>
                    <div className="stat-content">
                        <div className="stat-label">Low Stock</div>
                        <div className="stat-value">{stockStats.warning}</div>
                    </div>
                </div>
                <div className="stat-card good">
                    <div className="stat-icon-box"><Icons.Check /></div>
                    <div className="stat-content">
                        <div className="stat-label">Good Stock</div>
                        <div className="stat-value">{stockStats.good}</div>
                    </div>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="stock-controls">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input" style={{display: 'flex', alignItems: 'center', paddingLeft: '16px', width: '100%'}}>
                        <span style={{color: '#9CA3AF'}}><Icons.Search /></span>
                        <input type="text" placeholder="Search by name, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button type="submit" className="search-btn">Search</button>
                </form>
                <div className="status-filter">
                    {['all', 'critical', 'warning', 'good'].map(s => (
                        <button key={s} className={`filter-btn ${selectedStatus === s ? 'active' : ''}`} onClick={() => setSelectedStatus(s)}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* FULL WIDTH TABLE */}
            <div className="stock-table-wrapper">
                {loading ? <div style={{padding: '50px', textAlign: 'center'}}>Loading...</div> : (
                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Variant</th>
                                <th style={{textAlign: 'center'}}>Stock</th>
                                <th>Status</th>
                                <th style={{textAlign: 'right'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStock.map((item, idx) => {
                                const status = getStockStatus(item.quantity_on_hand);
                                return (
                                    <tr key={idx}>
                                        <td className="product-cell">
                                            <div className="product-info">
                                                <img src={item.image || 'https://via.placeholder.com/64'} alt="" className="product-image" />
                                                <div>
                                                    <div className="product-name">{item.product_name}</div>
                                                    <div className="product-sku">{item.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{item.size ? `${item.size} / ${item.color}` : 'Standard'}</td>
                                        <td style={{textAlign: 'center'}}>
                                            <span className={`quantity-badge ${status.class}`}>{item.quantity_on_hand}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${status.class}`}>{status.label}</span>
                                        </td>
                                        <td style={{textAlign: 'right'}}>
                                            <div style={{display: 'inline-flex', gap: '8px'}}>
                                                {item.quantity_on_hand === 0 ? (
                                                    <button className="btn-action-sm suggest" onClick={() => handleSuggest(item)}>
                                                        <Icons.Magic /> Suggest
                                                    </button>
                                                ) : item.quantity_on_hand <= 5 && (
                                                    <button className="btn-action-sm branch" onClick={() => handleCheckBranch(item)}>
                                                        <Icons.Store /> Branch
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

            {/* MODAL (Giữ nguyên logic cũ nhưng UI sẽ đẹp nhờ CSS mới) */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalType === 'suggest' ? "Suggestions" : "Branch Stock"}>
                <div style={{maxHeight: '400px', overflowY: 'auto', padding: '10px'}}>
                    {modalData.map((d, i) => (
                        <div key={i} style={{display: 'flex', gap: '15px', padding: '15px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '10px'}}>
                            {modalType === 'suggest' && <img src={d.image} style={{width: 50, height: 50, borderRadius: 8, objectFit: 'cover'}} alt="" />}
                            <div style={{flex: 1}}>
                                <div style={{fontWeight: 700, color: '#111827'}}>{d.product_name || d.store_name}</div>
                                <div style={{fontSize: '0.9rem', color: '#6B7280'}}>Stock: <strong style={{color: '#10B981'}}>{d.quantity_on_hand}</strong></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default SaleStockLookup;