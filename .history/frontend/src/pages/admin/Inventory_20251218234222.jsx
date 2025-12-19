import React, { useState } from 'react';
import { X, Plus, Minus, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

const StockAdjustmentModal = ({ isOpen, onClose, onSuccess, initialItem, initialData }) => {
    const { success, showError } = useToast();
    const [step, setStep] = useState(1);
    const [type, setType] = useState(initialData?.type || 'increase');
    const [quantity, setQuantity] = useState(initialData?.quantity || '');
    const [reason, setReason] = useState(initialData?.reason || '');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !initialItem) return null;

    const REASONS = [
        'Restock / New Shipment',
        'Damaged / Defective',
        'Return from Customer',
        'Inventory Audit Correction',
        'Lost / Missing Items',
        'Other'
    ];

    const handleNext = () => {
        if (!quantity || quantity <= 0) return showError("Please enter a valid quantity");
        if (!reason) return showError("Please select a reason");
        setStep(2);
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await api.post('/admin/inventory.php', {
                action: 'adjust',
                inventory_id: initialItem.id,
                type,
                quantity: parseInt(quantity),
                reason,
                note
            });
            success("Stock adjusted successfully!");
            onSuccess();
            onClose();
            setStep(1);
        } catch (error) {
            showError("Failed to adjust stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content adjustment-modal">
                <div className="modal-header">
                    <h3>Adjust Stock: {initialItem.product_name}</h3>
                    <button className="btn-close" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="modal-body">
                    {step === 1 ? (
                        <div className="form-stack">
                            <div className="form-group">
                                <label>Adjustment Type</label>
                                <div className="toggle-group">
                                    <button 
                                        className={`toggle-btn increase ${type === 'increase' ? 'active' : ''}`}
                                        onClick={() => setType('increase')}
                                    >
                                        <Plus size={16} /> Add Stock
                                    </button>
                                    <button 
                                        className={`toggle-btn decrease ${type === 'decrease' ? 'active' : ''}`}
                                        onClick={() => setType('decrease')}
                                    >
                                        <Minus size={16} /> Deduct Stock
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Quantity</label>
                                <input 
                                    type="number" 
                                    className="form-input"
                                    placeholder="Enter amount..."
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Reason *</label>
                                <select 
                                    className="form-select"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                    <option value="">Select a reason...</option>
                                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Note (Optional)</label>
                                <textarea 
                                    className="form-textarea"
                                    placeholder="Additional details..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="preview-stack">
                            <div className="preview-alert">
                                <AlertCircle size={20} />
                                <span>Please review the changes before confirming.</span>
                            </div>
                            
                            <div className="stock-comparison">
                                <div className="stock-card">
                                    <span>Current</span>
                                    <strong>{initialItem.quantity}</strong>
                                </div>
                                <ArrowRight className="sep-icon" />
                                <div className="stock-card new">
                                    <span>New Total</span>
                                    <strong>
                                        {type === 'increase' 
                                            ? parseInt(initialItem.quantity) + parseInt(quantity)
                                            : parseInt(initialItem.quantity) - parseInt(quantity)
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div className="confirmation-list">
                                <div className="conf-item"><span>Action:</span> <strong>{type.toUpperCase()}</strong></div>
                                <div className="conf-item"><span>Amount:</span> <strong>{quantity} units</strong></div>
                                <div className="conf-item"><span>Reason:</span> <strong>{reason}</strong></div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {step === 1 ? (
                        <>
                            <button className="btn-secondary" onClick={onClose}>Cancel</button>
                            <button className="btn-primary" onClick={handleNext}>
                                Preview Adjustment <ArrowRight size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button className="btn-primary" onClick={handleConfirm} disabled={loading}>
                                {loading ? "Processing..." : "Confirm & Save"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockAdjustmentModal;