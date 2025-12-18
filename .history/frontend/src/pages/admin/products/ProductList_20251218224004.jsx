import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { useTranslation } from '../../../hooks/useTranslation';
import { 
    Search, Plus, RefreshCw, Edit, Trash, Eye, 
    CheckCircle, XCircle, PackageSearch, ChevronRight, LayoutGrid 
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductList.css';

const ProductList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/products.php');
            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    useEffect(() => {
        let result = products;
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(lowerTerm) || p.sku?.toLowerCase().includes(lowerTerm));
        }
        if (categoryFilter) result = result.filter(p => p.category_name === categoryFilter);
        if (statusFilter) result = result.filter(p => p.status === statusFilter);
        setFilteredProducts(result);
    }, [searchTerm, categoryFilter, statusFilter, products]);

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await api.post('/admin/products.php', { id, action: 'toggle_status', status: newStatus });
            setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
            success(t('common.saveSuccess'));
        } catch (error) { showError("Error status update"); }
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete('/admin/products.php', { data: { id: deleteModal.id } });
            setProducts(products.filter(p => p.id !== deleteModal.id));
            setDeleteModal({ open: false, id: null });
            success(t('common.deleteSuccess'));
        } catch (error) { showError(t('common.deleteError')); } finally { setIsDeleting(false); }
    };

    const categories = [...new Set(products.map(p => p.category_name).filter(Boolean))];

    if (loading) return (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:'20px'}}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><RefreshCw size={50} color="#E31E24" /></motion.div>
            <p style={{fontWeight:700, color:'#1B2559'}}>{t('common.loading')}</p>
        </div>
    );

    return (
        <motion.div className="product-list-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="breadcrumb">
                <span>{t('admin.panel')}</span> <ChevronRight size={14} /> <span style={{color:'#4318FF'}}>{t('admin.products')}</span>
            </div>
            
            <header className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h1>{t('admin.productList')}</h1>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/admin/products/new" className="btn-primary" style={{textDecoration:'none'}}>
                        <Plus size={20} /> {t('admin.addProduct')}
                    </Link>
                </motion.div>
            </header>

            <section className="filter-bar">
                <div className="search-group">
                    <Search className="search-icon" size={20} style={{position:'absolute', left:'18px', top:'50%', transform:'translateY(-50%)', color:'#A3AED0'}} />
                    <input type="text" placeholder={t('admin.searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="filter-group">
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="">📁 {t('admin.categories')}</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">🔔 {t('common.allStatus')}</option>
                        <option value="active">{t('admin.promoStatus.active')}</option>
                        <option value="inactive">{t('orders.status.cancelled')}</option>
                    </select>
                    <button className="action-btn" onClick={fetchProducts}><RefreshCw size={18} /></button>
                </div>
            </section>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>{t('admin.image')}</th>
                            <th>{t('admin.productName')}</th>
                            <th>{t('admin.category')}</th>
                            <th>{t('admin.price')}</th>
                            <th>{t('admin.status')}</th>
                            <th style={{textAlign:'right'}}>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredProducts.map(product => (
                                <motion.tr key={product.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                                    <td style={{color:'#A3AED0'}}>#{product.id}</td>
                                    <td>
                                        <div className="img-wrapper">
                                            <img src={product.image || '/placeholder.jpg'} alt="" className="product-thumbnail" />
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{display:'flex', flexDirection:'column'}}>
                                            <span style={{fontSize:'16px', fontWeight:700}}>{product.name}</span>
                                            <span style={{fontSize:'12px', color:'#A3AED0', fontFamily:'monospace'}}>{product.sku || 'NO-SKU'}</span>
                                        </div>
                                    </td>
                                    <td><span style={{background:'#F4F7FE', padding:'6px 12px', borderRadius:'10px', fontSize:'12px'}}>{product.category_name}</span></td>
                                    <td style={{fontSize:'16px', fontWeight:800, color:'#4318FF'}}>{Number(product.price).toLocaleString()}₫</td>
                                    <td>
                                        <button className={`status-pill ${product.status}`} onClick={() => handleToggleStatus(product.id, product.status)}>
                                            {product.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {product.status.toUpperCase()}
                                        </button>
                                    </td>
                                    <td style={{textAlign:'right'}}>
                                        <Link to={`/admin/products/${product.id}`} className="action-btn view"><Eye size={18} /></Link>
                                        <Link to={`/admin/products/edit/${product.id}`} className="action-btn edit"><Edit size={18} /></Link>
                                        <button onClick={() => setDeleteModal({ open: true, id: product.id })} className="action-btn delete"><Trash size={18} /></button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Delete Modal - Màu mè rực rỡ */}
            <AnimatePresence>
                {deleteModal.open && (
                    <div className="modal-overlay" style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}} onClick={() => setDeleteModal({open:false})}>
                        <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="modal-content" style={{background:'#fff', padding:'40px', borderRadius:'30px', width:'400px', textAlign:'center'}} onClick={e=>e.stopPropagation()}>
                            <div style={{background:'#FDF2F2', width:'80px', height:'80px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'#EE5D50'}}>
                                <Trash size={40} />
                            </div>
                            <h2 style={{color:'#1B2559', marginBottom:'10px'}}>{t('admin.deleteProduct')}</h2>
                            <p style={{color:'#A3AED0', marginBottom:'30px'}}>{t('common.deleteConfirm')}</p>
                            <div style={{display:'flex', gap:'10px'}}>
                                <button className="status-pill inactive" style={{flex:1, padding:'15px', justifyContent:'center'}} onClick={() => setDeleteModal({open:false})}>{t('common.cancel')}</button>
                                <button className="btn-primary" style={{flex:1, justifyContent:'center'}} onClick={confirmDelete}>{isDeleting ? '...' : t('common.delete')}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductList;