import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost/inventory-tracker/backend';

const api = axios.create({ baseURL: API_BASE });

// ① REQUEST interceptor — adds Bearer token before every call
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ② RESPONSE interceptor — auto-logout if server returns 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('inv_token');
      localStorage.removeItem('inv_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;