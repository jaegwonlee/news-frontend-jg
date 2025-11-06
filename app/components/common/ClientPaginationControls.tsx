'use client';

interface ClientPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ClientPaginationControls({ currentPage, totalPages, onPageChange }: ClientPaginationControlsProps) {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:pointer-events-none disabled:opacity-50`}
      >
        이전
      </button>
      <div className="flex items-center gap-2">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors flex items-center justify-center ${
              currentPage === number
                ? 'bg-red-500 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            {number}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:pointer-events-none disabled:opacity-50`}
      >
        다음
      </button>
    </nav>
  );
}