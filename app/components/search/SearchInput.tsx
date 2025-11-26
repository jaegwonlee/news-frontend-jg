"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SearchInput({ onSearch, initialQuery = "" }: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Force colors based on theme to avoid conflicts
  const isDark = mounted && resolvedTheme === "dark";
  const bgColor = isDark ? "#18181b" : "#f4f4f5"; // zinc-900 : zinc-100
  const textColor = isDark ? "#e4e4e7" : "#27272a"; // zinc-200 : zinc-800
  const placeholderColor = isDark ? "#71717a" : "#a1a1aa"; // zinc-500 : zinc-400
  const borderColor = isDark ? "#27272a" : "#e4e4e7"; // zinc-800 : zinc-200

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground" size={24} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderColor: borderColor,
          // We can't set placeholder color inline easily, so we keep the class for that but use style for main colors
        }}
        className="w-full pl-16 pr-14 py-5 border rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
      />
      {query && (
        <motion.button
          type="button"
          onClick={handleClear}
          className="absolute right-6 top-1/2 -translate-y-1/2 p-1.5 bg-secondary hover:bg-accent rounded-full text-muted-foreground"
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
