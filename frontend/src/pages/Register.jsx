import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            const response = await api.post('/register.php', formData);
            if (response.data.success) {
                setMessage('Đăng ký thành công! Đang chuyển hướng...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="register-container">
            <h2>Đăng ký tài khoản</h2>
            {error && <p className="error">{error}</p>}
            {message && <p className="success">{message}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Tên đăng nhập:</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                    <label>Mật khẩu:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div>
                    <label>Xác nhận mật khẩu:</label>
                    <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required />
                </div>
                <button type="submit">Đăng ký</button>
            </form>
        </div>
    );
};

export default Register;
