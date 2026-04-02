const StatCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 h-[104px] animate-fade-in">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-3">
        <div className="skeleton w-24 h-3 opacity-50" />
        <div className="skeleton w-32 h-6" />
        <div className="skeleton w-16 h-3 opacity-30" />
      </div>
      <div className="skeleton w-10 h-10 rounded-xl" />
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <tr className="border-b border-slate-800 animate-fade-in">
    <td className="px-4 py-4"><div className="skeleton w-20 h-3" /></td>
    <td className="px-4 py-4"><div className="skeleton w-24 h-3" /></td>
    <td className="px-4 py-4"><div className="skeleton w-16 h-3 rounded-full" /></td>
    <td className="px-4 py-4"><div className="skeleton w-20 h-4" /></td>
    <td className="px-4 py-4"><div className="skeleton w-32 h-3" /></td>
    <td className="px-4 py-4">
      <div className="flex items-center gap-2">
        <div className="skeleton w-7 h-7 rounded-full" />
        <div className="skeleton w-16 h-3" />
      </div>
    </td>
    <td className="px-4 py-4"><div className="skeleton w-6 h-6 rounded-lg ml-auto" /></td>
  </tr>
);

const ChartSkeleton = ({ height = 240 }) => (
  <div className={`w-full bg-slate-900 border border-slate-800 rounded-xl p-5 animate-fade-in`} style={{ height }}>
    <div className="skeleton w-40 h-4 mb-6 opacity-60" />
    <div className="flex items-end gap-3 h-[calc(100%-48px)]">
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="skeleton flex-1 rounded-t-lg" 
          style={{ height: `${Math.random() * 60 + 20}%`, opacity: 0.2 + (i * 0.1) }} 
        />
      ))}
    </div>
  </div>
);

export { StatCardSkeleton, TableRowSkeleton, ChartSkeleton };
