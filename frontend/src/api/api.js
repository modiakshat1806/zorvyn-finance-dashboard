import api from './axios';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionsAPI = {
  /**
   * GET /transactions
   * Supports optional filters: { type, category, startDate, endDate }
   */
  getAll: (filters = {}) => {
    const params = {};
    if (filters.type && filters.type !== 'ALL') params.type = filters.type;
    if (filters.category && filters.category !== 'ALL') params.category = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    return api.get('/transactions', { params });
  },

  /** POST /transactions */
  create: (data) => api.post('/transactions', data),

  /** DELETE /transactions/:id */
  delete: (id) => api.delete(`/transactions/${id}`),

  /** GET /transactions/summary → { totalIncome, totalExpense, balance } */
  getSummary: () => api.get('/transactions/summary'),
};
