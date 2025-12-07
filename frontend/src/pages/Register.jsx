import { useState } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error when typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirm_password) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/register.php', formData);
            if (response.data.success) {
                setMessage('Đăng ký thành công! Đang chuyển hướng...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <Navbar />
            <div className="register-container">
                <div className="register-box">
                    <div className="register-header">
                        <h2>TẠO TÀI KHOẢN</h2>
                        <p>Đăng ký để nhận ưu đãi độc quyền</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Tên đăng nhập</label>
                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <span className="input-icon">📧</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập email của bạn"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>Mật khẩu</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Tối thiểu 6 ký tự"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group half">
                                <label>Xác nhận mật khẩu</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        placeholder="Nhập lại mật khẩu"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Đang xử lý...
                                </>
                            ) : (
                                'ĐĂNG KÝ NGAY'
                            )}
                        </button>
                    </form>

                    <div className="divider">
                        <span>hoặc</span>
                    </div>

                    <p className="switch-text">
                        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
