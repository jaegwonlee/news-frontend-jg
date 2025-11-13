'use client';

import { useState, useEffect } from 'react';
import { useSavedArticlesManager } from '@/hooks/useSavedArticles';
import { Article } from '@/types';
import ArticleCard from '@/app/components/ArticleCard';
import PaginationControls from '@/app/components/common/ClientPaginationControls';
import CreateCategoryModal from './CreateCategoryModal';
import ManageCategoriesModal from './ManageCategoriesModal';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';
import { EmptyState } from '@/app/components/common/EmptyState';
import { Plus, Settings, Bookmark, ServerCrash, ChevronDown } from 'lucide-react';

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

  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const articlesPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId]);

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const uncategorizedArticles = articles.filter(article => !article.category_id);

  const handleCreateCategoryAndAssign = async (categoryName: string, articleIdsToAssign: number[]) => {
    try {
      const newCategory = await handleCreateCategory(categoryName);
      if (newCategory && articleIdsToAssign.length > 0) {
        const articlesToUpdate = articles.filter(a => a.saved_article_id && articleIdsToAssign.includes(a.saved_article_id));
        for (const article of articlesToUpdate) {
          await handleUpdateArticleCategory(article, newCategory.id);
        }
      }
      await fetchData(); // Refetch all data
    } catch (error) {
      console.error("Failed to create category and assign articles:", error);
      alert("카테고리 생성 중 오류가 발생했습니다: " + (error as Error).message);
    }
  };

  const renderArticleGrid = () => {
    if (articles.length === 0) {
      return <div className="pt-10"><EmptyState Icon={Bookmark} title="저장된 기사 없음" description="아직 저장한 기사가 없습니다. 나중에 다시 보고 싶은 기사를 저장해보세요." /></div>;
    }
    if (filteredArticles.length === 0) {
      return <div className="pt-10"><EmptyState Icon={Bookmark} title="기사 없음" description={selectedCategoryId === null ? "미분류된 기사가 없습니다." : "이 카테고리에 저장된 기사가 없습니다."} /></div>;
    }
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentArticles.map((article) => (
            <ArticleCard
              key={article.saved_article_id || article.id}
              article={article}
              onSaveToggle={() => handleUnsaveArticle(article)}
            />
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

  const StatCard = ({ label, value }: { label: string; value: number }) => (
    <div className="bg-zinc-800/50 p-4 rounded-lg">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );

  const CategoryTab = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void; }) => (
    <button
      onClick={onClick}
      className={`relative flex-shrink-0 px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-md ${
        isActive ? 'text-white' : 'text-zinc-400 hover:text-white'
      }`}
    >
      {label}
      {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-blue-500 rounded-full"></div>}
    </button>
  );

  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><LoadingSpinner /></div>;
  }

  if (error) {
    return <EmptyState Icon={ServerCrash} title="오류 발생" description={error} />;
  }

  return (
    <>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white">저장된 기사</h2>
              <p className="text-sm text-zinc-400 mt-1">나중에 볼 기사를 카테고리별로 관리하세요.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>새 카테고리</span>
              </button>
            </div>
          </div>
          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="총 기사" value={totalCount} />
            <StatCard label="카테고리" value={categories.length} />
            <StatCard label="미분류" value={unclassifiedCount} />
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="border-t border-b border-zinc-800 px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 overflow-x-auto scroller">
            <div className="flex items-center gap-2 scroller-inner">
              <CategoryTab label="전체" isActive={selectedCategoryId === 'all'} onClick={() => setSelectedCategoryId('all')} />
              <CategoryTab label="미분류" isActive={selectedCategoryId === null} onClick={() => setSelectedCategoryId(null)} />
              {categories.map((cat) => (
                <CategoryTab key={cat.id} label={cat.name} isActive={selectedCategoryId === cat.id} onClick={() => setSelectedCategoryId(cat.id)} />
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 pl-4">
            <button onClick={() => setIsManageModalOpen(true)} className="flex items-center gap-2 p-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors">
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Article Grid */}
        <div className="p-6">
          {renderArticleGrid()}
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateCategoryModal 
          uncategorizedArticles={uncategorizedArticles}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateCategoryAndAssign}
        />
      )}

      {isManageModalOpen && (
        <ManageCategoriesModal
          categories={categories}
          onClose={() => setIsManageModalOpen(false)}
          onRename={async (id, name) => { await handleRenameCategory(id, name); await fetchData(); }}
          onDelete={async (id) => { await handleDeleteCategory(id); await fetchData(); }}
        />
      )}
    </>
  );
}
