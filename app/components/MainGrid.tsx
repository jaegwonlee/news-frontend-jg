'use client';

import { useState } from 'react';
import { Article, Topic } from '@/types';
import Link from 'next/link';
import ChatRoom from './ChatRoom';
import TrendingTopics from './TrendingTopics';
import LatestNews from './LatestNews';

interface MainGridProps {
  mainTopic: Topic | undefined;
  latestNews: Article[];
  isLoading: boolean; // Pass loading state for skeleton UI if needed
}

const ViewAllLink = ({ href }: { href: string }) => (
  <Link href={href} className="text-sm text-zinc-400 hover:text-red-500 transition-colors">
    전체보기
  </Link>
);

export default function MainGrid({ mainTopic, latestNews, isLoading }: MainGridProps) {
  const [topicTab, setTopicTab] = useState<'popular' | 'latest'>('popular');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
      <div className="rounded-2xl border border-zinc-700 p-6 xl:col-span-1 flex flex-col h-[600px] lg:h-[729px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">라운드톡</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTopicTab('popular')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                topicTab === 'popular' ? 'bg-red-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              인기
            </button>
            <button
              onClick={() => setTopicTab('latest')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                topicTab === 'latest' ? 'bg-red-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              최신
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <TrendingTopics displayMode={topicTab} />
        </div>
      </div>

      <div className="relative z-20 rounded-2xl md:col-span-2 xl:col-span-2 h-[600px] lg:h-[729px] flex flex-col">
        <div className="flex-1 min-h-0">
          <ChatRoom topic={mainTopic} articles={latestNews} />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-700 px-6 pb-6 pt-3 xl:col-span-1 flex flex-col h-[600px] lg:h-[729px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">최신 뉴스</h2>
          </div>
          <div className="px-3 py-1.5 border border-zinc-700 rounded-full text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-700 hover:border-zinc-600 hover:text-white">
            <ViewAllLink href="/latest-news" />
          </div>
        </div>
        <div className="flex-1 min-h-0">
          {isLoading ? <div className="text-center pt-10">로딩 중...</div> : <LatestNews articles={latestNews} />}
        </div>
      </div>
    </div>
  );
}
