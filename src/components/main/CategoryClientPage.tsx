'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import NewsCard from "@/components/news/NewsCard";
import ChatRoom from "@/components/common/ChatRoom";
import { Article } from "@/types/article";

interface CategoryClientPageProps {
  categoryName: string;
  chatRoomTitle: string;
}

const ARTICLE_LIMIT = 10;

export default function CategoryClientPage({ categoryName, chatRoomTitle }: CategoryClientPageProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchArticles = useCallback(async (currentOffset: number) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const res = await fetch(`https://news-buds.onrender.com/api/articles/by-category?name=${categoryName}&offset=${currentOffset}&limit=${ARTICLE_LIMIT}`);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4 pt-6">
      <div className="lg:col-span-2">
        <div className="flex items-center mb-6">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
          <h1 className="text-4xl font-extrabold text-white">{categoryName}</h1>
        </div>
        <div>
          {articles.map((article, index) => {
            if (articles.length === index + 1) {
              return <div ref={lastArticleElementRef} key={article.id}><NewsCard article={article} /></div>;
            } else {
              return <NewsCard key={article.id} article={article} />;
            }
          })}
          {isLoading && <p className="text-white text-center py-4">Loading more articles...</p>}
          {!hasMore && articles.length > 0 && <p className="text-neutral-500 text-center py-4">모든 기사를 불러왔습니다.</p>}
          {!hasMore && articles.length === 0 && !isLoading && <p className="text-neutral-500 text-center py-4">표시할 기사가 없습니다.</p>}
        </div>
      </div>
      <div className="lg:col-span-1 lg:sticky lg:top-24 h-[calc(100vh-150px)]">
        <ChatRoom title={chatRoomTitle} />
      </div>
    </div>
  );
}
