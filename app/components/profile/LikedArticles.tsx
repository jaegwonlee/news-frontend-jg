'use client';

import { useState } from 'react';
import { useLikedArticles } from '@/hooks/useLikedArticles';
import LikedArticleItem from './LikedArticleItem'; // Import new component
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { EmptyState } from '@/app/components/common/EmptyState';
import { Heart, ServerCrash, ArrowUpDown, ChevronDown } from 'lucide-react';

const ARTICLES_PER_PAGE = 10;

export default function LikedArticles() {
  const { articles, totalCount, isLoading, error, handleUnlike } = useLikedArticles();
  const [visibleCount, setVisibleCount] = useState(ARTICLES_PER_PAGE);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ARTICLES_PER_PAGE);
  };

  const currentArticles = articles.slice(0, visibleCount);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="large" />
        </div>
      );
    }
    if (error) {
      return <EmptyState Icon={ServerCrash} title="오류 발생" description={error} />;
    }
    if (totalCount === 0) {
      return <EmptyState Icon={Heart} title="좋아요한 기사 없음" description="아직 좋아요를 누른 기사가 없습니다. 관심 있는 기사에 하트를 눌러보세요." />;
    }
    return (
      <div className="space-y-4">
        {currentArticles.map((article) => (
          <LikedArticleItem key={article.id} article={article} onUnlike={handleUnlike} />
        ))}
        {visibleCount < totalCount && (
          <div className="pt-6 flex justify-center">
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-secondary text-secondary-foreground rounded-full hover:bg-accent transition-colors"
            >
              <ChevronDown size={18} />
              더보기
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            좋아요한 기사
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            총 {totalCount}개의 기사에 좋아요를 눌렀습니다.
          </p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors">
          <ArrowUpDown size={16} />
          <span>최신순</span>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6 sm:p-8">
        {renderContent()}
      </div>
    </div>
  );
}
