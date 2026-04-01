import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.startsWith('/auth/');
    // Only force-redirect on 401 for protected routes, NOT for login/register calls.
    // If we redirected on login failures the error would never reach Login.jsx's catch block.
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
