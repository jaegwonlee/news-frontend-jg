"use client";

import { EmptyState } from "@/app/components/common/EmptyState";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import { useSavedArticlesManager } from "@/hooks/useSavedArticles";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, FolderOpen, Layers, Plus, ServerCrash, Settings2 } from "lucide-react";
import { useState } from "react";
import ManageCategoriesModal from "./ManageCategoriesModal";
import SavedArticleCard from "./SavedArticleCard";

export default function SavedArticles() {
  const {
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 w-full">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground animate-pulse">보관함을 불러오는 중...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 w-full">
          <EmptyState Icon={ServerCrash} title="오류 발생" description={error} />
          <button
            onClick={() => fetchData()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (totalCount === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 w-full">
          <EmptyState
            Icon={Bookmark}
            title="저장된 기사가 없습니다"
            description="관심 있는 기사를 저장하여 나만의 지식 보관함을 만들어보세요."
          />
        </div>
      );
    }

    if (filteredArticles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 w-full">
          <EmptyState
            Icon={FolderOpen}
            title="이 카테고리는 비어있습니다"
            description="다른 카테고리를 선택하거나 기사를 이 카테고리로 이동시켜보세요."
          />
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20"
      >
        <AnimatePresence mode="popLayout">
          {filteredArticles.map((article, index) => (
            <motion.div
              key={article?.id ? `${article.id}-${index}` : `article-placeholder-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <SavedArticleCard
                article={article}
                categories={categories}
                onMove={handleUpdateArticleCategory}
                onUnsave={handleUnsaveArticle}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="w-full">
      {/* Article Stats Header */}
      <div className="mb-10 p-6 md:p-8 rounded-3xl bg-zinc-900 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 font-black text-9xl italic leading-none select-none pointer-events-none">
          SAVED
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-2">
            <span className="text-blue-500">MY</span> ARCHIVE
          </h1>
          <p className="text-zinc-400 font-medium max-w-md mb-6">
            Manage your personal collection of fight cards and knowledge.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span className="font-bold">{categories.length} Categories</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-red-500" />
              <span className="font-bold">{totalCount} Saved Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-8">
        {/* Category Chips Scroll */}
        <div className="w-full xl:w-auto overflow-hidden">
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide mask-linear-fade">
            <CategoryChip
              label="ALL"
              count={totalCount}
              isActive={selectedCategoryId === "all"}
              onClick={() => setSelectedCategoryId("all")}
              icon={Layers}
            />
            <CategoryChip
              label="Unclassified"
              count={unclassifiedCount}
              isActive={selectedCategoryId === null}
              onClick={() => setSelectedCategoryId(null)}
              icon={FolderOpen}
            />
            <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 mx-2 self-center shrink-0" />
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                label={category.name}
                count={category.article_count ?? 0}
                isActive={selectedCategoryId === category.id}
                onClick={() => setSelectedCategoryId(category.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full xl:w-auto">
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl transition-all font-bold text-sm"
          >
            <Settings2 size={16} />
            <span>Manage</span>
          </button>
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 rounded-xl transition-all font-bold text-sm shadow-lg"
          >
            <Plus size={16} />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="min-h-[50vh]">{renderContent()}</main>

      {isManageModalOpen && (
        <ManageCategoriesModal
          categories={categories}
          onClose={() => setIsManageModalOpen(false)}
          onCreate={async (name) => {
            await handleCreateCategory(name);
            await fetchData();
          }}
          onRename={async (id, name) => {
            await handleRenameCategory(id, name);
            await fetchData();
          }}
          onDelete={async (id) => {
            await handleDeleteCategory(id);
            await fetchData();
          }}
        />
      )}
    </div>
  );
}

function CategoryChip({
  label,
  count,
  isActive,
  onClick,
  icon: Icon,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 shrink-0 border-2 select-none",
        isActive
          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
          : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:text-black dark:hover:text-white"
      )}
    >
      {Icon && <Icon size={16} className={cn(isActive ? "text-white" : "text-zinc-400")} />}
      <span className="uppercase tracking-tight">{label}</span>
      {count > 0 && (
        <span
          className={cn(
            "ml-1 px-2 py-0.5 rounded-md text-[10px] font-black",
            isActive ? "bg-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
