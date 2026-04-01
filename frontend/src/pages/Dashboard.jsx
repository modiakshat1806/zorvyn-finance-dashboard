import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import { formatCurrency, formatDate } from '../utils/formatters';

const MONTHLY_DATA = [
  { month: 'Nov', income: 4200, expense: 2800 },
  { month: 'Dec', income: 5100, expense: 3200 },
  { month: 'Jan', income: 3800, expense: 2900 },
  { month: 'Feb', income: 4600, expense: 3100 },
  { month: 'Mar', income: 5400, expense: 2700 },
  { month: 'Apr', income: 4900, expense: 3400 },
];

const RECENT_TRANSACTIONS = [
  { id: 1, emoji: '💼', description: 'April Salary', amount: 4900, type: 'INCOME', date: '2026-04-01' },
  { id: 2, emoji: '🏠', description: 'Rent Payment', amount: -1200, type: 'EXPENSE', date: '2026-04-01' },
  { id: 3, emoji: '🍔', description: 'Team Lunch', amount: -85, type: 'EXPENSE', date: '2026-03-31' },
  { id: 4, emoji: '📈', description: 'Consulting Fee', amount: 1500, type: 'INCOME', date: '2026-03-30' },
  { id: 5, emoji: '⚡', description: 'Electricity Bill', amount: -140, type: 'EXPENSE', date: '2026-03-29' },
];

const totalIncome = 24000;
const totalExpenses = 18100;
const netBalance = totalIncome - totalExpenses;

const tooltipStyle = {
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' },
  labelStyle: { color: '#94a3b8' },
};

const Dashboard = () => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-slate-100 text-xl font-semibold">Dashboard</h1>
          <span className="text-slate-400 text-sm">{today}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Income" value={formatCurrency(totalIncome)} trend={{ direction: 'up', label: '↑ 8% from last month' }} />
          <StatCard label="Total Expenses" value={formatCurrency(totalExpenses)} trend={{ direction: 'down', label: '↑ 3% from last month' }} />
          <StatCard
            label="Net Balance"
            value={formatCurrency(netBalance)}
            trend={{ direction: netBalance >= 0 ? 'up' : 'down', label: netBalance >= 0 ? 'Positive cash flow' : 'Negative cash flow' }}
          />
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-slate-300 text-sm font-medium mb-4">Monthly Income vs Expenses</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHLY_DATA} barCategoryGap="30%">
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip {...tooltipStyle} formatter={(v) => formatCurrency(v)} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-slate-300 text-sm font-medium mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {RECENT_TRANSACTIONS.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tx.emoji}</span>
                    <div>
                      <p className="text-slate-200 text-sm">{tx.description}</p>
                      <p className="text-slate-500 text-xs">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'INCOME' ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
