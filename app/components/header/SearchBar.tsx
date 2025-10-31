'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchIconClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery('');
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (searchQuery.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="flex items-center gap-4">
      {isSearchOpen && (
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            className="w-64 p-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit(e);
              }
            }}
            autoFocus
          />
          <Search
            className="absolute left-3 w-4 h-4 text-zinc-400 cursor-pointer"
            onClick={() => handleSearchSubmit()}
          />
        </div>
      )}
      <button onClick={handleSearchIconClick} className="p-1 rounded-full hover:bg-zinc-700 transition-colors">
        {isSearchOpen ? (
          <X className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white" />
        ) : (
          <Search className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white" />
        )}
      </button>
    </div>
  );
}
