import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const VariantManager = ({ variants, setVariants }) => {
    const { t } = useTranslation();

    const addVariant = () => {
        setVariants([...variants, { size: 'M', color: '', quantity: 0, price_adjustment: 0 }]);
    };

    const removeVariant = (index) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        setVariants(newVariants);
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    return (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>{t('admin.variants') || 'Product Variants'}</h3>
                <button type="button" onClick={addVariant} className="btn-primary" style={{ padding: '5px 10px', fontSize: '13px' }}>
                    + Add Variant
                </button>
            </div>

            {variants.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No variants added (Standard product).</p>
            ) : (
                <table className="admin-table" style={{ marginTop: '10px' }}>
                    <thead>
                        <tr>
                            <th>Size</th>
                            <th>Color</th>
                            <th>Qty</th>
                            <th>Price (+/-)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {variants.map((variant, index) => (
                            <tr key={index}>
                                <td>
                                    <select
                                        value={variant.size}
                                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                        style={{ padding: '5px' }}
                                    >
                                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder="Color (e.g. Red)"
                                        value={variant.color}
                                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                        style={{ width: '100px', padding: '5px' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={variant.quantity}
                                        onChange={(e) => updateVariant(index, 'quantity', parseInt(e.target.value))}
                                        style={{ width: '60px', padding: '5px' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={variant.price_adjustment}
                                        onChange={(e) => updateVariant(index, 'price_adjustment', parseFloat(e.target.value))}
                                        style={{ width: '80px', padding: '5px' }}
                                    />
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default VariantManager;
