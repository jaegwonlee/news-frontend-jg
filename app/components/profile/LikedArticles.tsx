'use client';

import { useState } from 'react';
import { useLikedArticles } from '@/hooks/useLikedArticles';
import ArticleCard from '@/app/components/ArticleCard';
import PaginationControls from '@/app/components/common/ClientPaginationControls';

export default function LikedArticles() {
  const { articles, totalCount, isLoading, error, handleUnlike } = useLikedArticles();
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  // Note: The current implementation paginates only the initially fetched articles.
  // Full server-side pagination would require passing page info to the `useLikedArticles` hook.
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(totalCount / articlesPerPage);

  return (
    <>
      <div className="flex items-center justify-between mb-6 border-b border-zinc-700 pb-3">
        <h2 className="text-2xl font-bold text-white">
          좋아요한 기사
          <span className="text-lg font-medium text-zinc-400 ml-2">
            ({totalCount})
          </span>
        </h2>
      </div>
      {isLoading ? (
        <div className="text-center py-10 text-zinc-400">좋아요한 기사 로딩 중...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">오류: {error}</div>
      ) : totalCount === 0 ? (
        <div className="text-center py-10 text-zinc-400">아직 좋아요한 기사가 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} onLikeToggle={handleUnlike} onSaveToggle={undefined} />
            ))}
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
}
