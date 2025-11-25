'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Topic } from '@/types'; // Assuming Topic has at least 'id' and 'display_name'

interface TrendingSearchesProps {
  topics: Topic[];
  onSearch: (query: string) => void;
}

export default function TrendingSearches({ topics, onSearch }: TrendingSearchesProps) {
  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-10">
      <h2 className="text-sm font-semibold text-zinc-400 flex items-center mb-3 px-2">
        <Flame size={14} className="mr-2 text-red-500"/>
        인기 검색어
      </h2>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => onSearch(topic.display_name)}
            className="bg-zinc-800/80 hover:bg-red-500/20 hover:text-red-400 rounded-full px-4 py-2 text-sm text-zinc-300 cursor-pointer transition-all"
          >
            <span className="font-semibold text-red-500/90 mr-1.5">#{index + 1}</span>
            {topic.display_name}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
