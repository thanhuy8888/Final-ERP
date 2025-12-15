import axios from 'axios';

// Backend API URL - configurable via .env file
// Default: http://localhost:8081/Final-ERP/api
// To change: Copy .env.example to .env and update VITE_API_URL
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/Final-ERP/api';

const api = axios.create({
    baseURL: baseURL,
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

