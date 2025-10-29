"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSearchArticles } from "@/lib/api";
import { Article } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/utils";
import StyledArticleTitle from "@/app/components/common/StyledArticleTitle";
import { FAVICON_URLS } from "@/lib/constants"; // Import FAVICON_URLS
import ArticleImageWithFallback from "@/app/components/ArticleImageWithFallback"; // Import new component
import ArticleLikeButton from "@/app/components/ArticleLikeButton"; // Import ArticleLikeButton
import { useAuth } from "@/app/context/AuthContext"; // 👈 1. useAuth 임포트

export default function SearchClientPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q");
  const { token } = useAuth(); // 👈 2. useAuth로 토큰 가져오기

  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // 👇 3. API 호출 시 token 전달
        const results = await getSearchArticles(searchQuery, token || undefined);
        setSearchResults(results);
      } catch (err: any) {
        setError(err.message || "검색 결과를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, token]); // 👈 4. useEffect 의존성 배열에 token 추가

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500"></div>
        <p className="ml-4 text-xl">검색 결과를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-zinc-900 text-red-500 text-lg">
        <p>오류: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
      <h1 className="text-3xl font-bold mb-6 border-b border-zinc-700 pb-4">'{searchQuery}' 검색 결과</h1>

      {searchResults.length === 0 ? (
        <p className="text-zinc-400 text-center">'{searchQuery}'에 대한 검색 결과가 없습니다.</p>
      ) : (
        <div className="space-y-6">
          {searchResults.map((item) => (
            <div // Changed Link to div to allow ArticleLikeButton to be a separate interactive element
              key={item.id}
              className="flex gap-4 items-start p-4 bg-zinc-900 rounded-lg shadow-md hover:bg-zinc-800 transition-colors"
            >
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 items-start flex-1" // Make Link take up available space
              >
                {item.thumbnail_url && (
                  <div className="relative w-32 h-20 shrink-0">
                    <ArticleImageWithFallback
                      src={item.thumbnail_url}
                      alt={item.title}
                      sourceDomain={item.source_domain}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <StyledArticleTitle
                    title={item.title}
                    className="text-lg font-medium text-white mb-2 line-clamp-2"
                  />
                  <p className="text-zinc-400 text-sm line-clamp-3 mb-2">{item.description}</p>
                  <div className="flex items-center text-xs text-zinc-500">
                    {item.favicon_url && (
                      <Image src={item.favicon_url} alt={item.source} width={12} height={12} className="mr-1 rounded-sm" />
                    )}
                    <span className="truncate max-w-[100px]">{item.source}</span>
                    <span className="mx-1">·</span>
                    <span>{formatRelativeTime(item.published_at)}</span>
                  </div>
                </div>
              </Link>
              {/* Add ArticleLikeButton */}
              {item.id && item.like_count !== undefined && item.isLiked !== undefined && (
                <div className="flex-shrink-0 self-end"> {/* Position like button at the bottom right */}
                  <ArticleLikeButton
                    articleId={item.id}
                    initialLikes={item.like_count}
                    initialIsLiked={item.isLiked}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
