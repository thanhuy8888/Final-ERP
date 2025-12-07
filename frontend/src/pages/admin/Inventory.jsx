import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';

const AdminInventory = () => {
    const { t } = useTranslation();
    const [inventory, setInventory] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdjustForm, setShowAdjustForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [adjustData, setAdjustData] = useState({
        quantity_change: 0,
        adjustment_type: 'Addition',
        reason: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchInventory = async () => {
        try {
            const [invRes, lowRes] = await Promise.all([
                api.get('/admin/inventory.php'),
                api.get('/admin/inventory.php?low_stock=1')
            ]);
            setInventory(invRes.data);
            setLowStock(lowRes.data);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/inventory.php', {
                action: 'adjust',
                inventory_id: selectedItem.inventory_id,
                ...adjustData
            });
            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message });
                setShowAdjustForm(false);
                fetchInventory();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error' });
        }
    };

    const openAdjustForm = (item) => {
        setSelectedItem(item);
        setAdjustData({ quantity_change: 0, adjustment_type: 'Addition', reason: '' });
        setShowAdjustForm(true);
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>{t('admin.inventoryManagement')}</h1>
            </div>

            {message.text && (
                <div style={{
                    padding: '10px 15px',
                    marginBottom: '15px',
                    borderRadius: '5px',
                    background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24'
                }}>
                    {message.text}
                </div>
            )}

            {lowStock.length > 0 && (
                <div className="admin-card" style={{ marginBottom: '20px', borderLeft: '4px solid #e74c3c' }}>
                    <h3 style={{ color: '#e74c3c', marginBottom: '10px' }}>⚠️ Low Stock Alert ({lowStock.length} {t('common.products')})</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin.productName')}</th>
                                <th>{t('product.size')}/{t('product.color')}</th>
                                <th>{t('admin.stock')}</th>
                                <th>Threshold</th>
                                <th>{t('admin.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStock.slice(0, 5).map(item => (
                                <tr key={item.inventory_id}>
                                    <td>{item.product_name}</td>
                                    <td>{item.size} / {item.color}</td>
                                    <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{item.quantity_on_hand}</td>
                                    <td>{item.low_stock_threshold}</td>
                                    <td>
                                        <button onClick={() => openAdjustForm(item)} className="btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                                            {t('admin.adjust')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAdjustForm && selectedItem && (
                <div className="admin-card" style={{ marginBottom: '20px' }}>
                    <h3>{t('admin.adjustStock')}: {selectedItem.product_name} ({selectedItem.size}/{selectedItem.color})</h3>
                    <p>{t('admin.currentStock')}: <strong>{selectedItem.quantity_on_hand}</strong></p>
                    <form onSubmit={handleAdjust}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '15px', marginTop: '15px' }}>
                            <div>
                                <label>Type</label>
                                <select
                                    value={adjustData.adjustment_type}
                                    onChange={(e) => setAdjustData({ ...adjustData, adjustment_type: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="Addition">Add</option>
                                    <option value="Deduction">Deduct</option>
                                    <option value="Initial">Initial</option>
                                    <option value="Transfer">Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label>{t('product.quantity')}</label>
                                <input
                                    type="number"
                                    value={adjustData.quantity_change}
                                    onChange={(e) => setAdjustData({ ...adjustData, quantity_change: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>Reason</label>
                                <input
                                    type="text"
                                    value={adjustData.reason}
                                    onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary">{t('common.confirm')}</button>
                            <button type="button" onClick={() => setShowAdjustForm(false)} style={{
                                padding: '10px 20px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                background: 'white',
                                cursor: 'pointer'
                            }}>{t('common.cancel')}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-card">
                <h3>{t('admin.inventory')}</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.productName')}</th>
                            <th>{t('product.size')}</th>
                            <th>{t('product.color')}</th>
                            <th>Store</th>
                            <th>{t('admin.stock')}</th>
                            <th>Reserved</th>
                            <th>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map(item => (
                            <tr key={item.inventory_id}>
                                <td>{item.product_name}</td>
                                <td>{item.size || '-'}</td>
                                <td>{item.color || '-'}</td>
                                <td>{item.store_name}</td>
                                <td style={{
                                    color: item.quantity_on_hand <= item.low_stock_threshold ? '#e74c3c' : 'inherit',
                                    fontWeight: item.quantity_on_hand <= item.low_stock_threshold ? 'bold' : 'normal'
                                }}>
                                    {item.quantity_on_hand}
                                </td>
                                <td>{item.reserved_quantity || 0}</td>
                                <td>
                                    <button onClick={() => openAdjustForm(item)} className="btn-edit">📦 {t('admin.adjust')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminInventory;
