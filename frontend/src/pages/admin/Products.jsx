import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const AdminProducts = () => {
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
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

        try {
            await api.delete('/admin/products.php', { data: { id } });
            fetchProducts();
        } catch (error) {
            console.error("Failed to delete product", error);
            alert('Xóa sản phẩm thất bại');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="admin-header">
                <h1>Quản lý sản phẩm</h1>
                <Link to="/admin/products/new" className="btn-primary">+ Thêm sản phẩm mới</Link>
            </div>

            <div className="admin-card">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Hành động</th>
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
                                <td>{parseInt(product.price).toLocaleString()}đ</td>
                                <td>
                                    <Link to={`/admin/products/edit/${product.id}`} className="btn-edit">✏️</Link>
                                    <button onClick={() => handleDelete(product.id)} className="btn-danger">🗑️ Xóa</button>
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
