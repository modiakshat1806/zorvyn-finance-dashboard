import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import Toast from '../components/Toast';
import { formatCurrency, formatDate } from '../utils/formatters';
import { transactionsAPI } from '../api/api';
import { useToast } from '../hooks/useToast';

const tooltipStyle = {
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' },
  labelStyle: { color: '#94a3b8' },
};

const PIE_COLORS = ['#10b981', '#f43f5e'];

// Group a flat list of transactions into monthly totals for the bar chart
const groupByMonth = (transactions) => {
  const map = {};
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
    if (t.type === 'INCOME') map[key].income += Number(t.amount);
    else map[key].expense += Number(t.amount);
  });
  // Return last 6 months (or fewer)
  return Object.values(map).slice(-6);
};

const Spinner = () => (
  <div className="flex items-center justify-center h-40">
    <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  </div>
);

const Dashboard = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [summaryRes, txRes] = await Promise.all([
          transactionsAPI.getSummary(),
          transactionsAPI.getAll(),
        ]);
        setSummary(summaryRes.data);
        setTransactions(txRes.data);
      } catch (err) {
        const msg = err.response?.data?.error || 'Failed to load dashboard data.';
        setError(msg);
        addToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recentTransactions = useMemo(() => [...transactions].slice(0, 5), [transactions]);
  const monthlyData = useMemo(() => groupByMonth(transactions), [transactions]);
  const pieData = [
    { name: 'Income', value: summary.totalIncome },
    { name: 'Expense', value: summary.totalExpense },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-slate-100 text-xl font-semibold">Dashboard</h1>
          <span className="text-slate-400 text-sm">{today}</span>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 animate-fade-in">
            <span className="text-rose-400 font-bold flex-shrink-0">✕</span>
            <p className="text-rose-400 text-sm">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-rose-400/60 hover:text-rose-400 transition-colors text-xs">✕</button>
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <StatCard
                label="Total Income"
                value={formatCurrency(summary.totalIncome)}
                trend={{ direction: 'up', label: 'All-time income' }}
              />
              <StatCard
                label="Total Expenses"
                value={formatCurrency(summary.totalExpense)}
                trend={{ direction: 'down', label: 'All-time expenses' }}
              />
              <StatCard
                label="Net Balance"
                value={formatCurrency(summary.balance)}
                trend={{
                  direction: summary.balance >= 0 ? 'up' : 'down',
                  label: summary.balance >= 0 ? 'Positive cash flow' : 'Negative cash flow',
                }}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-5 gap-4 mb-4">
              {/* Bar Chart */}
              <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h2 className="text-slate-300 text-sm font-medium mb-4">Monthly Income vs Expenses</h2>
                {monthlyData.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-12">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={monthlyData} barCategoryGap="30%">
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                      <Tooltip {...tooltipStyle} formatter={(v) => formatCurrency(v)} />
                      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                      <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Pie Chart */}
              <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                <h2 className="text-slate-300 text-sm font-medium mb-4">Income vs Expense Split</h2>
                {summary.totalIncome === 0 && summary.totalExpense === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-12">No data yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip {...tooltipStyle} formatter={(v) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-2">
                      {pieData.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                          <span className="text-slate-400 text-xs">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-slate-300 text-sm font-medium mb-4">Recent Transactions</h2>
              {recentTransactions.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {tx.type === 'INCOME' ? '↑' : '↓'}
                        </div>
                        <div>
                          <p className="text-slate-200 text-sm">{tx.category}</p>
                          <p className="text-slate-500 text-xs">{formatDate(tx.date)}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(Number(tx.amount)))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Dashboard;
