'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';

const MAX_RECENT_SEARCHES = 7;
const LOCAL_STORAGE_KEY = 'recentSearches';

interface RecentSearchesProps {
  onSearch: (query: string) => void;
}

export const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  const storedSearches = localStorage.getItem(LOCAL_STORAGE_KEY);
  return storedSearches ? JSON.parse(storedSearches) : [];
};

export const addRecentSearch = (query: string) => {
  if (typeof window === 'undefined') return;
  const searches = getRecentSearches();
  const updatedSearches = [query, ...searches.filter(s => s.toLowerCase() !== query.toLowerCase())].slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSearches));
};

export default function RecentSearches({ onSearch }: RecentSearchesProps) {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    setSearches(getRecentSearches());
  }, []);

  const handleRemove = (e: React.MouseEvent, searchToRemove: string) => {
    e.stopPropagation(); // Prevent triggering onSearch when clicking the 'x'
    const updatedSearches = searches.filter(s => s !== searchToRemove);
    setSearches(updatedSearches);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSearches));
  };

  const handleClearAll = () => {
    setSearches([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  if (searches.length === 0) {
    return null; // Don't render anything if there are no recent searches
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-3 px-2">
        <h2 className="text-sm font-semibold text-zinc-400 flex items-center">
            <Clock size={14} className="mr-2"/>
            최근 검색어
        </h2>
        <button
          onClick={handleClearAll}
          className="text-xs text-zinc-500 hover:text-white transition-colors"
        >
          전체 삭제
        </button>
      </div>
      <motion.div layout className="flex flex-wrap gap-2">
        <AnimatePresence>
          {searches.map((search) => (
            <motion.div
              key={search}
              layout
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              onClick={() => onSearch(search)}
              className="flex items-center bg-zinc-800/80 hover:bg-zinc-700/90 rounded-full px-4 py-2 text-sm text-zinc-200 cursor-pointer transition-colors"
            >
              <span>{search}</span>
              <button
                onClick={(e) => handleRemove(e, search)}
                className="ml-2 rounded-full p-0.5 hover:bg-zinc-600"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
