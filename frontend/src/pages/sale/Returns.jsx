import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';

const SaleReturns = () => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [returnReason, setReturnReason] = useState('');
    const [recentReturns, setRecentReturns] = useState([]);
    const [message, setMessage] = useState('');

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
        try {
            const res = await api.get(`/sale/returns.php?search=${searchTerm}`);
            setOrders(res.data);
            setSelectedOrder(null);
            setOrderItems([]);
        } catch (err) {
            console.error(err);
        }
    };

    const selectOrder = async (order) => {
        setSelectedOrder(order);
        try {
            const res = await api.get(`/sale/returns.php?order_id=${order.id}`);
            // Add return_qty field to items
            const items = res.data.map(item => ({ ...item, return_qty: 0 }));
            setOrderItems(items);
        } catch (err) {
            console.error(err);
        }
    };

    const handleQtyChange = (index, qty) => {
        const newItems = [...orderItems];
        newItems[index].return_qty = Math.min(qty, newItems[index].quantity); // Max is original qty
        setOrderItems(newItems);
    };

    const submitReturn = async () => {
        const itemsToReturn = orderItems
            .filter(i => i.return_qty > 0)
            .map(i => ({ product_id: i.product_id, quantity: i.return_qty }));

        if (itemsToReturn.length === 0) {
            setMessage('Please select items to return');
            return;
        }

        const refundTotal = orderItems.reduce((sum, item) => sum + (item.price * item.return_qty), 0);

        try {
            const res = await api.post('/sale/returns.php', {
                order_id: selectedOrder.id,
                items: itemsToReturn,
                refund_amount: refundTotal,
                reason: returnReason
            });
            if (res.data.success) {
                setMessage('Return processed successfully! ID: ' + res.data.return_id);
                setSelectedOrder(null);
                setSearchTerm('');
                fetchRecentReturns();
            }
        } catch (err) {
            setMessage('Error processing return');
        }
    };

    return (
        <div>
            <div className="admin-header">
                <h1>{t('sale.returns') || 'Process Returns'}</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Left: Search & Process */}
                <div className="admin-card">
                    <h3>Find Order</h3>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder="Order ID search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ flex: 1, padding: '8px' }}
                        />
                        <button type="submit" className="btn-primary">Search</button>
                    </form>

                    {orders.length > 0 && !selectedOrder && (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td>#{o.id}</td>
                                        <td>{o.customer_phone || o.full_name}</td>
                                        <td>{parseInt(o.total_amount).toLocaleString()}</td>
                                        <td>
                                            <button onClick={() => selectOrder(o)} className="btn-edit">
                                                Select
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {selectedOrder && (
                        <div>
                            <h4>Returning items for Order #{selectedOrder.id}</h4>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th>Return Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.product_name}</td>
                                            <td>{parseInt(item.price).toLocaleString()}</td>
                                            <td>{item.quantity}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantity}
                                                    value={item.return_qty}
                                                    onChange={e => handleQtyChange(idx, parseInt(e.target.value) || 0)}
                                                    style={{ width: '60px' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '15px' }}>
                                <label>Reason:</label>
                                <textarea
                                    value={returnReason}
                                    onChange={e => setReturnReason(e.target.value)}
                                    style={{ width: '100%', padding: '5px' }}
                                />
                            </div>

                            <div style={{ marginTop: '15px' }}>
                                <button onClick={submitReturn} className="btn-primary" style={{ width: '100%' }}>
                                    Confirm Return
                                </button>
                                <button onClick={() => setSelectedOrder(null)} style={{ width: '100%', marginTop: '5px' }}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
                </div>

                {/* Right: History */}
                <div className="admin-card">
                    <h3>Recent Returns</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Ref</th>
                                <th>Order</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReturns.map(r => (
                                <tr key={r.id}>
                                    <td>{r.return_number}</td>
                                    <td>#{r.order_id}</td>
                                    <td>{parseInt(r.refund_amount).toLocaleString()}</td>
                                    <td>{r.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SaleReturns;
