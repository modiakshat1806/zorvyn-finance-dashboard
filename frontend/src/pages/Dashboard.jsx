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
import { StatCardSkeleton, ChartSkeleton } from '../components/Skeletons';

const tooltipStyle = {
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' },
  labelStyle: { color: '#94a3b8' },
};

const PIE_COLORS = ['#10b981', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-2xl animate-scale-in">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <span className="text-slate-500 text-xs font-medium">{entry.name}</span>
              <span className={`text-sm font-bold ${entry.name === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {entry.name === 'Income' ? '+' : '-'}{formatCurrency(Math.abs(entry.value))}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

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

const FilterButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
  >
    {label}
  </button>
);

const Dashboard = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  // Date filters
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' });
  const [activePreset, setActivePreset] = useState('ALL');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const loadData = async (filters = {}) => {
    setLoading(true);
    setApiError(''); // clear any old error
    try {
      const [summaryRes, txRes] = await Promise.all([
        transactionsAPI.getSummary(filters),
        transactionsAPI.getAll(filters),
      ]);
      setSummary(summaryRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error('[DASHBOARD_ERROR]', err);
      const msg = err.response?.data?.error || 'Failed to load dashboard data. Please check your connection.';
      setApiError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(); // Initial load (all-time)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyCustom = () => {
    setActivePreset('CUSTOM');
    loadData({ startDate: dateFilter.from, endDate: dateFilter.to });
  };

  const handlePreset = (preset) => {
    setActivePreset(preset);
    let from = '';
    let to = new Date().toISOString().split('T')[0];

    if (preset === '7D') {
      from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (preset === '30D') {
      from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else if (preset === 'MONTH') {
      const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      from = start.toISOString().split('T')[0];
    }

    setDateFilter({ from, to });
    if (preset === 'ALL') {
      setDateFilter({ from: '', to: '' });
      loadData({});
    } else {
      loadData({ startDate: from, endDate: to });
    }
  };

  const recentTransactions = useMemo(() => [...transactions].slice(0, 5), [transactions]);
  const monthlyData = useMemo(() => groupByMonth(transactions), [transactions]);
  const pieData = [
    { name: 'Income', value: summary.totalIncome },
    { name: 'Expense', value: summary.totalExpense },
  ];

  const categoryData = useMemo(() => {
    return Object.entries(summary.categoryTotals || {}).map(([name, totals]) => ({
      name,
      total: totals.income + totals.expense,
      income: totals.income,
      expense: totals.expense,
      isIncomeHeavy: totals.income >= totals.expense,
    })).sort((a, b) => b.total - a.total);
  }, [summary.categoryTotals]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-slate-100 text-xl font-semibold">Dashboard</h1>
          <span className="text-slate-400 text-sm font-medium">{today}</span>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <FilterButton label="All Time" active={activePreset === 'ALL'} onClick={() => handlePreset('ALL')} />
            <FilterButton label="Last 7 Days" active={activePreset === '7D'} onClick={() => handlePreset('7D')} />
            <FilterButton label="Last 30 Days" active={activePreset === '30D'} onClick={() => handlePreset('30D')} />
            <FilterButton label="This Month" active={activePreset === 'MONTH'} onClick={() => handlePreset('MONTH')} />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">From</label>
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">To</label>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleApplyCustom}
              disabled={!dateFilter.from || !dateFilter.to || loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
            >
              Apply
            </button>
          </div>
        </div>

        {apiError && (
          <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl px-5 py-4 animate-fade-in shadow-lg">
            <span className="text-rose-400 text-lg flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-rose-400 text-sm font-medium">{apiError}</p>
            </div>
            <button 
              onClick={() => loadData(activePreset === 'CUSTOM' ? { startDate: dateFilter.from, endDate: dateFilter.to } : {})} 
              className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-4 py-1.5 rounded-lg transition-transform active:scale-95"
            >
              Reload
            </button>
            <button onClick={() => setApiError('')} className="text-rose-400/40 hover:text-rose-400 transition-colors text-xl">×</button>
          </div>
        )}

          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {loading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <StatCard
                    label="Total Income"
                    variant="income"
                    value={formatCurrency(summary.totalIncome)}
                    trend={{ direction: 'up', label: activePreset === 'ALL' ? 'All-time income' : 'Filtered income' }}
                  />
                  <StatCard
                    label="Total Expenses"
                    variant="expense"
                    value={formatCurrency(summary.totalExpense)}
                    trend={{ direction: 'down', label: activePreset === 'ALL' ? 'All-time expenses' : 'Filtered expenses' }}
                  />
                  <StatCard
                    label="Net Balance"
                    variant="balance"
                    value={formatCurrency(summary.balance)}
                    trend={{
                      direction: summary.balance >= 0 ? 'up' : 'down',
                      label: summary.balance >= 0 ? 'Positive cash flow' : 'Negative cash flow',
                    }}
                  />
                </>
              )}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-5 gap-6 mb-8">
              {/* Bar Chart */}
              <div className="col-span-3">
                {loading ? (
                  <ChartSkeleton height={322} />
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h2 className="text-slate-300 text-sm font-medium mb-4">Monthly Income vs Expenses</h2>
                    {monthlyData.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-12">No data yet</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={monthlyData} barCategoryGap="30%">
                          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                          <Tooltip content={<CustomTooltip />} cursor={false} />
                          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: '10px' }} />
                          <Bar 
                            dataKey="income" 
                            name="Income" 
                            fill="#10b981" 
                            radius={[4, 4, 0, 0]} 
                            activeBar={{ opacity: 0.8, transform: 'scale(1.02)' }}
                          />
                          <Bar 
                            dataKey="expense" 
                            name="Expense" 
                            fill="#f43f5e" 
                            radius={[4, 4, 0, 0]} 
                            activeBar={{ opacity: 0.8, transform: 'scale(1.02)' }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </div>

              {/* Pie Chart */}
              <div className="col-span-2">
                {loading ? (
                  <ChartSkeleton height={322} />
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-full">
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
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
              <h2 className="text-slate-300 text-sm font-medium mb-4">Category Breakdown</h2>
              {loading ? (
                <ChartSkeleton height={200} />
              ) : categoryData.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-12">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData} layout="vertical" margin={{ left: 40, right: 40 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      width={100}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 shadow-2xl">
                              <p className="text-slate-200 text-sm font-bold mb-2">{data.name}</p>
                              <div className="space-y-1">
                                <div className="flex justify-between gap-4">
                                  <span className="text-slate-500 text-xs text-left">Total:</span>
                                  <span className="text-slate-100 text-xs font-bold">{formatCurrency(data.total)}</span>
                                </div>
                                {data.income > 0 && (
                                  <div className="flex justify-between gap-4">
                                    <span className="text-slate-500 text-xs text-left">Income:</span>
                                    <span className="text-emerald-400 text-xs">{formatCurrency(data.income)}</span>
                                  </div>
                                )}
                                {data.expense > 0 && (
                                  <div className="flex justify-between gap-4">
                                    <span className="text-slate-500 text-xs text-left">Expense:</span>
                                    <span className="text-rose-400 text-xs">{formatCurrency(data.expense)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isIncomeHeavy ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
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
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Dashboard;
