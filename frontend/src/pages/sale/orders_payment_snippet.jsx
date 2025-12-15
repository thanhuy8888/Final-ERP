// Add this to Orders.jsx to display payment method

// OPTION 1: Add column header (around line 113-116)
// After <th>{t('orders.total') || 'Total'}</th>
/*
<th>Thanh toán</th>
*/

// OPTION 2: Add data cell (around line 132-133)
// After <td className="amount">{formatCurrency(order.total_amount)}</td>
/*
<td>
    {order.payment_method === 'cash' && '💵 Tiền mặt'}
    {order.payment_method === 'card' && '💳 Thẻ'}
    {order.payment_method === 'qr' && '📱 QR'}
    {!order.payment_method && '💵 Tiền mặt'}
</td>
*/
