'use client';

import { useState } from 'react';
import { useSavedArticlesManager } from '@/hooks/useSavedArticles';
import CategorySidebar from './CategorySidebar';
import SavedArticleCard from './SavedArticleCard';
import ManageCategoriesModal from './ManageCategoriesModal';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { EmptyState } from '@/app/components/common/EmptyState';
import { Bookmark, ServerCrash } from 'lucide-react';

export default function SavedArticles() {
  const {
    articles,
    categories,
    filteredArticles,
    totalCount,
    unclassifiedCount,
    isLoading,
    error,
    selectedCategoryId,
    setSelectedCategoryId,
    handleCreateCategory,
    handleDeleteCategory,
    handleRenameCategory,
    handleUpdateArticleCategory,
    handleUnsaveArticle,
    fetchData,
  } = useSavedArticlesManager();

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const currentCategoryName = 
    selectedCategoryId === 'all' ? '모든 기사' :
    selectedCategoryId === null ? '미분류 기사' :
    categories.find(c => c.id === selectedCategoryId)?.name || '';

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center py-20 w-full"><LoadingSpinner size="large" /></div>;
    }

    if (error) {
      return <div className="p-6 sm:p-8 w-full"><EmptyState Icon={ServerCrash} title="오류 발생" description={error} /></div>;
    }
    
    if (totalCount === 0) {
      return <div className="p-6 sm:p-8 w-full"><EmptyState Icon={Bookmark} title="저장된 기사 없음" description="아직 저장한 기사가 없습니다. 나중에 다시 보고 싶은 기사를 저장해보세요." /></div>;
    }

    return (
      <div className="flex-1 min-w-0">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">{currentCategoryName}</h2>
          <p className="text-base text-muted-foreground mt-1">{filteredArticles.length}개의 기사</p>
        </header>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <SavedArticleCard
                key={article.id}
                article={article}
                categories={categories}
                onMove={handleUpdateArticleCategory}
                onUnsave={handleUnsaveArticle}
              />
            ))}
          </div>
        ) : (
          <EmptyState Icon={Bookmark} title="기사 없음" description="이 카테고리에 저장된 기사가 없습니다." />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-12">
        <CategorySidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          unclassifiedCount={unclassifiedCount}
          totalCount={totalCount}
          onManageCategories={() => setIsManageModalOpen(true)}
        />
        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>

      {isManageModalOpen && (
        <ManageCategoriesModal
          categories={categories}
          onClose={() => setIsManageModalOpen(false)}
          onCreate={async (name) => { await handleCreateCategory(name); await fetchData(); }}
          onRename={async (id, name) => { await handleRenameCategory(id, name); await fetchData(); }}
          onDelete={async (id) => { await handleDeleteCategory(id); await fetchData(); }}
        />
      )}
    </>
  );
}
