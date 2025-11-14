'use client';

import { useState, useMemo } from 'react';
import { Article } from '@/types';
import CategoryArticleCard from '@/app/components/CategoryArticleCard';

interface CategoryNewsClientPageProps {
  articles: Article[];
  categoryName: string;
}

const categoryColorMap: { [key: string]: { border: string; bg: string; accent: string } } = {
  '정치': { border: 'border-blue-500', bg: 'bg-blue-500', accent: 'blue' },
  '경제': { border: 'border-green-500', bg: 'bg-green-500', accent: 'green' },
  '사회': { border: 'border-yellow-500', bg: 'bg-yellow-500', accent: 'yellow' },
  '문화': { border: 'border-purple-500', bg: 'bg-purple-500', accent: 'purple' },
  'default': { border: 'border-red-500', bg: 'bg-red-500', accent: 'red' },
};

export default function CategoryNewsClientPage({ articles, categoryName }: CategoryNewsClientPageProps) {
  const [selectedSource, setSelectedSource] = useState('전체');

  const colors = categoryColorMap[categoryName] || categoryColorMap.default;

  const sources = useMemo(() => {
    const allSources = articles.map(article => article.source);
    return ['전체', ...Array.from(new Set(allSources))];
  }, [articles]);

  const { heroArticle, remainingArticles, filteredArticles } = useMemo(() => {
    const filtered = selectedSource === '전체'
      ? articles
      : articles.filter(article => article.source === selectedSource);
    
    const hero = filtered.length > 0 ? filtered[0] : null;
    const remaining = filtered.length > 1 ? filtered.slice(1) : [];

    return { heroArticle: hero, remainingArticles: remaining, filteredArticles: filtered };
  }, [articles, selectedSource]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <header className="mb-8">
        <h1 className={`text-5xl font-extrabold text-white border-b-4 ${colors.border} pb-4 inline-block`}>
          {categoryName}
        </h1>
      </header>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {sources.map(source => (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                selectedSource === source
                  ? `${colors.bg} text-white`
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center text-zinc-400 py-20">
          <p className="text-lg">해당 언론사의 뉴스가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {heroArticle && (
            <CategoryArticleCard article={heroArticle} layout="hero" accentColor={colors.accent} />
          )}
          
          {remainingArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {remainingArticles.map(article => (
                <CategoryArticleCard key={article.id} article={article} layout="default" accentColor={colors.accent} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
