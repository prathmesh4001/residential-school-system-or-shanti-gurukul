/* ============================================================
   Axios API Client — Shanti Gurukul Frontend
   ============================================================ */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
});

/* ── Attach JWT to every request ── */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sgToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ── Handle 401 globally — redirect to login (skip for /auth/login so component can show error) ── */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem('sgToken');
      localStorage.removeItem('sgUser');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
