import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AdminInventory = () => {
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
            setMessage({ type: 'error', text: error.response?.data?.error || 'Có lỗi xảy ra' });
        }
    };

    const openAdjustForm = (item) => {
        setSelectedItem(item);
        setAdjustData({ quantity_change: 0, adjustment_type: 'Addition', reason: '' });
        setShowAdjustForm(true);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>Quản lý tồn kho</h1>
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
                    <h3 style={{ color: '#e74c3c', marginBottom: '10px' }}>⚠️ Cảnh báo tồn kho thấp ({lowStock.length} sản phẩm)</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Size/Màu</th>
                                <th>Tồn kho</th>
                                <th>Ngưỡng</th>
                                <th>Hành động</th>
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
                                            Nhập thêm
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
                    <h3>Điều chỉnh tồn kho: {selectedItem.product_name} ({selectedItem.size}/{selectedItem.color})</h3>
                    <p>Tồn kho hiện tại: <strong>{selectedItem.quantity_on_hand}</strong></p>
                    <form onSubmit={handleAdjust}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '15px', marginTop: '15px' }}>
                            <div>
                                <label>Loại điều chỉnh</label>
                                <select
                                    value={adjustData.adjustment_type}
                                    onChange={(e) => setAdjustData({ ...adjustData, adjustment_type: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="Addition">Nhập thêm</option>
                                    <option value="Deduction">Giảm</option>
                                    <option value="Initial">Nhập ban đầu</option>
                                    <option value="Transfer">Chuyển kho</option>
                                </select>
                            </div>
                            <div>
                                <label>Số lượng thay đổi</label>
                                <input
                                    type="number"
                                    value={adjustData.quantity_change}
                                    onChange={(e) => setAdjustData({ ...adjustData, quantity_change: parseInt(e.target.value) })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label>Lý do</label>
                                <input
                                    type="text"
                                    value={adjustData.reason}
                                    onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                                    placeholder="VD: Nhập hàng mới, Kiểm kê..."
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary">Xác nhận</button>
                            <button type="button" onClick={() => setShowAdjustForm(false)} style={{
                                padding: '10px 20px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                background: 'white',
                                cursor: 'pointer'
                            }}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-card">
                <h3>Tổng quan tồn kho</h3>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Size</th>
                            <th>Màu</th>
                            <th>Cửa hàng</th>
                            <th>Tồn kho</th>
                            <th>Đã đặt</th>
                            <th>Hành động</th>
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
                                    <button onClick={() => openAdjustForm(item)} className="btn-edit">📦 Điều chỉnh</button>
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
