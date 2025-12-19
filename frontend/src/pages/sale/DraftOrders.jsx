import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import Modal from '../../components/Modal';
import './Orders.css'; // Reuse existing styles

const DraftOrders = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState([]);
    const [deleteModal, setDeleteModal] = useState({ open: false, index: null });

    useEffect(() => {
        loadDrafts();
    }, []);

    const loadDrafts = () => {
        try {
            const saved = localStorage.getItem('sale_drafts');
            if (saved) {
                setDrafts(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load drafts", e);
        }
    };

    const handleResume = (draft, index) => {
        navigate('/sale/new-order', { state: { draft: draft, draftIndex: index } });
    };

    const handleDelete = () => {
        if (deleteModal.index === null) return;

        const newDrafts = [...drafts];
        newDrafts.splice(deleteModal.index, 1);
        setDrafts(newDrafts);
        localStorage.setItem('sale_drafts', JSON.stringify(newDrafts));
        setDeleteModal({ open: false, index: null });
    };

    const confirmDelete = (index) => {
        setDeleteModal({ open: true, index });
    };

    const formatCurrency = (val) => parseInt(val || 0).toLocaleString() + 'đ';

    return (
        <div className="sale-orders">
            <div className="orders-header">
                <h1>📝 {t('drafts.title')} ({drafts.length})</h1>
                <button onClick={() => navigate('/sale/new-order')} className="btn-new-order">
                    ➕ {t('sale.newOrder')}
                </button>
            </div>

            <div className="orders-list">
                {drafts.length === 0 ? (
                    <div className="no-orders">
                        <p>{t('drafts.noDrafts')}</p>
                        <button onClick={() => navigate('/sale/new-order')} style={{ marginTop: '16px', padding: '10px 24px', fontSize: '15px' }} className="btn-new-order">
                            ➕ {t('drafts.createNow')}
                        </button>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>{t('drafts.table.id')}</th>
                                    <th>{t('drafts.table.date')}</th>
                                    <th>{t('drafts.table.customer')}</th>
                                    <th>{t('drafts.table.products')}</th>
                                    <th>{t('drafts.table.total')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('drafts.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drafts.map((draft, idx) => {
                                    const total = draft.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) - (draft.discount || 0);
                                    return (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{new Date(draft.timestamp).toLocaleString(t('language') === 'vi' ? 'vi-VN' : 'en-US')}</td>
                                            <td>
                                                {draft.customer ? (
                                                    <div>
                                                        <strong>{draft.customer.full_name}</strong>
                                                        <br />
                                                        <small style={{ color: '#666' }}>{draft.customer.phone}</small>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#999', fontStyle: 'italic' }}>{t('drafts.guest')}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge-qty">{t('drafts.productsCount', { count: draft.cart.length })}</span>
                                                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {draft.cart.map(i => i.name).join(', ')}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                                {formatCurrency(total)}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleResume(draft, idx)}
                                                        className="btn-view"
                                                        style={{
                                                            background: '#e3f2fd',
                                                            color: '#1976d2',
                                                            border: 'none',
                                                            width: '36px',
                                                            height: '36px',
                                                            padding: '0',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: '8px'
                                                        }}
                                                        title={t('common.view')}
                                                    >
                                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(idx)}
                                                        className="btn-view"
                                                        style={{
                                                            background: '#ffebee',
                                                            color: '#d32f2f',
                                                            border: 'none',
                                                            width: '36px',
                                                            height: '36px',
                                                            padding: '0',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: '8px'
                                                        }}
                                                        title={t('common.delete')}
                                                    >
                                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, index: null })}
                title={t('drafts.deleteTitle')}
                icon="🗑️"
                actions={
                    <>
                        <button className="modal-btn" onClick={() => setDeleteModal({ open: false, index: null })}>{t('common.cancel')}</button>
                        <button className="modal-btn" style={{ background: '#d32f2f', color: 'white' }} onClick={handleDelete}>{t('drafts.delete')}</button>
                    </>
                }
            >
                <p>{t('drafts.deleteConfirm')}</p>
                <p>{t('drafts.deleteWarning')}</p>
            </Modal>
        </div>
    );
};

export default DraftOrders;
