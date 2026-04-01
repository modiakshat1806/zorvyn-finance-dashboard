import Navbar from '../components/Navbar';
import RoleBadge from '../components/RoleBadge';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

const StatusBadge = ({ status }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
    {status}
  </span>
);

const Profile = () => {
  const { user } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
            {initials}
          </div>
          <div className="text-center">
            <h1 className="text-slate-100 font-semibold text-xl">{user?.name}</h1>
            <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <RoleBadge role={user?.role} />
            <StatusBadge status={user?.status ?? 'ACTIVE'} />
          </div>
          <div className="w-full border-t border-slate-800 pt-4 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Member Since</span>
              <span className="text-slate-200">{user?.createdAt ? formatDate(user.createdAt) : '—'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
