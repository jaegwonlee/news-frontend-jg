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
        <div className="flex items-center p-1 bg-zinc-800 rounded-lg">
          <button
            onClick={() => setSortOrder('popular')}
            className={`w-24 px-4 py-2 text-sm font-bold rounded-md transition-colors ${
              sortOrder === 'popular' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-300 hover:bg-zinc-700'
            }`}>
            인기순
          </button>
          <button
            onClick={() => setSortOrder('latest')}
            className={`w-24 px-4 py-2 text-sm font-bold rounded-md transition-colors ${
              sortOrder === 'latest' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-300 hover:bg-zinc-700'
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
        <>
          {/* Hero Section for the #1 Topic */}
          {sortOrder === 'popular' && topics.length > 0 && (
            <div className="mb-12">
              <Link href={`/debate/${topics[0].id}`}>
                <div className="relative bg-gradient-to-r from-zinc-800 via-zinc-900 to-black p-8 rounded-3xl shadow-2xl group border-2 border-yellow-400/50 hover:border-yellow-400 transition-all duration-300 animate-glow-border-gold overflow-hidden shine-effect">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400/80 rounded-full blur-3xl animate-pulse-hot"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-red-500/50 rounded-full blur-3xl animate-pulse-hot animation-delay-2000"></div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="flex-shrink-0 text-center">
                      <div className="text-6xl font-black text-yellow-300 tracking-tighter -mb-2">1</div>
                      <div className="text-sm font-bold text-yellow-400">TOP RANK</div>
                    </div>
                    <div className="border-l-2 border-yellow-400/30 h-24 hidden md:block"></div>
                    <div className="flex-grow text-center md:text-left">
                      <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 group-hover:text-yellow-300 transition-colors duration-300">{topics[0].display_name}</h2>
                      <p className="text-zinc-300 text-base lg:text-lg leading-relaxed line-clamp-2">{topics[0].summary}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Flame size={14} />
                          <span>조회수 {topics[0].view_count}</span>
                        </div>
                        <time dateTime={topics[0].published_at}>{formatRelativeTime(topics[0].published_at)}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 holographic-card-container">
                      {(sortOrder === 'popular' ? topics.slice(1) : topics).map((topic, index) => {
                        const rank = index + 2;
                        const isHolographic = sortOrder === 'popular' && rank <= 3;

                        const rankThemes = {
                          2: {
                            textColor: 'text-slate-300',
                            rankColor: 'text-slate-400',
                            borderColor: 'border-slate-500/50',
                            hoverBorderColor: 'hover:border-slate-400',
                          },
                          3: {
                            textColor: 'text-amber-600',
                            rankColor: 'text-amber-700',
                            borderColor: 'border-amber-700/50',
                            hoverBorderColor: 'hover:border-amber-600',
                          },
                        };
                        
                        const theme = isHolographic ? rankThemes[rank as keyof typeof rankThemes] : null;

                        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
                          if (!isHolographic) return;
                          const card = e.currentTarget;
                          const { left, top, width, height } = card.getBoundingClientRect();
                          const x = e.clientX - left;
                          const y = e.clientY - top;
                          
                          const rotateX = -((y / height) - 0.5) * 20;
                          const rotateY = ((x / width) - 0.5) * 20;
                          
                          card.style.setProperty('--rotateX', `${rotateX}deg`);
                          card.style.setProperty('--rotateY', `${rotateY}deg`);
                          card.style.setProperty('--mouseX', `${(x / width) * 100}%`);
                          card.style.setProperty('--mouseY', `${(y / height) * 100}%`);
                        };

                        const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
                          if (!isHolographic) return;
                          const card = e.currentTarget;
                          card.style.setProperty('--rotateX', '0deg');
                          card.style.setProperty('--rotateY', '0deg');
                        };

                        return (
                          <Link href={`/debate/${topic.id}`} key={topic.id}>
                            <div 
                              className={`relative bg-zinc-800/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg h-full flex flex-col transition-all duration-300 group border ${
                                isHolographic && theme ? `${theme.borderColor} ${theme.hoverBorderColor}` : 'border-zinc-700/80 hover:border-red-500/50'
                              } hover:bg-zinc-800/100 overflow-hidden animate-fade-in-up ${isHolographic ? 'holographic-card shine-effect' : ''}`}
                              style={{ animationDelay: `${index * 100}ms` }}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            >
                              <div className="holographic-content flex flex-col h-full">
                                {isHolographic && theme ? (
                                  <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
                                    <div className="flex-shrink-0 text-center">
                                      <div className={`text-5xl font-black tracking-tighter -mb-1 ${theme.textColor}`}>
                                        {rank}
                                      </div>
                                      <div className={`text-xs font-bold ${theme.rankColor}`}>
                                        RANK
                                      </div>
                                    </div>
                                    <div className="border-l-2 border-zinc-700/30 h-16 hidden md:block"></div>
                                    <div className="flex-grow text-center md:text-left">
                                      <h2 className="text-xl font-bold text-white mb-2 leading-tight z-10">{topic.display_name}</h2>
                                      <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 z-10">{topic.summary}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex-grow flex flex-col justify-center items-center text-center relative">
                                    <div className="absolute top-0 left-0 text-lg font-bold text-zinc-500 p-2">
                                      {sortOrder === 'popular' ? rank : index + 1}
                                    </div>
                                    <img src="/avatars/blue--glove.svg" alt="Blue Glove" className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-24 opacity-20 group-hover:opacity-40 transition-all duration-300 group-hover:-translate-x-2" />
                                    <img src="/avatars/red--glove.svg" alt="Red Glove" className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 opacity-20 group-hover:opacity-40 transition-all duration-300 group-hover:translate-x-2" />
                                    <h2 className="text-xl font-bold text-white mb-2 leading-tight z-10">{topic.display_name}</h2>
                                    <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 z-10">{topic.summary}</p>
                                  </div>
                                )}
                                
                                <div className="mt-5 pt-4 border-t border-zinc-700/80 flex justify-between items-center text-xs text-zinc-500">
                                  <div className="flex items-center gap-1">
                                    <Flame size={12} />
                                    <span>조회수 {topic.view_count}</span>
                                  </div>
                                  <time dateTime={topic.published_at}>{formatRelativeTime(topic.published_at)}</time>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
        </>
      )}
    </div>
  );
}
