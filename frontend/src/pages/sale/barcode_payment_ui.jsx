// Barcode Scanner and Payment Method UI Components
// Add these components to NewOrder.jsx

// 1. BARCODE SCANNER - Add after product list, before cart section (around line 362)
<div className="barcode-scanner">
    <div className="barcode-scanner-label">
        <span>📷</span> Quét mã vạch
    </div>
    <input
        type="text"
        placeholder="Nhập hoặc quét mã vạch sản phẩm..."
        value={barcodeInput}
        onChange={(e) => setBarcodeInput(e.target.value)}
        onKeyPress={(e) => {
            if (e.key === 'Enter') {
                handleBarcodeSearch(barcodeInput);
            }
        }}
        autoFocus
    />
</div>

// 2. PAYMENT METHOD SELECTOR - Add before submit button (around line 520, after notes input)
<div className="payment-method-selector">
    <h3>💳 Phương thức thanh toán</h3>
    <div className="payment-buttons">
        <button 
            type="button"
            className={paymentMethod === 'cash' ? 'active' : ''}
            onClick={() => setPaymentMethod('cash')}
        >
            <span className="payment-icon">💵</span>
            <span className="payment-label">Tiền mặt</span>
        </button>
        <button 
            type="button"
            className={paymentMethod === 'card' ? 'active' : ''}
            onClick={() => setPaymentMethod('card')}
        >
            <span className="payment-icon">💳</span>
            <span className="payment-label">Thẻ</span>
        </button>
        <button 
            type="button"
            className={paymentMethod === 'qr' ? 'active' : ''}
            onClick={() => setPaymentMethod('qr')}
        >
            <span className="payment-icon">📱</span>
            <span className="payment-label">QR Code</span>
        </button>
    </div>
</div>

// 3. IMPORT CSS - Add to top of NewOrder.jsx (after other imports)
import './BarcodePayment.css';
