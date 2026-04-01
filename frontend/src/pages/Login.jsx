import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/RoleBadge';

const DEMO_ACCOUNTS = [
  { email: 'admin@zorvyn.com', password: 'admin123', role: 'ADMIN' },
  { email: 'analyst@zorvyn.com', password: 'analyst123', role: 'ANALYST' },
  { email: 'viewer@zorvyn.com', password: 'viewer123', role: 'VIEWER' },
];

const DEMO_USERS = {
  'admin@zorvyn.com': { name: 'Admin User', email: 'admin@zorvyn.com', role: 'ADMIN', status: 'ACTIVE', createdAt: '2024-01-15' },
  'analyst@zorvyn.com': { name: 'Analyst User', email: 'analyst@zorvyn.com', role: 'ANALYST', status: 'ACTIVE', createdAt: '2024-02-20' },
  'viewer@zorvyn.com': { name: 'Viewer User', email: 'viewer@zorvyn.com', role: 'VIEWER', status: 'ACTIVE', createdAt: '2024-03-10' },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const match = DEMO_ACCOUNTS.find((a) => a.email === email && a.password === password);
    if (!match) {
      setError('Invalid email or password.');
      return;
    }
    login(DEMO_USERS[email], 'demo-token');
    navigate('/dashboard');
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  const inputCls =
    'w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors duration-150';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
          <h1 className="text-indigo-400 font-bold text-2xl text-center">Zorvyn Finance</h1>
          <p className="text-slate-400 text-sm text-center mt-1 mb-6">Internal Dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
            />
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputCls}
            />
            {error && <p className="text-rose-400 text-xs">{error}</p>}
            <button
              type="submit"
              id="sign-in-btn"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors duration-150"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-5">
            <p className="text-slate-400 text-xs mb-3 font-medium">Demo Accounts</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  onClick={() => fillDemo(account)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors duration-150"
                >
                  <span className="text-slate-300 text-xs">{account.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">{account.password}</span>
                    <RoleBadge role={account.role} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
