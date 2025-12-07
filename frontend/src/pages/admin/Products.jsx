import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';

const AdminProducts = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>{t('admin.productList')}</h1>
                <Link to="/admin/products/new" className="btn-primary">+ {t('admin.addProduct')}</Link>
            </div>

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
