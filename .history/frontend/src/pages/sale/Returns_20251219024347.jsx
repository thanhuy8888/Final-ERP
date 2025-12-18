import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../../components/Modal';
import './Returns.css';

const SaleReturns = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [returnReason, setReturnReason] = useState('defective');
    const [recentReturns, setRecentReturns] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [confirmModal, setConfirmModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);

    useEffect(() => {
        fetchRecentReturns();
    }, []);

    const fetchRecentReturns = async () => {
        try {
            // Giả lập dữ liệu để bạn test giao diện nếu chưa có API
            // const mockReturns = [
            //     { id: 1, return_number: 'RET-001', order_id: 'ORD-992', refund_amount: 500000, status: 'completed' },
            //     { id: 2, return_number: 'RET-002', order_id: 'ORD-115', refund_amount: 250000, status: 'pending' }
            // ];
            // setRecentReturns(mockReturns);
            
            const res = await api.get('/sale/returns.php');
            setRecentReturns(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.get(`/sale/returns.php?search=${searchTerm}`);
            setOrders(res.data);
            setSelectedOrder(null);
            setOrderItems([]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectOrder = async (order) => {
        setLoading(true);
        setSelectedOrder(order);
        try {
            const res = await api.get(`/sale/returns.php?order_id=${order.id}`);
            const items = res.data.map(item => ({ ...item, return_qty: 0 }));
            setOrderItems(items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleQtyChange = (index, qty) => {
        const newItems = [...orderItems];
        newItems[index].return_qty = Math.min(Math.max(0, qty), newItems[index].quantity);
        setOrderItems(newItems);
    };

    const calculateRefund = () => {
        return orderItems.reduce((sum, item) => sum + (item.price * item.return_qty), 0);
    };

    const calculateKPI = (amount) => {
        return -(Math.floor(amount / 100000));
    };

    const handleInitSubmit = () => {
        const hasItems = orderItems.some(i => i.return_qty > 0);
        if (!hasItems) return;
        setConfirmModal(true);
    };

    const processReturn = async () => {
        setConfirmModal(false);
        setLoading(true);
        const itemsToReturn = orderItems.filter(i => i.return_qty > 0).map(i => ({ product_id: i.product_id, quantity: i.return_qty }));
        
        try {
            const res = await api.post('/sale/returns.php', {
                order_id: selectedOrder.id,
                items: itemsToReturn,
                refund_amount: calculateRefund(),
                reason: returnReason
            });
            if (res.data.success) {
                setSuccessModal(true);
                setSearchTerm('');
                setSelectedOrder(null);
                fetchRecentReturns();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const refundAmount = calculateRefund();
    const kpiImpact = calculateKPI(refundAmount);
    const hasItemsSelected = orderItems.some(i => i.return_qty > 0);

    return (
        <div className="sale-returns">
            <div className="returns-header">
                <h1>🔄 {t('sale.returns')}</h1>
            </div>

            <div className="returns-container">
                {/* Left: Process Return */}
                <div className="return-card">
                    {!selectedOrder ? (
                        <>
                            <h3>🔍 {t('sale.findOrder')}</h3>
                            <form onSubmit={handleSearch} className="search-form">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder={t('sale.searchOrderPlaceholder')}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                                <button type="submit" className="btn-search">
                                    {loading ? '...' : t('common.search')}
                                </button>
                            </form>

                            {orders.length > 0 ? (
                                <table className="return-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>{t('sale.customer')}</th>
                                            <th>{t('sale.total')}</th>
                                            <th>{t('common.action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o.id}>
                                                <td><span style={{ fontWeight: 'bold', color: '#555' }}>#{o.id}</span></td>
                                                <td>{o.customer_name || o.phone || 'Guest'}</td>
                                                <td style={{ color: '#E31E24', fontWeight: 600 }}>
                                                    {parseInt(o.total_amount).toLocaleString()}đ
                                                </td>
                                                <td>
                                                    <button onClick={() => selectOrder(o)} className="btn-select">
                                                        {t('common.select')} →
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧾</div>
                                    <p>{t('sale.enterOrderIdToStart')}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <h3>
                                    <span>📦 {t('sale.returnForOrder', { id: selectedOrder.id })}</span>
                                    <button onClick={() => setSelectedOrder(null)} className="btn-change-order">
                                        ✕ {t('common.cancel')}
                                    </button>
                                </h3>
                            </div>

                            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                                <table className="return-table">
                                    <thead>
                                        <tr>
                                            <th style={{width: '45%'}}>{t('common.products')}</th>
                                            <th>{t('sale.price')}</th>
                                            <th style={{textAlign: 'center'}}>{t('orders.quantity')}</th>
                                            <th>{t('sale.returnQty')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item, idx) => (
                                            <tr key={idx} style={item.return_qty > 0 ? {background: '#fff5f5'} : {}}>
                                                <td>
                                                    <div className="product-cell">
                                                        <img src={item.image || 'https://via.placeholder.com/48'} alt="" />
                                                        <div>
                                                            <span className="product-name">{item.product_name}</span>
                                                            <span className="product-variant">SKU: {item.sku || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{parseInt(item.price).toLocaleString()}</td>
                                                <td style={{ textAlign: 'center', color: '#888' }}>{item.quantity}</td>
                                                <td>
                                                    <div className="qty-control">
                                                        <button
                                                            className="qty-btn"
                                                            onClick={() => handleQtyChange(idx, item.return_qty - 1)}
                                                            disabled={item.return_qty <= 0}
                                                        >−</button>
                                                        <span className="qty-value">{item.return_qty}</span>
                                                        <button
                                                            className="qty-btn"
                                                            onClick={() => handleQtyChange(idx, item.return_qty + 1)}
                                                            disabled={item.return_qty >= item.quantity}
                                                        >+</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#444' }}>
                                    📝 {t('sale.returnReason')}:
                                </label>
                                <select
                                    className="reason-select"
                                    value={returnReason}
                                    onChange={e => setReturnReason(e.target.value)}
                                >
                                    <option value="defective">💔 {t('sale.reasons.defective')}</option>
                                    <option value="wrong_item">📦 {t('sale.reasons.wrong_item')}</option>
                                    <option value="wrong_size">📏 {t('sale.reasons.wrong_size')}</option>
                                    <option value="changed_mind">🤔 {t('sale.reasons.changed_mind')}</option>
                                    <option value="other">📝 {t('sale.reasons.other')}</option>
                                </select>
                            </div>

                            {hasItemsSelected && (
                                <div className="summary-box">
                                    <div className="summary-row">
                                        <span>Items selected:</span>
                                        <strong>{orderItems.reduce((acc, i) => acc + i.return_qty, 0)} items</strong>
                                    </div>
                                    <div className="summary-row kpi-warning">
                                        <span>{t('sale.kpiImpact')}:</span>
                                        <span className="kpi-badge">{kpiImpact} points</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>{t('sale.refundAmount')}:</span>
                                        <span>{refundAmount.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            )}

                            <div className="exchange-hint">
                                <span style={{fontSize: '20px'}}>💡</span>
                                <span>{t('sale.exchangeHint')}</span>
                            </div>

                            <button
                                onClick={handleInitSubmit}
                                className="btn-confirm"
                                disabled={!hasItemsSelected || loading}
                            >
                                {loading ? t('common.loading') : `✅ ${t('sale.confirmReturn')}`}
                            </button>
                        </>
                    )}
                </div>

                {/* Right: History */}
                <div className="return-card">
                    <h3>🕓 {t('sale.recentReturns')}</h3>
                    <table className="return-table">
                        <thead>
                            <tr>
                                <th>{t('sale.ref')}</th>
                                <th style={{textAlign: 'right'}}>{t('sale.amount')}</th>
                                <th style={{textAlign: 'right'}}>{t('reports.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReturns.length === 0 ? (
                                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#bbb' }}>{t('common.noData')}</td></tr>
                            ) : recentReturns.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#333' }}>{r.return_number}</div>
                                        <div style={{ fontSize: 11, color: '#999' }}>#{r.order_id}</div>
                                    </td>
                                    <td style={{ color: '#E31E24', fontWeight: 700, textAlign: 'right' }}>
                                        -{parseInt(r.refund_amount).toLocaleString()}
                                    </td>
                                    <td style={{textAlign: 'right'}}>
                                        <span className={`status-badge status-${r.status || 'pending'}`}>
                                            {r.status || 'Completed'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Modal */}
            <Modal
                isOpen={confirmModal}
                onClose={() => setConfirmModal(false)}
                title={t('common.confirm')}
                icon="⚠️"
                actions={
                    <>
                        <button className="modal-btn secondary" onClick={() => setConfirmModal(false)}>{t('common.cancel')}</button>
                        <button className="modal-btn primary" onClick={processReturn} style={{ background: '#27ae60' }}>{t('common.confirm')}</button>
                    </>
                }
            >
                <div style={{textAlign: 'center', padding: '10px'}}>
                    <p style={{fontSize: '16px'}}>{t('sale.returnConfirmMsg')}</p>
                    <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', margin: '15px 0'}}>
                        <p style={{margin: '5px 0'}}>Refund: <strong style={{color: '#E31E24', fontSize: '18px'}}>{refundAmount.toLocaleString()}đ</strong></p>
                        <p style={{margin: '5px 0', fontSize: '13px', color: '#888'}}>{t('sale.kpiImpact')}: <strong>{kpiImpact} points</strong></p>
                    </div>
                </div>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={successModal}
                onClose={() => setSuccessModal(false)}
                title="Success"
                icon="🎉"
                actions={
                    <button className="modal-btn primary" onClick={() => setSuccessModal(false)}>{t('common.ok')}</button>
                }
            >
                <p style={{textAlign: 'center'}}>{t('sale.returnSuccess')}</p>
            </Modal>
        </div>
    );
};

export default SaleReturns;