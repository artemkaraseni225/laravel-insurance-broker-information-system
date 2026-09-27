import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api');

const api = axios.create({
  baseURL,
});

// Подставляем токен из localStorage в каждый запрос, если он уже есть
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
