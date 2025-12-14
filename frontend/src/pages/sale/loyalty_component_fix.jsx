// Loyalty Information Component with Tier-Specific Gradients
// Copy this code and replace lines 221-277 in Customers.jsx

{/* Loyalty Information */ }
{
    selectedCustomerDetails.loyalty && (() => {
        const tier = selectedCustomerDetails.loyalty.tier;
        const gradients = {
            bronze: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
            silver: 'linear-gradient(135deg, #C0C0C0 0%, #808080 100%)',
            gold: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            platinum: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
        return (
            <div style={{
                padding: '16px',
                background: gradients[tier] || gradients.bronze,
                borderRadius: '12px',
                color: 'white',
                marginBottom: '20px'
            }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏆</span> Thông tin thành viên
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>Hạng thành viên</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {tier === 'bronze' && '🥉 Bronze'}
                            {tier === 'silver' && '🥈 Silver'}
                            {tier === 'gold' && '🥇 Gold'}
                            {tier === 'platinum' && '💎 Platinum'}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>Điểm tích lũy</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {selectedCustomerDetails.loyalty.points.toLocaleString()} điểm
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                            ≈ {(selectedCustomerDetails.loyalty.points_value || 0).toLocaleString()}đ
                        </div>
                    </div>
                </div>
                {selectedCustomerDetails.loyalty.tier_discount !== null && selectedCustomerDetails.loyalty.tier_discount !== undefined && (
                    <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>
                        {selectedCustomerDetails.loyalty.tier_discount > 0 ? (
                            <>🎁 Giảm giá {selectedCustomerDetails.loyalty.tier_discount}% cho mọi đơn hàng</>
                        ) : (
                            <>💡 Mua thêm để nhận ưu đãi giảm giá!</>
                        )}
                    </div>
                )}
                {selectedCustomerDetails.loyalty.next_tier && (
                    <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '6px' }}>
                            Tiến độ lên hạng {selectedCustomerDetails.loyalty.next_tier}
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                            <div style={{
                                background: 'white',
                                height: '100%',
                                width: `${selectedCustomerDetails.loyalty.progress_to_next}%`,
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
                            {(selectedCustomerDetails.loyalty.lifetime_spent || 0).toLocaleString()}đ / {(selectedCustomerDetails.loyalty.next_threshold || 0).toLocaleString()}đ
                        </div>
                    </div>
                )}
            </div>
        );
    })()
}
