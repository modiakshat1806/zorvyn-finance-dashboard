import { useState } from 'react';
import Navbar from '../components/Navbar';
import RoleBadge from '../components/RoleBadge';
import EmptyState from '../components/EmptyState';

const ROLES = ['VIEWER', 'ANALYST', 'ADMIN'];

const PLACEHOLDER_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@zorvyn.com', role: 'ADMIN', status: 'ACTIVE' },
  { id: 2, name: 'Analyst User', email: 'analyst@zorvyn.com', role: 'ANALYST', status: 'ACTIVE' },
  { id: 3, name: 'Viewer User', email: 'viewer@zorvyn.com', role: 'VIEWER', status: 'ACTIVE' },
  { id: 4, name: 'Jane Smith', email: 'jane@zorvyn.com', role: 'VIEWER', status: 'INACTIVE' },
];

const StatusBadge = ({ status }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
    {status}
  </span>
);

const Users = () => {
  const [users, setUsers] = useState(PLACEHOLDER_USERS);

  const changeRole = (id, role) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));

  const toggleStatus = (id) =>
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u))
    );

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-slate-100 text-xl font-semibold mb-6">User Management</h1>
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {users.length === 0 ? (
            <EmptyState message="No users found." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-slate-400 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors duration-150">
                    <td className="px-4 py-3 text-slate-200">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 transition-colors duration-150"
                        >
                          {ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                        <button
                          onClick={() => toggleStatus(u.id)}
                          className={`text-xs px-3 py-1 rounded-lg transition-colors duration-150 ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default Users;
