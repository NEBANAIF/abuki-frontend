/**
 * ─────────────────────────────────────────────────────────────────────────
 *  api.js — Central Axios service with JWT auth and role-aware endpoints
 *
 *  Key additions for role-based auth:
 *    - getSalesToday() → calls /api/sales/today (worker + admin)
 *    - getSales()      → calls /api/sales (admin only; 403 for workers)
 *
 *  The frontend decides which to call based on user.role stored in localStorage.
 * ─────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://abuki-backend.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT token to every request ─────────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('abuki_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Handle 401 (session invalid) and 403 (role denied) ────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    // 401 — token expired or missing → force logout
    if (err.response?.status === 401) {
      localStorage.removeItem('abuki_token');
      localStorage.removeItem('abuki_user');
      if (!window.location.pathname.includes('login')) window.location.href = '/';
    }
    // Extract the best error message from response body
    const data = err.response?.data;
    const msg = (data && typeof data === 'object' && data.error) ? data.error
      : typeof data === 'string' ? data
      : err.message || 'Error';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
  }
);

// ── AUTH ───────────────────────────────────────────────────────────────────
export const login  = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data);
export const getMe  = () => api.get('/auth/me').then(r => r.data);

// ── USERS (ADMIN only — returns 403 for WORKER) ───────────────────────────
export const getUsers    = ()         => api.get('/users').then(r => r.data);
export const createUser  = (data)     => api.post('/users', data).then(r => r.data);
export const updateUser  = (id, data) => api.put(`/users/${id}`, data).then(r => r.data);
export const deleteUser  = (id)       => api.delete(`/users/${id}`).then(r => r.data);

// ── PRODUCTS ───────────────────────────────────────────────────────────────
// GET endpoints are allowed for both ADMIN and WORKER
// POST/PUT/DELETE endpoints return 403 for WORKER
export const getProducts    = ()           => api.get('/products').then(r => r.data);
export const getProductById = (id)         => api.get(`/products/${id}`).then(r => r.data);
export const searchProducts = (keyword)    => api.get(`/products/search?keyword=${encodeURIComponent(keyword)}`).then(r => r.data);
export const getLowStock    = ()           => api.get('/products/low-stock').then(r => r.data);
export const getOutOfStock  = ()           => api.get('/products/out-of-stock').then(r => r.data);
export const createProduct  = (data)       => api.post('/products', data).then(r => r.data);
export const updateProduct  = (id, data)   => api.put(`/products/${id}`, data).then(r => r.data);
export const deleteProduct  = (id)         => api.delete(`/products/${id}`).then(r => r.data);
export const adjustStock    = (id, qty, reason = 'Stock adjustment', user = 'Admin') =>
  api.post(`/products/${id}/adjust-stock`, null, { params: { quantity: qty, reason, user } }).then(r => r.data);
export const addStock = adjustStock;

// ── SALES ──────────────────────────────────────────────────────────────────
// getSales()      → ADMIN only (all historical sales)
// getSalesToday() → ADMIN + WORKER (today's sales only)
// recordSale()    → ADMIN + WORKER (create new sale)
// deleteSale()    → ADMIN only (returns 403 for WORKER)
export const getSales      = ()     => api.get('/sales').then(r => r.data);
export const getSalesToday = ()     => api.get('/sales/today').then(r => r.data);
export const getSaleById   = (id)   => api.get(`/sales/${id}`).then(r => r.data);
export const recordSale    = (data) => api.post('/sales', data).then(r => r.data);
export const deleteSale    = (id)   => api.delete(`/sales/${id}`).then(r => r.data);

// ── ANALYTICS (ADMIN only — returns 403 for WORKER) ───────────────────────
export const getAnalyticsDashboard = (params) =>
  api.get('/analytics/dashboard', { params }).then(r => r.data);

// ── EXPENSES / FINANCE (ADMIN only — returns 403 for WORKER) ──────────────
export const getExpenses   = ()         => api.get('/expenses').then(r => r.data);
export const createExpense = (data)     => api.post('/expenses', data).then(r => r.data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data).then(r => r.data);
export const deleteExpense = (id)       => api.delete(`/expenses/${id}`).then(r => r.data);

// ── STOCK HISTORY (ADMIN only — returns 403 for WORKER) ───────────────────
export const getStockHistory          = ()   => api.get('/stock-history').then(r => r.data);
export const getStockHistoryByProduct = (id) => api.get(`/stock-history/product/${id}`).then(r => r.data);
export const deleteStockHistory       = (id) => api.delete(`/stock-history/${id}`).then(r => r.data);

export const stockHistoryAPI = {
  getAll:  getStockHistory,
  delete:  deleteStockHistory,
};

export default api;
