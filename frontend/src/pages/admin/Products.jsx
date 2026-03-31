import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';

const AdminProducts = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products.php');
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm(t('admin.deleteProduct') + '?')) return;

        try {
            await api.delete('/admin/products.php', { data: { id } });
            fetchProducts();
        } catch (error) {
            console.error("Failed to delete product", error);
        }
    };

    const handleExport = () => {
        window.open('http://localhost:8081/Final-ERP/api/admin/products-import-export.php?action=export', '_blank');
    };

    const handleDownloadTemplate = () => {
        window.open('http://localhost:8081/Final-ERP/api/admin/products-import-export.php?action=template', '_blank');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        setImportResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/admin/products-import-export.php?action=import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setImportResult(response.data);
            fetchProducts();
        } catch (error) {
            setImportResult({
                success: false,
                message: error.response?.data?.error || 'Import failed'
            });
        } finally {
            setImporting(false);
            e.target.value = '';
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>{t('admin.productList')}</h1>
                <div className="header-actions">
                    <button onClick={handleDownloadTemplate} className="btn-secondary">
                        📋 {t('products.template')}
                    </button>
                    <button onClick={handleExport} className="btn-secondary">
                        📥 {t('products.export')}
                    </button>
                    <button onClick={handleImportClick} className="btn-secondary" disabled={importing}>
                        {importing ? '⏳ ' : '📤 '}{t('products.import')}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <Link to="/admin/products/new" className="btn-primary">+ {t('admin.addProduct')}</Link>
                </div>
            </div>

            {importResult && (
                <div className={`import-result ${importResult.success ? 'success' : 'error'}`}>
                    <span>{importResult.message}</span>
                    <button onClick={() => setImportResult(null)}>✕</button>
                </div>
            )}

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('admin.image')}</th>
                            <th>{t('admin.productName')}</th>
                            <th>Category</th>
                            <th>{t('admin.price')}</th>
                            <th>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>{product.id}</td>
                                <td>
                                    <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.category_name || 'N/A'}</td>
                                <td>{parseInt(product.price).toLocaleString()}{t('common.currency')}</td>
                                <td>
                                    <Link to={`/admin/products/edit/${product.id}`} className="btn-edit">✏️</Link>
                                    <button onClick={() => handleDelete(product.id)} className="btn-danger">🗑️ {t('common.delete')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;

