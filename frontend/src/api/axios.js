import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081/Final-ERP/api', // Fixed path to match filesystem
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

