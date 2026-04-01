const TYPE_STYLES = {
  success: {
    bar: 'bg-emerald-500',
    bg: 'bg-slate-900 border-emerald-500/30',
    icon: 'text-emerald-400 bg-emerald-500/10',
    text: 'text-slate-200',
    sub: 'text-emerald-400',
    iconChar: '✓',
  },
  error: {
    bar: 'bg-rose-500',
    bg: 'bg-slate-900 border-rose-500/30',
    icon: 'text-rose-400 bg-rose-500/10',
    text: 'text-slate-200',
    sub: 'text-rose-400',
    iconChar: '✕',
  },
  info: {
    bar: 'bg-indigo-500',
    bg: 'bg-slate-900 border-indigo-500/30',
    icon: 'text-indigo-400 bg-indigo-500/10',
    text: 'text-slate-200',
    sub: 'text-indigo-400',
    iconChar: 'ℹ',
  },
};

const Toast = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
    {toasts.map((toast) => {
      const s = TYPE_STYLES[toast.type] ?? TYPE_STYLES.success;
      return (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 pl-1 pr-4 py-3 rounded-xl border shadow-2xl animate-slide-up ${s.bg}`}
          style={{ minWidth: '260px', maxWidth: '360px' }}
        >
          {/* Colored left bar */}
          <span className={`w-1 self-stretch rounded-full ${s.bar}`} />

          {/* Icon */}
          <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold flex-shrink-0 ${s.icon}`}>
            {s.iconChar}
          </span>

          {/* Message */}
          <span className={`text-sm flex-1 ${s.text}`}>{toast.message}</span>

          {/* Close */}
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-600 hover:text-slate-300 transition-colors text-xs ml-1 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      );
    })}
  </div>
);

export default Toast;
