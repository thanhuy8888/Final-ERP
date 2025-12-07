import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost/Final-ERP/api', // Adjust if your local path differs
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to include language header for i18n email support
api.interceptors.request.use((config) => {
    const language = localStorage.getItem('language') || 'vi';
    config.headers['X-Language'] = language;
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;

