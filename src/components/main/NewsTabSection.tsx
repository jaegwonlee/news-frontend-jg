'use client';

import { useState } from 'react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
}

interface NewsTabSectionProps {
  exclusiveNews: NewsItem[];
  flashNews: NewsItem[];
}

export default function NewsTabSection({ exclusiveNews, flashNews }: NewsTabSectionProps) {
  const [activeTab, setActiveTab] = useState('exclusive');

  const newsToShow = activeTab === 'exclusive' ? exclusiveNews : flashNews;

  return (
    <section className="flex flex-col h-full">
      <div className="flex items-center border-b-4 border-red-500 pb-2 mb-4">
        <button 
          onClick={() => setActiveTab('exclusive')}
          className={`text-xl font-bold transition-colors ${activeTab === 'exclusive' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>
          단독뉴스
        </button>
        <span className="mx-2 text-neutral-500">|</span>
        <button 
          onClick={() => setActiveTab('flashes')}
          className={`text-xl font-bold transition-colors ${activeTab === 'flashes' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'}`}>
          속보뉴스
        </button>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-2">
        {newsToShow.map((news) => (
          <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors">
            <p className="font-semibold truncate">{news.title}</p>
            <p className="text-xs text-neutral-400 mt-1">{news.source}</p>
          </a>
        ))}
      </div>
    </section>
  );
}