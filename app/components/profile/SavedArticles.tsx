'use client';

import { useState, useEffect } from 'react';
import { useSavedArticlesManager } from '@/hooks/useSavedArticles';
import { Article, SavedArticleCategory } from '@/types';
import ArticleCard from '@/app/components/ArticleCard';
import CategorySelector from '@/app/components/profile/CategorySelector';
import PaginationControls from '@/app/components/common/ClientPaginationControls';
import CreateCategoryModal from './CreateCategoryModal';
import EditCategoryModal from './EditCategoryModal'; // Import the new edit modal
import { Plus } from 'lucide-react';

// A simple spinner component for loading states
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
  </div>
);

// A component for displaying empty states with a message
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-20 bg-zinc-800/50 rounded-lg h-full flex justify-center items-center">
    <p className="text-zinc-400">{message}</p>
  </div>
);

export default function SavedArticles() {
  const {
    articles,
    categories,
    filteredArticles,
    totalCount, // Get totalCount
    categoryCounts, // Get categoryCounts
    isLoading,
    error,
    selectedCategoryId,
    setSelectedCategoryId,
    handleCreateCategory,
    handleDeleteCategory,
    handleRenameCategory,
    handleUpdateArticleCategory,
    handleUnsaveArticle,
    fetchData, // Get the refetch function from the hook
  } = useSavedArticlesManager();

  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SavedArticleCategory | null>(null);
  const [showCategoryList, setShowCategoryList] = useState(false); // New state for category list visibility
  const articlesPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId]);

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const uncategorizedArticles = articles.filter(article => !article.category_id);

  const handleCreateCategoryAndAssign = async (categoryName: string, articleIds: number[]) => {
    try {
      const newCategory = await handleCreateCategory(categoryName);
      if (newCategory && articleIds.length > 0) {
        await Promise.all(articleIds.map(articleId => handleUpdateArticleCategory(articleId, newCategory.id)));
      }
      await fetchData(); // Refetch to get the final, true state from the server
    } catch (error) {
      console.error("Failed to create category and assign articles:", error);
      alert("카테고리 생성 중 오류가 발생했습니다: " + (error as Error).message);
    }
  };

  const handleOpenEditModal = (category: SavedArticleCategory) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = async (categoryId: number, newName: string, articlesToAdd: number[], articlesToRemove: number[]) => {
    try {
      // 1. Rename category if name changed
      if (editingCategory && editingCategory.name !== newName && newName.trim() !== '') {
        await handleRenameCategory(categoryId, newName);
      }
      
      // 2. Perform additions and removals
      const updatePromises = [
        ...articlesToAdd.map(articleId => handleUpdateArticleCategory(articleId, categoryId)),
        ...articlesToRemove.map(articleId => handleUpdateArticleCategory(articleId, null))
      ];
      
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }

      await fetchData(); // Refetch data once all operations are done
    } catch (error) {
      console.error("Failed to save category changes:", error);
      alert("카테고리 변경사항 저장 중 오류가 발생했습니다: " + (error as Error).message);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <EmptyState message={`오류: ${error}`} />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Right Main Content for Articles */}
        <main className="flex-1">
          {/* Moved Category Section */}
          <div className="mb-8 bg-zinc-900 p-4 rounded-lg border border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                카테고리
                <span className="text-lg font-medium text-zinc-400 ml-2">
                  (총 {totalCount}개)
                </span>
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowCategoryList(!showCategoryList)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold bg-zinc-700 text-white hover:bg-zinc-600 transition-colors"
                  title="카테고리 목록 토글"
                >
                  {showCategoryList ? '목록 닫기' : '목록 보기'}
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                  title="새 카테고리 만들기"
                >
                  <Plus size={16} />
                  추가
                </button>
              </div>
            </div>
            {showCategoryList && (
              <div className="mt-4 bg-zinc-800 p-2 rounded-lg border border-zinc-700">
                <CategorySelector
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  categoryCounts={categoryCounts} // Pass counts
                  onSelectCategory={setSelectedCategoryId}
                  onDeleteCategory={handleDeleteCategory}
                  onEditCategory={handleOpenEditModal}
                />
              </div>
            )}
          </div>

          {articles.length === 0 ? (
            <EmptyState message={"아직 저장된 기사가 없습니다."} />
          ) : filteredArticles.length === 0 ? (
            <EmptyState message={selectedCategoryId === null ? "미분류된 기사가 없습니다." : "이 카테고리에 저장된 기사가 없습니다."} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentArticles.map((article) => (
                  <ArticleCard
                    key={article.saved_article_id || article.id}
                    article={article}
                    onSaveToggle={() => handleUnsaveArticle(article.saved_article_id!)}
                  />
                ))}
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </main>
      </div>

      {isCreateModalOpen && (
        <CreateCategoryModal 
          uncategorizedArticles={uncategorizedArticles}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCategoryAndAssign}
        />
      )}

      {isEditModalOpen && editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          articlesInCategory={articles.filter(a => a.category_id === editingCategory.id)}
          uncategorizedArticles={uncategorizedArticles}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveChanges}
        />
      )}
    </>
  );
}
