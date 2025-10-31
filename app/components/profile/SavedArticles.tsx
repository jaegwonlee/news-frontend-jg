'use client';

import { useState } from 'react';
import { useSavedArticlesManager } from '@/hooks/useSavedArticles';
import ArticleCard from '@/app/components/ArticleCard';
import CategoryManager from '@/app/components/profile/CategoryManager';
import CategorySelector from '@/app/components/profile/CategorySelector';
import BulkActionToolbar from './BulkActionToolbar';

// A simple spinner component for loading states
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
  </div>
);

// A component for displaying empty states with a message
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-20 bg-zinc-800/50 rounded-lg">
    <p className="text-zinc-400">{message}</p>
  </div>
);

export default function SavedArticles() {
  const { 
    categories,
    filteredArticles,
    isLoading, 
    error, 
    selectedCategoryId,
    setSelectedCategoryId,
    handleCreateCategory,
    handleDeleteCategory,
    handleRenameCategory,
    handleUpdateArticleCategory,
    handleUnsaveArticle
  } = useSavedArticlesManager();

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);

  const handleSelectArticle = (articleId: number) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId) 
        : [...prev, articleId]
    );
  };

  const handleBulkAssignCategory = async (categoryId: number | null) => {
    console.log('Assigning category to articles:', selectedArticles);
    await Promise.all(selectedArticles.map(articleId => handleUpdateArticleCategory(articleId, categoryId)));
    setSelectedArticles([]);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setSelectedArticles([]);
    setIsEditMode(false);
  };

  return (
    <section className="mt-12 bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-700 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-repeat bg-center opacity-5" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`}}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-700">
          <h2 className="text-3xl font-bold text-white">저장된 기사</h2>
          <div className="flex items-center gap-4">
            <CategoryManager onCreateCategory={handleCreateCategory} />
            <button 
              onClick={() => {
                setIsEditMode(!isEditMode);
                setSelectedArticles([]); // Reset selection when toggling edit mode
              }}
              className={`px-4 py-2 rounded-md font-semibold transition-colors ${isEditMode ? 'bg-red-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
            >
              {isEditMode ? '완료' : '편집'}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <CategorySelector
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onDeleteCategory={handleDeleteCategory}
            onRenameCategory={handleRenameCategory}
          />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <EmptyState message={`오류: ${error}`} />
        ) : filteredArticles.length === 0 ? (
          <EmptyState message={selectedCategoryId === null ? "아직 저장된 기사가 없습니다." : "선택된 카테고리에 저장된 기사가 없습니다."} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
              <ArticleCard 
                key={article.saved_article_id || article.id} 
                article={article} 
                onSaveToggle={handleUnsaveArticle} 
                onLikeToggle={undefined} 
                isEditMode={isEditMode}
                isSelected={selectedArticles.includes(article.saved_article_id!)}
                onSelectArticle={handleSelectArticle}
              />
            ))}
          </div>
        )}
      </div>
      {isEditMode && selectedArticles.length > 0 && (
        <BulkActionToolbar 
          selectedCount={selectedArticles.length}
          categories={categories}
          onAssignCategory={handleBulkAssignCategory}
          onCancel={handleCancelEdit}
        />
      )}
    </section>
  );
}
