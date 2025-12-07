import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';

const SaleStockLookup = () => {
    const { t } = useTranslation();
    const [stock, setStock] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="sale-content-container">
            <h1 style={{ marginBottom: '20px' }}>📦 {t('sale.stockLookup') || 'Stock Lookup'}</h1>

            <div className="admin-card">
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder={t('common.searchPlaceholder') || 'Search name, SKU...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1, padding: '10px' }}
                    />
                    <button type="submit" className="btn-primary">Search</button>
                </form>

                {loading ? <p>Loading...</p> : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Store</th>
                                <th>Product</th>
                                <th>Variant</th>
                                <th>Quantity</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stock.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No stock found</td></tr>
                            ) : (
                                stock.map((item, idx) => (
                                    <tr key={idx}>
                                        <td><strong>{item.store_name}</strong></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img
                                                    src={item.image || '/placeholder.jpg'}
                                                    alt=""
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                                <div>
                                                    <div>{item.product_name}</div>
                                                    <small style={{ color: '#666' }}>{item.sku}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {item.size ? `${item.size} / ${item.color}` : 'Standard'}
                                            {item.variant_sku && <div style={{ fontSize: '11px', color: '#888' }}>{item.variant_sku}</div>}
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>{item.quantity_on_hand}</td>
                                        <td>
                                            {item.quantity_on_hand > 5 ? (
                                                <span style={{ color: 'green' }}>In Stock</span>
                                            ) : item.quantity_on_hand > 0 ? (
                                                <span style={{ color: 'orange' }}>Low Stock</span>
                                            ) : (
                                                <span style={{ color: 'red' }}>Out of Stock</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SaleStockLookup;
