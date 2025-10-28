// app/components/LatestNews.tsx

// 1. 수정: getBreakingNews 대신 getLatestNews를 import 합니다.
import { getLatestNews } from "@/lib/api"; 
import Link from "next/link";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/utils"; 
import StyledArticleTitle from "./common/StyledArticleTitle"; 

/**
 * 최신 뉴스 목록 (모든 카테고리 종합)을 API에서 가져와 보여주는 서버 컴포넌트
 */
export default async function LatestNews({ className }: { className?: string }) {
  
  // 2. 수정: getBreakingNews() 대신 getLatestNews()를 호출합니다. (기본 10개)
  const newsItems = await getLatestNews(); 

  return (
    <aside className={`bg-zinc-900 p-4 rounded-lg h-[700px] flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white border-b border-zinc-700 pb-2 mb-4">최신 뉴스</h2>
        {/* 전체보기 링크 (나중에 /latest 같은 페이지를 만들 수 있음) */}
        {/* <a href="#" className="text-xs text-zinc-400 hover:text-white">
          전체보기
        </a> */}
      </div>
      
      {/* API 데이터 기반 UI 렌더링 (이 부분은 변경 없음) */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {newsItems.length === 0 && (
          <p className="text-zinc-500 text-center pt-10">최신 뉴스가 없습니다.</p>
        )}

        {newsItems.map((item) => (
          <Link 
            key={item.id} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex gap-3 items-start cursor-pointer group"
          >
            {/* 썸네일 */}
            <div className="relative w-24 h-16 bg-zinc-700 rounded-md shrink-0 group-hover:opacity-80 overflow-hidden">
              {item.thumbnail_url && (
                <Image 
                  src={item.thumbnail_url} 
                  alt={item.title} 
                  fill
                  sizes="96px"
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
              )}
            </div>

            {/* 제목 및 출처 */}
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
        ))}
      </div>
    </aside>
  );
}