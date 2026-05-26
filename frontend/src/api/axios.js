import axios from 'axios';

//conexão com backend
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Interceptor para adicionar o token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('liblink_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
