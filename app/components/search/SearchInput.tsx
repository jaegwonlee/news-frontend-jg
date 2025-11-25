'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SearchInput({ onSearch, initialQuery = '' }: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={24} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="기사, 주제, 키워드를 검색해 보세요..."
        className="w-full pl-16 pr-14 py-5 bg-zinc-800/80 border border-transparent focus:border-red-500/50 rounded-full text-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all duration-300"
      />
      {query && (
        <motion.button
          type="button"
          onClick={handleClear}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-full text-zinc-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <X size={18} />
        </motion.button>
      )}
    </motion.form>
  );
}
