'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import NewsCard from "@/components/news/NewsCard";
import { Article } from "@/types/article";

const ARTICLE_LIMIT = 10;

// Define a type for the raw article from the exclusives API
interface RawExclusiveArticle {
  id: number;
  url: string;
  title: string;
  source: string; // This is the display name, e.g., "한겨레"
  source_domain: string; // This is the domain, e.g., "hani.co.kr"
  published_at: string;
  // thumbnail_url and description are missing
}

export default function ExclusivesClientPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchArticles = useCallback(async (currentOffset: number) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const res = await fetch(`https://news-buds.onrender.com/api/articles/exclusives?offset=${currentOffset}&limit=${ARTICLE_LIMIT}`);
      if (!res.ok) {
        throw new Error('Failed to fetch exclusive articles');
      }
      const rawArticles: RawExclusiveArticle[] = await res.json();

      // Transform the raw articles to the Article type
      const newArticles: Article[] = rawArticles.map(rawArticle => ({
        id: rawArticle.id,
        url: rawArticle.url,
        title: rawArticle.title,
        published_at: rawArticle.published_at,
        source: rawArticle.source_domain, // Map source_domain to source for favicon
        thumbnail_url: '', // No thumbnail from this API
        description: '', // No description from this API
      }));

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
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore]);

  useEffect(() => {
    fetchArticles(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

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
    <div className="lg:col-span-2">
      <div className="flex items-center mb-6">
        <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
        <h1 className="text-4xl font-extrabold text-white">단독 뉴스</h1>
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
  );
}
