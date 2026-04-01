import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import RoleGuard from '../components/RoleGuard';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { formatCurrency, formatDate } from '../utils/formatters';
import { transactionsAPI } from '../api/api';
import { useToast } from '../hooks/useToast';

const CATEGORIES = ['Salary', 'Rent', 'Food', 'Utilities', 'Consulting', 'Travel', 'Healthcare', 'Other'];
const PAGE_SIZE = 5;
const EMPTY_FORM = { amount: '', type: 'INCOME', category: 'Salary', date: '', notes: '' };
const EMPTY_FILTERS = { type: 'ALL', category: 'ALL', dateFrom: '', dateTo: '' };

// ── Helpers ────────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
    {type}
  </span>
);

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <svg className="animate-spin h-7 w-7 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  </div>
);

// ── Form validation ────────────────────────────────────────────────────────────
const validateForm = (form) => {
  const errs = {};
  if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
    errs.amount = 'Enter a valid amount greater than 0.';
  if (!form.date) errs.date = 'Date is required.';
  return errs;
};

// ── Main Component ─────────────────────────────────────────────────────────────
const Transactions = () => {
  const { toasts, addToast, removeToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Filters
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  // Modal / form
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null); // tx object

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (f = EMPTY_FILTERS) => {
    setLoading(true);
    setApiError('');
    try {
      const { data } = await transactionsAPI.getAll({
        type: f.type,
        category: f.category,
        startDate: f.dateFrom,
        endDate: f.dateTo,
      });
      setTransactions(data);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(appliedFilters);
  }, [appliedFilters, fetchTransactions]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setFormErrors({});
  };

  // ── Add transaction ────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await transactionsAPI.create({
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        notes: form.notes,
      });
      closeModal();
      fetchTransactions(appliedFilters);
      addToast('Transaction added successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save transaction.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete (with confirmation) ─────────────────────────────────────────────
  const requestDelete = (tx) => setDeleteTarget(tx);
  const cancelDelete = () => setDeleteTarget(null);

  const confirmDelete = async () => {
    const tx = deleteTarget;
    setDeleteTarget(null);
    // Optimistic removal
    setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
    try {
      await transactionsAPI.delete(tx.id);
      addToast('Transaction deleted.', 'success');
    } catch (err) {
      // Rollback
      fetchTransactions(appliedFilters);
      addToast(err.response?.data?.error || 'Failed to delete transaction.', 'error');
    }
  };

  // ── Filters ────────────────────────────────────────────────────────────────
  const applyFilters = () => { setAppliedFilters(filters); setPage(1); };
  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };

  // ── Shared CSS ─────────────────────────────────────────────────────────────
  const selectCls = 'bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors duration-150';
  const inputCls = 'bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors duration-150';
  const modalInputCls = (field) =>
    `bg-slate-800 border ${formErrors[field] ? 'border-rose-500' : 'border-slate-700'} text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors duration-150 w-full`;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-slate-100 text-xl font-semibold">Transactions</h1>
          <RoleGuard allowedRoles={['ADMIN', 'ANALYST']}>
            <button
              id="add-transaction-btn"
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm px-4 py-2 rounded-lg transition-all duration-150"
            >
              + Add Transaction
            </button>
          </RoleGuard>
        </div>

        {/* API error banner */}
        {apiError && (
          <div className="mb-4 flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 animate-fade-in">
            <span className="text-rose-400 font-bold flex-shrink-0">✕</span>
            <p className="text-rose-400 text-sm flex-1">{apiError}</p>
            <button onClick={() => setApiError('')} className="text-rose-400/60 hover:text-rose-400 transition-colors text-xs">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-end gap-3 mb-6">
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">Type</label>
            <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} className={selectCls}>
              <option value="ALL">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">Category</label>
            <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))} className={selectCls}>
              <option value="ALL">All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">From</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-slate-400 text-xs">To</label>
            <input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} className={inputCls} />
          </div>
          <button onClick={applyFilters} className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm px-4 py-2 rounded-lg transition-all duration-150">
            Apply
          </button>
          <button onClick={resetFilters} className="text-slate-400 hover:text-slate-200 text-sm transition-colors duration-150">
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <Spinner />
          ) : paginated.length === 0 ? (
            <EmptyState message="No transactions found." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Date', 'Category', 'Type', 'Amount', 'Notes', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-slate-400 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors duration-150">
                    <td className="px-4 py-3 text-slate-400">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3 text-slate-200">{tx.category}</td>
                    <td className="px-4 py-3"><TypeBadge type={tx.type} /></td>
                    <td className={`px-4 py-3 font-medium ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(Number(tx.amount)))}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{tx.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <RoleGuard allowedRoles={['ADMIN']}>
                        <button
                          onClick={() => requestDelete(tx)}
                          className="text-slate-500 hover:text-rose-400 transition-colors duration-150 hover:scale-110 active:scale-95"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </RoleGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </main>

      {/* ── Add Transaction Modal ─────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col gap-5 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-100 font-semibold text-lg">Add Transaction</h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-300 transition-colors text-xl leading-none">×</button>
            </div>

            <div className="space-y-4 flex-1">
              {/* Amount */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-xs">Amount <span className="text-rose-500">*</span></label>
                <input
                  type="number"
                  value={form.amount}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  onChange={(e) => {
                    setForm((f) => ({ ...f, amount: e.target.value }));
                    if (formErrors.amount) setFormErrors((prev) => ({ ...prev, amount: '' }));
                  }}
                  className={modalInputCls('amount')}
                />
                {formErrors.amount && <p className="text-rose-400 text-xs mt-0.5">{formErrors.amount}</p>}
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-xs">Date <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, date: e.target.value }));
                    if (formErrors.date) setFormErrors((prev) => ({ ...prev, date: '' }));
                  }}
                  className={modalInputCls('date')}
                />
                {formErrors.date && <p className="text-rose-400 text-xs mt-0.5">{formErrors.date}</p>}
              </div>

              {/* Type */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-xs">Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={modalInputCls()}>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-xs">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={modalInputCls()}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-xs">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Optional note..."
                  className={`${modalInputCls()} resize-none`}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] text-white text-sm py-2.5 rounded-lg transition-all duration-150 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Adding…
                  </>
                ) : 'Save Transaction'}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-300 text-sm py-2.5 rounded-lg transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] animate-fade-in px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-rose-400 text-xl">🗑️</span>
            </div>
            <h3 className="text-slate-100 font-semibold text-base text-center mb-1">Delete Transaction</h3>
            <p className="text-slate-400 text-sm text-center mb-1">
              Are you sure you want to delete this transaction?
            </p>
            {/* Transaction preview */}
            <div className="my-4 bg-slate-800 rounded-lg px-4 py-3 text-center">
              <p className="text-slate-300 text-sm font-medium">{deleteTarget.category}</p>
              <p className={`text-sm font-semibold mt-0.5 ${deleteTarget.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {deleteTarget.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(Number(deleteTarget.amount)))}
              </p>
            </div>
            <p className="text-slate-500 text-xs text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-sm py-2.5 rounded-lg transition-all duration-150 font-medium"
              >
                Confirm Delete
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-300 text-sm py-2.5 rounded-lg transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ─────────────────────────────────────────────────────────── */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Transactions;
