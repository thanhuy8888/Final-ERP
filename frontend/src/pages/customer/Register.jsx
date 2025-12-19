import { useState } from 'react';
import api from '../../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import Navbar from '../../components/Navbar';
import './Register.css';

const Register = () => {
    const { t } = useTranslation();
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
            setError(t('register.passwordMismatch'));
            return;
        }

        if (formData.password.length < 6) {
            setError(t('register.passwordTooShort'));
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/register.php', formData);
            if (response.data.success) {
                setMessage(t('register.success'));
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            setError(error.response?.data?.error || t('register.failed'));
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
                        <h2>{t('register.title')}</h2>
                        <p>{t('register.subtitle')}</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>{t('register.username')}</label>
                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder={t('register.usernamePlaceholder')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('register.email')}</label>
                            <div className="input-wrapper">
                                <span className="input-icon">📧</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={t('register.emailPlaceholder')}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group half">
                                <label>{t('register.password')}</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={t('register.passwordPlaceholder')}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group half">
                                <label>{t('register.confirmPassword')}</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        placeholder={t('register.confirmPlaceholder')}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    {t('register.processing')}
                                </>
                            ) : (
                                t('register.submit')
                            )}
                        </button>
                    </form>

                    <div className="divider">
                        <span>{t('register.or')}</span>
                    </div>

                    <p className="switch-text">
                        {t('register.hasAccount')} <Link to="/login">{t('register.loginNow')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
