'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import NewsCard from "@/components/news/NewsCard";
import MainNewsCard from "@/components/news/MainNewsCard"; // Import MainNewsCard
import { Article } from "@/types/article";
import { API_BASE_URL } from '@/lib/api';

interface CategoryClientPageProps {
  categoryName: string;
}

const ARTICLE_LIMIT = 10;

export default function CategoryClientPage({ categoryName }: CategoryClientPageProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchArticles = useCallback(async (currentOffset: number) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/articles/by-category?name=${categoryName}&offset=${currentOffset}&limit=${ARTICLE_LIMIT}`);
      if (!res.ok) {
        throw new Error('Failed to fetch articles');
      }
      const newArticles: Article[] = await res.json();

      if (newArticles.length > 0) {
        setArticles(prevArticles => {
          const combined = [...prevArticles, ...newArticles];
          const uniqueArticles = combined.filter(
            (article, index, self) => index === self.findIndex((a) => a.id === article.id)
          );
          return uniqueArticles;
        });
        setOffset(prev => prev + newArticles.length);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
      // Here you could set an error state to display a message to the user
    } finally {
      setIsLoading(false);
    }
  }, [categoryName, isLoading, hasMore]);

  useEffect(() => {
    // Reset state when category changes
    setArticles([]);
    setOffset(0);
    setHasMore(true);
    fetchArticles(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName]); // Dependency array includes fetchArticles, but it causes re-fetch loop. Simplified for now.

  const lastArticleElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchArticles(offset);
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, offset, fetchArticles]);

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const otherArticles = articles.slice(1);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 shrink-0"></span>
        <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white">{categoryName}</h1>
      </div>

      {featuredArticle && (
        <div className="mb-8">
          <MainNewsCard article={featuredArticle} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherArticles.map((article, index) => {
          if (otherArticles.length === index + 1 && hasMore) {
            return <div ref={lastArticleElementRef} key={article.id}><NewsCard article={article} /></div>;
          } else {
            return <NewsCard key={article.id} article={article} />;
          }
        })}
      </div>

      {isLoading && <p className="text-neutral-600 dark:text-white text-center py-4">Loading more articles...</p>}
      {!hasMore && articles.length > 0 && <p className="text-neutral-500 text-center py-4">모든 기사를 불러왔습니다.</p>}
      {!hasMore && articles.length === 0 && !isLoading && <p className="text-neutral-500 text-center py-4">표시할 기사가 없습니다.</p>}
    </div>
  );
}