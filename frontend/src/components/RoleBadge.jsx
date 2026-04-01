const ROLE_STYLES = {
  ADMIN: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  ANALYST: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  VIEWER: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const RoleBadge = ({ role }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_STYLES[role] ?? ROLE_STYLES.VIEWER}`}>
    {role}
  </span>
);

export default RoleBadge;
