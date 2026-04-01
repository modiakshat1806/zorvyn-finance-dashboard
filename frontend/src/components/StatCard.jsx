const TREND_STYLES = {
  up: 'text-emerald-400',
  down: 'text-rose-400',
};

const StatCard = ({ label, value, trend }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
    <p className="text-slate-400 text-sm mb-1">{label}</p>
    <p className="text-slate-100 text-2xl font-semibold">{value}</p>
    {trend && (
      <p className={`text-xs mt-1 ${TREND_STYLES[trend.direction] ?? 'text-slate-400'}`}>
        {trend.label}
      </p>
    )}
  </div>
);

export default StatCard;
