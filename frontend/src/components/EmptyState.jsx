const EmptyState = ({ message = 'No records found.' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
    <span className="text-4xl mb-3">📭</span>
    <p className="text-sm">{message}</p>
  </div>
);

export default EmptyState;
