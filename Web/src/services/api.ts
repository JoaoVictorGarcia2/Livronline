// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Sua URL base do backend

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar o Token JWT automaticamente às requisições (se existir)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Nome que usaremos para guardar o token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;