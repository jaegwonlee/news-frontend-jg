// app/components/CategoryNewsSection.tsx

import Link from 'next/link';
import ArticleCard from './ArticleCard'; // 기존 ArticleCard 컴포넌트 재사용
import { Article } from '@/types'; // 타입 경로는 프로젝트에 맞게 확인해주세요.

/**
 * 카테고리별 뉴스 데이터를 API에서 5개만 가져오는 함수
 * (CategoryNewsList의 fetcher를 기반으로 limit=5로 수정)
 */
async function fetchArticles(categoryName: string): Promise<Article[]> {
  const encodedCategoryName = encodeURIComponent(categoryName);
  // 메인 페이지 섹션용으로 5개만 로드합니다.
  const apiUrl = `https://news02.onrender.com/api/articles/by-category?name=${encodedCategoryName}&limit=5&offset=0`;
  try {
    // CategoryNewsList와 동일하게 no-store를 사용하여 최신 데이터를 가져옵니다.
    const response = await fetch(apiUrl, { cache: "no-store" }); 
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${categoryName} 뉴스 로드 실패:`, error);
    return []; // 에러 발생 시 빈 배열 반환
  }
}

interface CategoryNewsSectionProps {
  title: string;
  categoryName: string;
  linkUrl: string;
}

/**
 * 메인 페이지용 카테고리별 뉴스 섹션 (가로 5열)
 * - '정치', '경제' 등의 뉴스를 이미지처럼 표시합니다.
 */
export default async function CategoryNewsSection({ title, categoryName, linkUrl }: CategoryNewsSectionProps) {
  // 서버 컴포넌트에서 직접 데이터 페칭
  const articles = await fetchArticles(categoryName);

  return (
    <section className="w-full mt-12">
      {/* 섹션 헤더 (제목 + 전체보기 링크) */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-700">
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <Link href={linkUrl} className="text-sm text-zinc-400 hover:text-red-500 transition-colors">
          전체보기
        </Link>
      </div>
      
      {/* 기사 목록 (가로 5열 그리드) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {articles.map((article) => (
          // 기존 ArticleCard 컴포넌트를 그대로 사용합니다.
          <ArticleCard key={article.id} article={article} />
        ))}
        {articles.length === 0 && (
          <p className="text-zinc-500 md:col-span-3 lg:col-span-5 text-center py-5">
            표시할 {title} 뉴스가 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}