import axios from 'axios';

const api = axios.create({
    baseURL: 'https://workpulse-backend-bagchcfsh6h5dxbz.eastasia-01.azurewebsites.net/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
