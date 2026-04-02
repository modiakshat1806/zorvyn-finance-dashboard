const CARD_CONFIG = {
  income: {
    icon: '💰',
    gradient: 'from-emerald-500/10 to-transparent',
    border: 'border-emerald-500/20',
    valueColor: 'text-emerald-400',
    trendColor: 'text-emerald-400',
    glowHover: 'hover:shadow-emerald-500/10',
  },
  expense: {
    icon: '📉',
    gradient: 'from-rose-500/10 to-transparent',
    border: 'border-rose-500/20',
    valueColor: 'text-rose-400',
    trendColor: 'text-rose-400',
    glowHover: 'hover:shadow-rose-500/10',
  },
  balance: {
    icon: '📊',
    gradient: 'from-indigo-500/10 to-transparent',
    border: 'border-indigo-500/20',
    valueColor: 'text-indigo-300',
    trendColor: 'text-indigo-400',
    glowHover: 'hover:shadow-indigo-500/10',
  },
};

const TREND_COLOR = { up: 'text-emerald-400', down: 'text-rose-400' };

const StatCard = ({ label, value, trend, variant = 'balance' }) => {
  const cfg = CARD_CONFIG[variant] ?? CARD_CONFIG.balance;

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border bg-slate-900 p-5',
        'transition-all duration-200 ease-out',
        'hover:scale-[1.02] hover:shadow-xl',
        cfg.border,
        cfg.glowHover,
      ].join(' ')}
    >
      {/* Gradient accent top-left */}
      <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${cfg.gradient} rounded-full -translate-x-8 -translate-y-8 blur-2xl pointer-events-none`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
          <p className={`text-2xl font-bold ${cfg.valueColor} truncate`}>{value}</p>
          {trend && (
            <p className={`text-xs mt-1.5 ${TREND_COLOR[trend.direction] ?? 'text-slate-400'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.label}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-slate-800 border ${cfg.border} flex items-center justify-center text-xl flex-shrink-0 ml-3`}>
          {cfg.icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
