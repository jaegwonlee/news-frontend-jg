'use client';

import { useEffect, useState } from 'react';
import { Article } from '@/types';
import CategoryArticleCard from '@/app/components/CategoryArticleCard';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';

async function fetchArticlesByCategory(categoryName: string): Promise<Article[]> {
  const encodedCategoryName = encodeURIComponent(categoryName);
  const apiUrl = `https://news02.onrender.com/api/articles/by-category?name=${encodedCategoryName}&limit=25&offset=0`;
  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching news data:", error);
    return [];
  }
}

export default function EconomyPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const categoryName = "경제";
  const accentColor = "green"; // Accent color for Economy

  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true);
      const fetchedArticles = await fetchArticlesByCategory(categoryName);
      setArticles(fetchedArticles);
      setIsLoading(false);
    };
    loadArticles();
  }, []);

  const heroArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold text-white border-b-4 border-green-500 pb-4 inline-block">
          {categoryName}
        </h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div className="text-center text-zinc-400 py-20">
              <p className="text-lg">해당 카테고리에 뉴스가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {heroArticle && (
                <CategoryArticleCard article={heroArticle} layout="hero" accentColor={accentColor} />
              )}
              
              {remainingArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {remainingArticles.map(article => (
                    <CategoryArticleCard key={article.id} article={article} layout="default" accentColor={accentColor} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}