import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost/Final%20ERP/api', // Adjust if your local path differs
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export default api;
