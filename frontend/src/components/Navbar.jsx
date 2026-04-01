import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleBadge from './RoleBadge';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/profile', label: 'Profile' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="text-indigo-400 font-bold text-lg tracking-tight">Zorvyn Finance</span>
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-slate-400 hover:text-slate-100 text-sm px-3 py-1.5 rounded-lg transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
          {user?.role === 'ADMIN' && (
            <Link
              to="/users"
              className="text-slate-400 hover:text-slate-100 text-sm px-3 py-1.5 rounded-lg transition-colors duration-150"
            >
              Users
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-slate-300 text-sm">{user?.name}</span>
        {user?.role && <RoleBadge role={user.role} />}
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-rose-400 text-sm px-3 py-1.5 rounded-lg transition-colors duration-150"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
