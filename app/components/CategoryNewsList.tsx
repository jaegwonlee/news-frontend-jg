'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_FAVICON_URL, FAVICON_URLS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import { Article } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { incrementArticleView } from '@/lib/api/articles';

async function fetchArticlesByCategory(categoryName: string): Promise<Article[]> {
  const encodedCategoryName = encodeURIComponent(categoryName);
  const apiUrl = `https://news02.onrender.com/api/articles/by-category?name=${encodedCategoryName}&limit=30&offset=0`;
  try {
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    const data: Article[] = await response.json();
    return data;
  } catch (error) {
    console.error("뉴스 데이터를 가져오는 중 에러 발생:", error);
    return [];
  }
}

export default function CategoryNewsList({
  categoryName,
  className,
}: {
  categoryName: string;
  className?: string;
}) {
  const [newsList, setNewsList] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadArticles() {
      setIsLoading(true);
      const articles = await fetchArticlesByCategory(categoryName);
      setNewsList(articles);
      setIsLoading(false);
    }
    loadArticles();
  }, [categoryName]);

  const handleArticleClick = (articleId: number) => {
    incrementArticleView(articleId);
  };

  return (
    <section className={`bg-zinc-900 p-4 rounded-lg ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-zinc-700">{categoryName}</h2>
      <div className="space-y-6">
        {isLoading && <p className="text-zinc-400 text-center py-10">뉴스를 불러오는 중...</p>}
        {!isLoading && newsList.length === 0 && (
          <p className="text-zinc-400 text-center py-10">뉴스를 불러오지 못했거나 해당 카테고리에 뉴스가 없습니다.</p>
        )}
        {newsList.map((news) => {
          const faviconUrl = FAVICON_URLS[news.source_domain || ""] || DEFAULT_FAVICON_URL(news.source_domain || "");

          return (
            <article key={news.id} className="flex flex-col md:flex-row gap-4 group">
              <div className="relative w-full md:w-48 h-32 bg-zinc-700 rounded-md shrink-0 overflow-hidden">
                {news.thumbnail_url && (
                  <Image
                    src={news.thumbnail_url}
                    alt={`${news.title} 썸네일`}
                    fill
                    sizes="(max-width: 768px) 100vw, 192px"
                    style={{ objectFit: "cover" }}
                    className="rounded-md transition-opacity duration-300 group-hover:opacity-80"
                  />
                )}
              </div>

              <div className="flex flex-col flex-1">
                <Link 
                  href={news.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => handleArticleClick(news.id)}
                >
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2 group-hover:underline">{news.title}</h3>
                </Link>
                <div className="flex items-center text-xs text-zinc-500 mt-auto pt-2">
                  {faviconUrl && (
                    <Image
                      src={faviconUrl}
                      alt={`${news.source} 파비콘`}
                      width={16}
                      height={16}
                      className="mr-1.5 rounded"
                      unoptimized
                    />
                  )}
                  <span>{news.source}</span>
                  <span className="mx-1.5">·</span>
                  <time dateTime={news.published_at}>{formatRelativeTime(news.published_at)}</time>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}