import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/api';
import { decodeToken } from '../utils/auth';
import RoleBadge from '../components/RoleBadge';

const DEMO_ACCOUNTS = [
  { email: 'admin@zorvyn.com', password: 'admin123', role: 'ADMIN' },
  { email: 'analyst@zorvyn.com', password: 'analyst123', role: 'ANALYST' },
  { email: 'viewer@zorvyn.com', password: 'viewer123', role: 'VIEWER' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      const { token, user } = data;
      // Decode role from token as fallback
      const decoded = decodeToken(token);
      const userData = {
        id: user?.id ?? decoded?.userId,
        name: user?.name ?? email,
        role: user?.role ?? decoded?.role ?? 'VIEWER',
      };
      login(userData, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
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
            {error && (
              <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2.5 animate-fade-in">
                <span className="text-rose-400 font-bold text-sm flex-shrink-0">✕</span>
                <p className="text-rose-400 text-xs leading-snug">{error}</p>
              </div>
            )}
            <button
              type="submit"
              id="sign-in-btn"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing In…
                </>
              ) : (
                'Sign In'
              )}
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

          <p className="text-slate-500 text-xs text-center mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
