import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleBadge from './RoleBadge';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬛' },
  { to: '/transactions', label: 'Transactions', icon: '↕' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14">

        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-lg group-hover:shadow-indigo-500/40 transition-shadow duration-200">
              Z
            </div>
            <span className="text-slate-100 font-semibold text-sm tracking-tight">Zorvyn Finance</span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={[
                  'relative text-sm px-3 py-1.5 rounded-lg transition-all duration-150',
                  isActive(to)
                    ? 'text-slate-100 bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
                ].join(' ')}
              >
                {label}
                {isActive(to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-500 rounded-full" />
                )}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link
                to="/users"
                className={[
                  'relative text-sm px-3 py-1.5 rounded-lg transition-all duration-150',
                  isActive('/users')
                    ? 'text-slate-100 bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
                ].join(' ')}
              >
                Users
              </Link>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* User info */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <span className="text-slate-300 text-sm font-medium max-w-[120px] truncate">{user?.name}</span>
            {user?.role && <RoleBadge role={user.role} />}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 text-sm px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-all duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
