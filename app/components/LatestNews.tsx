"use client"; // 👈 1. 클라이언트 컴포넌트로 전환

import { useEffect, useState } from "react"; // 👈 2. useEffect, useState 임포트
import { getLatestNews } from "@/lib/api"; 
import Link from "next/link";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/utils"; 
import StyledArticleTitle from "./common/StyledArticleTitle"; 
import ArticleLikeButton from "./ArticleLikeButton";
import ArticleImageWithFallback from "./ArticleImageWithFallback";
import { useAuth } from "@/app/context/AuthContext"; // 👈 3. useAuth 임포트
import { Article } from "@/types"; // 👈 4. Article 타입 임포트

/**
 * [수정] 최신 뉴스 목록 (클라이언트 컴포넌트)
 */
export default function LatestNews({ className }: { className?: string }) {
  
  const { token } = useAuth(); // 👈 5. 토큰 가져오기
  const [newsItems, setNewsItems] = useState<Article[]>([]); // 👈 6. 상태 변수 선언

  // 👈 7. useEffect로 클라이언트 사이드에서 데이터 페칭
  useEffect(() => {
    const fetchNews = async () => {
      // API 호출 시 token 전달
      const items = await getLatestNews(10, token || undefined);
      setNewsItems(items);
    };
    
    fetchNews();
  }, [token]); // token이 변경될 때마다 (로그인/로그아웃 시) 다시 가져옴

  return (
    <aside className={`bg-zinc-900 p-4 rounded-lg h-[700px] flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white border-b border-zinc-700 pb-2 mb-4">최신 뉴스</h2>
        {/* 전체보기 링크 (나중에 /latest 같은 페이지를 만들 수 있음) */}
        {/* <a href="#" className="text-xs text-zinc-400 hover:text-white">
          전체보기
        </a> */}
      </div>
      
      {/* 👇 8. 렌더링 부분은 newsItems 상태를 사용 (JSX 자체는 동일) */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {newsItems.length === 0 && (
          <p className="text-zinc-500 text-center pt-10">최신 뉴스가 없습니다.</p>
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
            {item.id && item.like_count !== undefined && item.isLiked !== undefined && (
              <div className="flex-shrink-0 self-end">
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
    </aside>
  );
}