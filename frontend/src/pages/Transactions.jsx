import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import RoleGuard from '../components/RoleGuard';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Salary', 'Rent', 'Food', 'Utilities', 'Consulting', 'Travel', 'Healthcare', 'Other'];

const PLACEHOLDER_TRANSACTIONS = [
  { id: 1, date: '2026-04-01', category: 'Salary', type: 'INCOME', amount: 4900, notes: 'April salary' },
  { id: 2, date: '2026-04-01', category: 'Rent', type: 'EXPENSE', amount: 1200, notes: 'Monthly rent' },
  { id: 3, date: '2026-03-31', category: 'Food', type: 'EXPENSE', amount: 85, notes: 'Team lunch' },
  { id: 4, date: '2026-03-30', category: 'Consulting', type: 'INCOME', amount: 1500, notes: 'Client project' },
  { id: 5, date: '2026-03-29', category: 'Utilities', type: 'EXPENSE', amount: 140, notes: 'Electricity' },
  { id: 6, date: '2026-03-28', category: 'Travel', type: 'EXPENSE', amount: 320, notes: 'Business trip' },
  { id: 7, date: '2026-03-27', category: 'Salary', type: 'INCOME', amount: 2000, notes: 'Bonus' },
];

const PAGE_SIZE = 5;

const EMPTY_FORM = { amount: '', type: 'INCOME', category: 'Salary', date: '', notes: '' };

const TypeBadge = ({ type }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
    {type}
  </span>
);

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(PLACEHOLDER_TRANSACTIONS);
  const [filters, setFilters] = useState({ type: 'ALL', category: 'ALL', dateFrom: '', dateTo: '' });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (activeFilters.type !== 'ALL' && t.type !== activeFilters.type) return false;
      if (activeFilters.category !== 'ALL' && t.category !== activeFilters.category) return false;
      if (activeFilters.dateFrom && t.date < activeFilters.dateFrom) return false;
      if (activeFilters.dateTo && t.date > activeFilters.dateTo) return false;
      return true;
    });
  }, [transactions, activeFilters]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModalOpen(true); };
  const openEdit = (tx) => { setForm({ ...tx, amount: String(tx.amount) }); setEditTarget(tx.id); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSave = () => {
    const tx = { ...form, amount: parseFloat(form.amount) };
    if (editTarget) {
      setTransactions((prev) => prev.map((t) => (t.id === editTarget ? { ...tx, id: editTarget } : t)));
    } else {
      setTransactions((prev) => [{ ...tx, id: Date.now() }, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id) => setTransactions((prev) => prev.filter((t) => t.id !== id));

  const applyFilters = () => { setActiveFilters(filters); setPage(1); };
  const resetFilters = () => { const empty = { type: 'ALL', category: 'ALL', dateFrom: '', dateTo: '' }; setFilters(empty); setActiveFilters(empty); setPage(1); };

  const selectCls = 'bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors duration-150';
  const inputCls = 'bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors duration-150';

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-slate-100 text-xl font-semibold">Transactions</h1>
          <RoleGuard allowedRoles={['ADMIN', 'ANALYST']}>
            <button
              id="add-transaction-btn"
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-150"
            >
              + Add Transaction
            </button>
          </RoleGuard>
        </div>

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
          <button onClick={applyFilters} className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors duration-150">Apply</button>
          <button onClick={resetFilters} className="text-slate-400 hover:text-slate-200 text-sm transition-colors duration-150">Reset</button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {paginated.length === 0 ? (
            <EmptyState message="No transactions match your filters." />
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
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{tx.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <RoleGuard allowedRoles={['ADMIN']}>
                          <button onClick={() => openEdit(tx)} className="text-slate-400 hover:text-indigo-400 transition-colors duration-150" title="Edit">✏️</button>
                          <button onClick={() => handleDelete(tx.id)} className="text-slate-400 hover:text-rose-400 transition-colors duration-150" title="Delete">🗑️</button>
                        </RoleGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </main>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col gap-5 overflow-y-auto">
            <h2 className="text-slate-100 font-semibold text-lg">{editTarget ? 'Edit Transaction' : 'Add Transaction'}</h2>
            <div className="space-y-4 flex-1">
              {[
                { label: 'Amount', type: 'number', field: 'amount', placeholder: '0.00' },
                { label: 'Date', type: 'date', field: 'date' },
              ].map(({ label, type, field, placeholder }) => (
                <div key={field} className="flex flex-col gap-1">
                  <label className="text-slate-400 text-xs">{label}</label>
                  <input
                    type={type}
                    value={form[field]}
                    placeholder={placeholder}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors duration-150"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-xs">Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors duration-150">
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-xs">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors duration-150">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-xs">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors duration-150 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-2.5 rounded-lg transition-colors duration-150">Save</button>
              <button onClick={closeModal} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm py-2.5 rounded-lg transition-colors duration-150">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
