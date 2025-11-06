'use client';

import { useState, useEffect } from 'react';
import { getLatestTopics, getPopularTopics } from "@/lib/api";
import { Topic } from '@/types';
import { formatRelativeTime } from "@/lib/utils";
import { Eye, Crown } from "lucide-react";
import Link from "next/link";
import LoadingSpinner from '../components/common/LoadingSpinner';

type SortOrder = 'latest' | 'popular';

export default function DebatePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      let fetchedTopics: Topic[] = [];
      if (sortOrder === 'latest') {
        fetchedTopics = await getLatestTopics();
      } else if (sortOrder === 'popular') {
        fetchedTopics = await getPopularTopics();
      }
      setTopics(fetchedTopics);
      setIsLoading(false);
    };

    fetchTopics();
  }, [sortOrder]);

  const getButtonClass = (order: SortOrder) => {
    return sortOrder === order
      ? 'bg-red-600 text-white shadow-md shadow-red-500/30'
      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700';
  };

  const getRankInfo = (index: number) => {
    if (sortOrder !== 'popular') return { glowClass: '', gradientClass: '', icon: null };
    switch (index) {
      case 0: return { 
        glowClass: 'animate-glow-border', 
        gradientClass: 'bg-gradient-gold', 
        icon: <Crown className="w-5 h-5 text-yellow-400" /> 
      };
      case 1: return { 
        glowClass: 'animate-glow-border-2nd', 
        gradientClass: 'bg-gradient-silver', 
        icon: <Crown className="w-5 h-5 text-slate-300" /> 
      };
      case 2: return { 
        glowClass: 'animate-glow-border-3rd', 
        gradientClass: 'bg-gradient-bronze', 
        icon: <Crown className="w-5 h-5 text-orange-400" /> 
      };
      default: return { glowClass: '', gradientClass: '', icon: null };
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6 border-b-2 border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-white">토픽 리스트</h1>
        <div className="flex items-center gap-3 p-1 bg-zinc-900 rounded-lg">
          <button
            onClick={() => setSortOrder('latest')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${getButtonClass('latest')}`}>
            최신순
          </button>
          <button
            onClick={() => setSortOrder('popular')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${getButtonClass('popular')}`}>
            인기순
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      ) : topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topics.map((topic, index) => {
            const { glowClass, gradientClass, icon } = getRankInfo(index);
            return (
              <div key={topic.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms`}}>
                <Link
                  href={`/debate/${topic.id}`}
                  className={`relative flex flex-col p-6 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-lg hover:border-red-500/50 hover:-translate-y-2 transition-all duration-300 h-64 overflow-hidden ${glowClass} ${gradientClass}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {icon}
                      <span className="text-xl font-bold text-zinc-400">{index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Eye className="w-4 h-4" />
                      <span>{topic.view_count}</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3 line-clamp-2">{topic.display_name}</h2>
                  <p className="text-zinc-400 text-sm line-clamp-3 flex-grow">{topic.summary}</p>
                  <div className="text-sm text-zinc-500 mt-auto pt-3">
                    <time dateTime={topic.published_at}>{formatRelativeTime(topic.published_at)}</time>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-zinc-400 py-20">토픽이 없습니다.</p>
      )}
    </div>
  );
}