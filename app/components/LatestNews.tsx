'use client';

import { useEffect, useState } from "react";
import { getLatestNews, getPopularNews } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/utils";
import StyledArticleTitle from "./common/StyledArticleTitle";
import ArticleLikeButton from "./ArticleLikeButton";
import ArticleImageWithFallback from "./ArticleImageWithFallback";
import { useAuth } from "@/app/context/AuthContext";
import { Article } from "@/types";

export default function LatestNews({ className }: { className?: string }) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');
  const [newsItems, setNewsItems] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let items;
        if (activeTab === 'latest') {
          items = await getLatestNews(10, token || undefined);
        } else {
          items = await getPopularNews(undefined, token || undefined);
        }
        setNewsItems(items);
      } catch (err) {
        setError("뉴스를 불러오는 데 실패했습니다.");
        console.error(err);
        setNewsItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [activeTab, token]);

  return (
    <aside className={`bg-zinc-900 p-4 rounded-lg h-[700px] flex flex-col ${className}`}>
      <div className="flex border-b border-zinc-700 mb-4">
        <button
          onClick={() => setActiveTab('latest')}
          className={`flex-1 py-2 text-center text-sm font-semibold transition-colors ${
            activeTab === 'latest'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          최신 뉴스
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex-1 py-2 text-center text-sm font-semibold transition-colors ${
            activeTab === 'popular'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          인기 뉴스
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center text-zinc-400">
          로딩 중...
        </div>
      ) : error ? (
        <div className="flex-1 flex justify-center items-center text-red-500">
          {error}
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto">
          {newsItems.length === 0 && (
            <p className="text-zinc-500 text-center pt-10">뉴스가 없습니다.</p>
          )}

          {newsItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 items-start group p-2 hover:bg-zinc-800 rounded-md transition-colors"
            >
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 items-start flex-1"
              >
                <div className="relative w-24 h-16 bg-zinc-700 rounded-md shrink-0 group-hover:opacity-80 overflow-hidden">
                  {item.thumbnail_url && (
                    <ArticleImageWithFallback
                      src={item.thumbnail_url}
                      alt={item.title}
                      sourceDomain={item.source_domain}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <StyledArticleTitle
                    title={item.title}
                    className="text-sm font-medium text-white mb-1 group-hover:underline line-clamp-2"
                    disableTooltip={true} // 툴팁 비활성화
                  />
                  <div className="flex items-center text-xs text-zinc-500">
                    {item.favicon_url && (
                      <Image src={item.favicon_url} alt={item.source} width={12} height={12} className="mr-1 rounded-sm" />
                    )}
                    <span className="truncate max-w-[80px]">{item.source}</span>
                    <span className="mx-1">·</span>
                    <span>{formatRelativeTime(item.published_at)}</span>
                  </div>
                </div>
              </Link>
              <div className="flex-shrink-0 self-end flex gap-2">
                {item.id && item.like_count !== undefined && item.isLiked !== undefined && (
                    <ArticleLikeButton
                      articleId={item.id}
                      initialLikes={item.like_count}
                      initialIsLiked={item.isLiked}
                    />
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}