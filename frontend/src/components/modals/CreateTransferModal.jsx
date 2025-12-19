import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { X, ArrowRight, Home, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

const CreateTransferModal = ({ isOpen, onClose, onSuccess }) => {
    const { error: showError, success: showSuccess } = useToast();
    const [step, setStep] = useState(1);

    // Form Data
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [fromStore, setFromStore] = useState('');
    const [toStore, setToStore] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null); // Full object
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState('');

    // Preview Data
    const [stockData, setStockData] = useState({ source: 0, dest: 0 });
    const [isLoadingStock, setIsLoadingStock] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFromStore('');
            setToStore('');
            setProductId('');
            setQuantity('');
            setStockData({ source: 0, dest: 0 });
            fetchStores();
            fetchProducts();
        }
    }, [isOpen]);

    const fetchStores = async () => {
        // Mocking Stores if API not ready, ideally allow choosing from all stores
        setStores([
            { id: 1, name: 'Canifa - Cửa hàng chính' },
            { id: 4, name: 'Canifa - Aeon Long Biên' },
            { id: 5, name: 'Canifa - Times City' },
            { id: 6, name: 'Canifa - Royal City' },
            { id: 7, name: 'Canifa - Cầu Giấy' }
        ]);
    };

    const fetchProducts = async () => {
        try {
            const res = await api.get('/admin/products.php');
            setProducts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNext = async () => {
        if (!fromStore || !toStore || !productId || !quantity) {
            showError('Please fill in all fields');
            return;
        }
        if (fromStore === toStore) {
            showError('Source and Destination must be different');
            return;
        }

        const prod = products.find(p => p.id == productId);
        setSelectedProduct(prod);

        setIsLoadingStock(true);
        try {
            const res = await api.get(`/admin/get_product_stock.php?product_id=${productId}&store_ids=${fromStore},${toStore}`);
            setStockData({
                source: res.data[fromStore] || 0,
                dest: res.data[toStore] || 0
            });
            setStep(2);
        } catch (err) {
            showError('Failed to check stock levels');
        } finally {
            setIsLoadingStock(false);
        }
    };

    const handleConfirm = async () => {
        try {
            await api.post('/admin/create_transfer.php', {
                from_store_id: fromStore,
                to_store_id: toStore,
                product_id: productId,
                quantity: quantity,
                sku: selectedProduct?.sku || 'UNKNOWN'
            });
            showSuccess('Transfer Request Created!');
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            showError(err.response?.data?.message || 'Failed to create transfer');
        }
    };

    if (!isOpen) return null;

    // Calculations
    const qtyNum = parseInt(quantity) || 0;
    const sourceAfter = stockData.source - qtyNum;
    const destAfter = stockData.dest + qtyNum;

    const isInsufficient = sourceAfter < 0;
    const isLowStock = sourceAfter >= 0 && sourceAfter < 10; // Simple low stock threshold

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: '600px', borderRadius: '12px', padding: '0', overflow: 'hidden' }}>
                <div className="modal-header" style={{ background: '#f8f9fa', padding: '16px 24px', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1a1f36' }}>
                        {step === 1 ? 'New Stock Transfer' : 'Confirm Transfer Impact'}
                    </h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body" style={{ padding: '24px' }}>
                    {step === 1 ? (
                        <div className="form-stack" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Route Section */}
                            <div className="route-selector" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0f4f8', padding: '16px', borderRadius: '8px' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="text-muted text-xs uppercase font-bold mb-1 block">From Source</label>
                                    <select className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #dae0e7' }} value={fromStore} onChange={e => setFromStore(e.target.value)}>
                                        <option value="">Select Source...</option>
                                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="text-muted" style={{ paddingTop: '16px' }}><ArrowRight size={20} /></div>
                                <div style={{ flex: 1 }}>
                                    <label className="text-muted text-xs uppercase font-bold mb-1 block">To Destination</label>
                                    <select className="form-control" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #dae0e7' }} value={toStore} onChange={e => setToStore(e.target.value)}>
                                        <option value="">Select Destination...</option>
                                        {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Product Selection */}
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select Item</label>
                                <select
                                    className="form-control"
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #dae0e7', fontSize: '14px' }}
                                    value={productId}
                                    onChange={e => setProductId(e.target.value)}
                                >
                                    <option value="">Choose a product...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Quantity */}
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Quantity to Transfer</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        className="form-control"
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #dae0e7', fontSize: '14px' }}
                                        value={quantity}
                                        onChange={e => setQuantity(e.target.value)}
                                        min="1"
                                        placeholder="Enter amount..."
                                    />
                                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8898aa', fontSize: '12px' }}>UNITS</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="preview-stock">
                            {/* Warnings */}
                            {isInsufficient && (
                                <div className="alert-box danger mb-4" style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '6px', fontSize: '14px', border: '1px solid #fee2e2', marginBottom: '20px' }}>
                                    <strong>Insufficient Stock!</strong> Source only has {stockData.source} units.
                                </div>
                            )}
                            {isLowStock && !isInsufficient && (
                                <div className="alert-box warning mb-4" style={{ background: '#fffbeb', color: '#b45309', padding: '12px', borderRadius: '6px', fontSize: '14px', border: '1px solid #fcd34d', marginBottom: '20px' }}>
                                    <strong>Warning: Low Stock</strong>
                                    <div style={{ fontSize: '13px', marginTop: '4px' }}>Source inventory will drop to <b>{sourceAfter}</b> units (Safety Level: 10).</div>
                                </div>
                            )}

                            {/* Stock Visual Cards */}
                            <div className="stock-comparison" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', position: 'relative' }}>
                                <div style={{ flex: 1, padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: isLowStock ? '#fffbeb' : '#fff', textAlign: 'center' }}>
                                    <div className="text-secondary text-sm font-bold uppercase mb-2">Source Store</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: isInsufficient ? '#ef4444' : '#1e293b' }}>
                                        {stockData.source} <span className="text-muted" style={{ fontSize: '14px', fontWeight: 'normal' }}>→</span> {sourceAfter}
                                    </div>
                                    <div className="text-muted text-xs mt-1">Units available</div>
                                </div>

                                <div style={{ margin: '0 12px', color: '#94a3b8' }}><ArrowRight size={24} /></div>

                                <div style={{ flex: 1, padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f0fdf4', textAlign: 'center' }}>
                                    <div className="text-secondary text-sm font-bold uppercase mb-2">Dest Store</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
                                        {stockData.dest} <span className="text-muted" style={{ fontSize: '14px', fontWeight: 'normal' }}>→</span> {destAfter}
                                    </div>
                                    <div className="text-muted text-xs mt-1">Units available</div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '14px', color: '#475569' }}>
                                <p style={{ margin: '0 0 8px 0' }}>Transferring <b>{quantity}</b> units of <b>{selectedProduct?.name}</b>.</p>
                                <p style={{ margin: 0, fontSize: '13px' }}>The source store inventory will be deducted immediately upon approval.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-actions" style={{ padding: '16px 24px', background: '#f8f9fa', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    {step === 2 && (
                        <button className="btn-secondary" onClick={() => setStep(1)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #dae0e7', background: '#fff' }}>Back</button>
                    )}
                    <button
                        className="btn-primary"
                        onClick={step === 1 ? handleNext : handleConfirm}
                        style={{ padding: '8px 20px', borderRadius: '6px', opacity: (step === 2 && isInsufficient) ? 0.5 : 1, pointerEvents: (step === 2 && isInsufficient) ? 'none' : 'auto' }}
                        disabled={isLoadingStock}
                    >
                        {isLoadingStock ? 'Checking...' : (step === 1 ? 'Next Step' : 'Confirm Request')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTransferModal;
