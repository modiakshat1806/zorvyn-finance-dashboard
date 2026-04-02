const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-slate-500 text-xs">
        Page <span className="text-slate-300 font-medium">{currentPage}</span> of{' '}
        <span className="text-slate-300 font-medium">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          ← Prev
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={[
              'w-8 h-8 text-sm rounded-lg transition-all duration-150',
              page === currentPage
                ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200',
            ].join(' ')}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
