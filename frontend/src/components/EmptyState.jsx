const EmptyState = ({ message = 'No records found.', icon = '📭', action = null }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl mb-4 shadow-inner">
      {icon}
    </div>
    <p className="text-slate-300 text-sm font-medium mb-1">{message}</p>
    <p className="text-slate-500 text-xs mb-5">Your transactions will appear here once added.</p>
    {action && (
      <button
        onClick={action.onClick}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm px-4 py-2 rounded-lg transition-all duration-150 font-medium"
      >
        <span>+</span>
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
