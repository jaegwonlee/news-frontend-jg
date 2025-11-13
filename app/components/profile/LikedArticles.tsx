'use client';

import { useState } from 'react';
import { useLikedArticles } from '@/hooks/useLikedArticles';
import ArticleCard from '@/app/components/ArticleCard';
import PaginationControls from '@/app/components/common/ClientPaginationControls';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { EmptyState } from '@/app/components/common/EmptyState';
import { Heart, ServerCrash, ArrowUpDown } from 'lucide-react';

export default function LikedArticles() {
  const { articles, totalCount, isLoading, error, handleUnlike } = useLikedArticles();
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10; // Changed to 10 to have 2 full rows

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(totalCount / articlesPerPage);

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center py-20"><LoadingSpinner /></div>;
    }
    if (error) {
      return <EmptyState Icon={ServerCrash} title="오류 발생" description={error} />;
    }
    if (totalCount === 0) {
      return <EmptyState Icon={Heart} title="좋아요한 기사 없음" description="아직 좋아요를 누른 기사가 없습니다. 관심 있는 기사에 하트를 눌러보세요." />;
    }
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {currentArticles.map((article) => (
            <ArticleCard key={article.id} article={article} onLikeToggle={handleUnlike} onSaveToggle={undefined} />
          ))}
        </div>
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    );
  };

  return (
    <div className="bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 rounded-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold text-white">
            좋아요한 기사
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            총 {totalCount}개의 기사에 좋아요를 눌렀습니다.
          </p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors">
          <ArrowUpDown size={16} />
          <span>최신순</span>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
}
