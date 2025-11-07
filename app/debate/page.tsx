'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Topic } from '@/types';
import { getPopularTopicsAll, getAllTopics } from '@/lib/api'; // Import getAllTopics
import { formatRelativeTime } from '@/lib/utils';
import { Flame, Award, Trophy, Medal } from 'lucide-react';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';

export default function DebatePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sortOrder, setSortOrder] = useState<'popular' | 'latest'>('popular');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        // Fetch data based on the selected sort order
        const data = sortOrder === 'popular' 
          ? await getPopularTopicsAll() 
          : await getAllTopics();
        setTopics(data);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [sortOrder]); // Re-fetch when sortOrder changes

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-white">토론 리스트</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortOrder('popular')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${
              sortOrder === 'popular' ? 'bg-red-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}>
            인기순
          </button>
          <button
            onClick={() => setSortOrder('latest')}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${
              sortOrder === 'latest' ? 'bg-red-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}>
            최신순
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {topics.map((topic, index) => (
            <Link href={`/debate/${topic.id}`} key={topic.id}>
              <div 
                className={`relative bg-zinc-800 p-6 rounded-xl shadow-lg h-full flex flex-col transition-transform duration-300 hover:-translate-y-2 group border border-transparent ${
                  sortOrder === 'popular' && index === 0 ? 'animate-glow-border-gold bg-gradient-gold' : ''
                } ${
                  sortOrder === 'popular' && index === 1 ? 'animate-glow-border-silver bg-gradient-silver' : ''
                } ${
                  sortOrder === 'popular' && index === 2 ? 'animate-glow-border-bronze bg-gradient-bronze' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    {sortOrder === 'popular' && (
                      <div className={`text-xl font-bold mr-4 ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-slate-300' : 
                        index === 2 ? 'text-amber-600' : 'text-zinc-500'
                      }`}>
                        {index + 1}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-zinc-400 ml-auto">
                      <span>조회수 {topic.view_count}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors duration-300 leading-tight">{topic.display_name}</h2>
                  <p className="text-zinc-400 text-base leading-relaxed line-clamp-3">{topic.summary}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-700 text-xs text-zinc-500 text-right">
                  <time dateTime={topic.published_at}>{formatRelativeTime(topic.published_at)}</time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
