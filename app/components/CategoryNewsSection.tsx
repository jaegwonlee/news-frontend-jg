"use client"; // 👈 1. 클라이언트 컴포넌트로 전환

import Link from 'next/link';
import ArticleCard from './ArticleCard';
import { Article } from '@/types';
import { useEffect, useState } from 'react'; // 👈 2. useEffect, useState 임포트
import { useAuth } from '@/app/context/AuthContext'; // 👈 3. useAuth 임포트

/**
 * [수정] 카테고리별 뉴스 데이터를 API에서 5개만 가져오는 *클라이언트* 함수
 */
async function fetchArticles(categoryName: string, token?: string): Promise<Article[]> { // 👈 4. token 인자 추가
  const encodedCategoryName = encodeURIComponent(categoryName);
  const apiUrl = `https://news02.onrender.com/api/articles/by-category?name=${encodedCategoryName}&limit=5&offset=0`;
  
  // 👇 5. 헤더에 토큰 추가
  const headers: HeadersInit = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(apiUrl, { 
      cache: "no-store",
      headers: headers // 👈 헤더 적용
    }); 
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${categoryName} 뉴스 로드 실패:`, error);
    return [];
  }
}

interface CategoryNewsSectionProps {
  title: string;
  categoryName: string;
  linkUrl: string;
}

/**
 * [수정] 메인 페이지용 카테고리별 뉴스 섹션 (클라이언트 컴포넌트)
 */
export default function CategoryNewsSection({ title, categoryName, linkUrl }: CategoryNewsSectionProps) { // 👈 6. async 제거
  
  const { token } = useAuth(); // 👈 7. 토큰 가져오기
  const [articles, setArticles] = useState<Article[]>([]); // 8. 상태 변수 선언

  // 👈 9. useEffect로 데이터 페칭
  useEffect(() => {
    const loadArticles = async () => {
      // API 호출 시 token 전달
      const fetchedArticles = await fetchArticles(categoryName, token || undefined);
      setArticles(fetchedArticles);
    };
    loadArticles();
  }, [categoryName, token]); // categoryName이나 token이 바뀌면 다시 가져옴

  return (
    <section className="w-full mt-12">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-700">
        <h2 className="text-3xl font-bold text-white">{title}</h2>
        <Link href={linkUrl} className="text-sm text-zinc-400 hover:text-red-500 transition-colors">
          전체보기
        </Link>
      </div>
      
      {/* 👇 10. 렌더링 부분은 articles 상태를 사용 (JSX 자체는 동일) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {articles.map((article) => (
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