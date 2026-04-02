import api from './axios';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersAPI = {
  /** GET /users — ADMIN only, returns full user list for filter dropdown */
  getAll: () => api.get('/users'),
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionsAPI = {
  /**
   * GET /transactions
   * Filters: { type, category, startDate, endDate, userId }
   * userId is only respected by the backend if requester is ADMIN
   */
  getAll: (filters = {}) => {
    const params = {};
    if (filters.type && filters.type !== 'ALL') params.type = filters.type;
    if (filters.category && filters.category !== 'ALL') params.category = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.userId && filters.userId !== 'ALL') params.userId = filters.userId;
    return api.get('/transactions', { params });
  },

  /** GET /transactions/:id — full detail including user relation */
  getById: (id) => api.get(`/transactions/${id}`),

  /** POST /transactions */
  create: (data) => api.post('/transactions', data),

  /** DELETE /transactions/:id */
  delete: (id) => api.delete(`/transactions/${id}`),

  /**
   * GET /transactions/summary
   * Optional date range: { startDate, endDate }
   */
  getSummary: (params = {}) => api.get('/transactions/summary', { params }),
};
