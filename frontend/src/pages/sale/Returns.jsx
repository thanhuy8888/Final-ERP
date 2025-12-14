import { useState, useEffect } from 'react';
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
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal States
    const [confirmModal, setConfirmModal] = useState(false);
    const [successModal, setSuccessModal] = useState(false);

    useEffect(() => {
        fetchRecentReturns();
    }, []);

    const fetchRecentReturns = async () => {
        try {
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
            // Add return_qty field to items, default 0
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

    const calculateRefud = () => {
        return orderItems.reduce((sum, item) => sum + (item.price * item.return_qty), 0);
    };

    const calculateKPI = (amount) => {
        // Example logic: -1 point for every 100k returned
        return -(Math.floor(amount / 100000));
    };

    // Step 1: User clicks "Confirm Return" -> Open Modal
    const handleInitSubmit = () => {
        const hasItems = orderItems.some(i => i.return_qty > 0);
        if (!hasItems) {
            alert(t('sale.selectProducts'));
            return;
        }
        setConfirmModal(true);
    };

    // Step 2: User clicks "OK" in Modal -> Process API
    const processReturn = async () => {
        setConfirmModal(false);
        setLoading(true);

        const itemsToReturn = orderItems
            .filter(i => i.return_qty > 0)
            .map(i => ({ product_id: i.product_id, quantity: i.return_qty }));

        const refundTotal = calculateRefud();

        try {
            const res = await api.post('/sale/returns.php', {
                order_id: selectedOrder.id,
                items: itemsToReturn,
                refund_amount: refundTotal,
                reason: returnReason
            });
            if (res.data.success) {
                setSuccessModal(true); // Open Success Modal
                setMessage('');
                setSelectedOrder(null);
                setSearchTerm('');
                fetchRecentReturns();
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || t('common.error') || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const refundAmount = calculateRefud();
    const kpiImpact = calculateKPI(refundAmount);
    const hasItemsSelected = orderItems.some(i => i.return_qty > 0);

    return (
        <div className="sale-returns">
            <div className="returns-header" style={{ marginBottom: '24px' }}>
                <h1>🔄 {t('sale.returns')}</h1>
            </div>

            <div className="returns-container">
                {/* Left: Process Return */}
                <div className="return-card">
                    {!selectedOrder ? (
                        <>
                            <h3>{t('sale.findOrder')}</h3>
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

                            {orders.length > 0 && (
                                <table className="return-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>{t('sale.customer')}</th>
                                            <th>{t('sale.total')}</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o.id}>
                                                <td>#{o.id}</td>
                                                <td>{o.customer_name || o.phone || 'Guest'}</td>
                                                <td>{parseInt(o.total_amount).toLocaleString()}đ</td>
                                                <td>
                                                    <button onClick={() => selectOrder(o)} className="btn-select">
                                                        {t('common.view')}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>{t('sale.returnForOrder', { id: selectedOrder.id })}</h3>
                                <button onClick={() => setSelectedOrder(null)} className="btn-select">{t('sale.changeOrder')}</button>
                            </div>

                            <table className="return-table">
                                <thead>
                                    <tr>
                                        <th>{t('common.products')}</th>
                                        <th>{t('sale.price')}</th>
                                        <th>{t('orders.quantity')}</th>
                                        <th>{t('sale.returnQty')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className="product-cell">
                                                    {item.image && <img src={item.image} alt="" />}
                                                    <span>{item.product_name}</span>
                                                </div>
                                            </td>
                                            <td>{parseInt(item.price).toLocaleString()}</td>
                                            <td>{item.quantity}</td>
                                            <td>
                                                <div className="qty-control">
                                                    <button
                                                        className="qty-btn"
                                                        onClick={() => handleQtyChange(idx, item.return_qty - 1)}
                                                        disabled={item.return_qty <= 0}
                                                    >-</button>
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

                            <div style={{ marginTop: '20px' }}>
                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                                    {t('sale.returnReason')}:
                                </label>
                                <select
                                    className="reason-select"
                                    value={returnReason}
                                    onChange={e => setReturnReason(e.target.value)}
                                >
                                    <option value="defective">{t('sale.reasons.defective')}</option>
                                    <option value="wrong_item">{t('sale.reasons.wrong_item')}</option>
                                    <option value="wrong_size">{t('sale.reasons.wrong_size')}</option>
                                    <option value="changed_mind">{t('sale.reasons.changed_mind')}</option>
                                    <option value="other">{t('sale.reasons.other')}</option>
                                </select>
                            </div>

                            {hasItemsSelected && (
                                <div className="summary-box">
                                    <div className="summary-row total">
                                        <span>{t('sale.refundAmount')}:</span>
                                        <span>{refundAmount.toLocaleString()}đ</span>
                                    </div>
                                    <div className="summary-row kpi-warning">
                                        <span>{t('sale.kpiImpact')}:</span>
                                        <span>{kpiImpact} {t('sale.points')}</span>
                                    </div>
                                </div>
                            )}

                            <div className="exchange-hint">
                                {t('sale.exchangeHint')}
                            </div>

                            <button
                                onClick={handleInitSubmit}
                                className="btn-confirm"
                                disabled={!hasItemsSelected || loading}
                            >
                                {loading ? t('common.loading') : t('sale.confirmReturn')}
                            </button>
                        </>
                    )}
                </div>

                {/* Right: History */}
                <div className="return-card">
                    <h3>{t('sale.recentReturns')}</h3>
                    <table className="return-table">
                        <thead>
                            <tr>
                                <th>{t('sale.ref')}</th>
                                <th>{t('sale.amount')}</th>
                                <th>{t('reports.status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReturns.length === 0 ? (
                                <tr><td colSpan="3" style={{ textAlign: 'center', color: '#999' }}>{t('common.noData')}</td></tr>
                            ) : recentReturns.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{r.return_number}</div>
                                        <div style={{ fontSize: 12, color: '#888' }}>#{r.order_id}</div>
                                    </td>
                                    <td style={{ color: '#E31E24', fontWeight: 600 }}>
                                        {parseInt(r.refund_amount).toLocaleString()}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${r.status}`}>
                                            {r.status}
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
                        <button className="modal-btn primary" onClick={processReturn} style={{ background: '#E31E24' }}>{t('common.confirm')}</button>
                    </>
                }
            >
                <p>{t('sale.returnConfirmMsg')}</p>
                <p>{t('sale.refundAmount')}: <strong>{refundAmount.toLocaleString()}đ</strong></p>
                <p style={{ color: '#f39c12' }}>{t('sale.kpiImpact')}: <strong>{kpiImpact} {t('sale.points')}</strong></p>
            </Modal>

            {/* Success Modal */}
            <Modal
                isOpen={successModal}
                onClose={() => setSuccessModal(false)}
                title={t('common.success')}
                icon="✅"
                actions={
                    <button className="modal-btn primary" onClick={() => setSuccessModal(false)}>{t('common.ok')}</button>
                }
            >
                <p>{t('sale.returnSuccess')}</p>
            </Modal>
        </div>
    );
};

export default SaleReturns;
