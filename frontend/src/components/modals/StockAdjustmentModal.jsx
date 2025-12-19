import { useState, useEffect } from 'react';
import { XCircle, Plus, RefreshCw, ArrowRight, Save } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

const INCREASE_REASONS = [
    'Received from Supplier',
    'Customer Return',
    'Replenishment (High Demand)',
    'Preparation for Promotion',
    'Found Item',
    'Stock Audit Correction',
    'Transfer In',
    'System Correction'
];

const DECREASE_REASONS = [
    'Damaged Goods',
    'Lost / Missing Items',
    'Expired / Spoiled',
    'Internal Use (Display/Marketing)',
    'Transfer Out',
    'Stock Audit Correction',
    'Theft',
    'Return to Supplier',
    'System Correction'
];

const StockAdjustmentModal = ({ isOpen, onClose, onSuccess, initialItem, initialData = {} }) => {
    const { error: showError, success: showSuccess } = useToast();
    const [step, setStep] = useState(1);
    const [type, setType] = useState('increase');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setType(initialData.type || 'increase');
            setQuantity(initialData.quantity || '');
            setReason(initialData.reason || '');
            setNote('');
        }
    }, [isOpen, initialData]);

    const handleSubmit = async () => {
        if (!reason) {
            showError('Please select a reason.');
            return;
        }
        if (quantity <= 0) {
            showError('Quantity must be greater than 0.');
            return;
        }

        try {
            await api.post('/admin/adjust_inventory.php', {
                inventory_id: initialItem.id,
                type,
                quantity,
                reason,
                note
            });
            showSuccess('Stock adjusted successfully!');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            showError(error.response?.data?.message || 'Failed to adjust stock');
        }
    };

    if (!isOpen || !initialItem) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Adjust Stock: {initialItem.product_name}</h3>
                    <button className="btn-close" onClick={onClose}><XCircle size={20} /></button>
                </div>
                <div className="modal-body">
                    {step === 1 ? (
                        <div className="form-stack">
                            <div className="form-group">
                                <label>Adjustment Type</label>
                                <div className="toggle-group">
                                    <button
                                        className={`toggle-btn ${type === 'increase' ? 'active increase' : ''}`}
                                        onClick={() => setType('increase')}
                                    >
                                        <Plus size={16} /> Add Stock
                                    </button>
                                    <button
                                        className={`toggle-btn ${type === 'decrease' ? 'active decrease' : ''}`}
                                        onClick={() => setType('decrease')}
                                    >
                                        <RefreshCw size={16} /> Deduct Stock
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || '')}
                                />
                            </div>

                            <div className="form-group">
                                <label>Reason <span className="text-red">*</span></label>
                                <select
                                    className="form-select"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                >
                                    <option value="">Select a reason...</option>
                                    {(type === 'increase' ? INCREASE_REASONS : DECREASE_REASONS).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Note (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Additional details..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                                <button className="btn-primary" onClick={() => setStep(2)}>
                                    Preview Adjustment <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="preview-stack">
                            <div className="preview-alert">
                                You are about to <strong>{type === 'increase' ? 'increase' : 'decrease'}</strong> stock for
                                <br />product <strong>{initialItem.sku}</strong>.
                            </div>

                            <div className="stock-comparison">
                                <div className="stock-card current">
                                    <span>Current</span>
                                    <strong>{initialItem.quantity}</strong>
                                </div>
                                <ArrowRight size={24} className="text-muted" />
                                <div className="stock-card new">
                                    <span>New</span>
                                    <strong>
                                        {type === 'increase'
                                            ? initialItem.quantity + (parseInt(quantity) || 0)
                                            : initialItem.quantity - (parseInt(quantity) || 0)
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div className="confirmation-list">
                                <div className="conf-item">
                                    <span>Reason:</span> <strong>{reason}</strong>
                                </div>
                                {note && (
                                    <div className="conf-item">
                                        <span>Note:</span> <span>{note}</span>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                                <button className="btn-primary" onClick={handleSubmit}>
                                    <Save size={16} /> Confirm Adjustment
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockAdjustmentModal;
