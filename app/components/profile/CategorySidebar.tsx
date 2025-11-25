"use client";

import { SavedArticleCategory } from "@/types";
import { Folder, Inbox, Tag, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import * as React from "react";

interface CategorySidebarProps {
  categories: SavedArticleCategory[];
  selectedCategoryId: number | 'all' | null;
  onSelectCategory: (id: number | 'all' | null) => void;
  unclassifiedCount: number;
  totalCount: number;
  onManageCategories: () => void;
}

export default function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  unclassifiedCount,
  totalCount,
  onManageCategories,
}: CategorySidebarProps) {

  const CategoryItem = ({
    id,
    name,
    count,
    icon,
    onClick
  }: {
    id: number | 'all' | null;
    name: string;
    count: number;
    icon: React.ReactNode;
    onClick: () => void;
  }) => {
    const isSelected = selectedCategoryId === id;
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200",
          isSelected
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        {icon}
        <span className="flex-1 text-left truncate">{name}</span>
        <span className={cn("px-2 py-0.5 rounded-full text-xs", isSelected ? "bg-primary/20" : "bg-muted/80")}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
      <h2 className="text-lg font-bold text-foreground px-3">분류</h2>
      <div className="space-y-1">
        <CategoryItem
          id="all"
          name="모든 기사"
          count={totalCount}
          icon={<Inbox size={18} />}
          onClick={() => onSelectCategory('all')}
        />
        <CategoryItem
          id={null}
          name="미분류 기사"
          count={unclassifiedCount}
          icon={<Folder size={18} />}
          onClick={() => onSelectCategory(null)}
        />
      </div>

      <div className="pt-4">
        <div className="flex justify-between items-center px-3 mb-2">
            <h2 className="text-lg font-bold text-foreground">내 카테고리</h2>
            <button 
                onClick={onManageCategories}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label="Manage categories"
            >
                <Settings size={16} />
            </button>
        </div>
        <div className="space-y-1">
          {categories.map(cat => (
            <CategoryItem
              key={cat.id}
              id={cat.id}
              name={cat.name}
              count={cat.article_count || 0}
              icon={<Tag size={18} />}
              onClick={() => onSelectCategory(cat.id)}
            />
          ))}
          <button 
            onClick={onManageCategories}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
          >
              <Plus size={18} />
              <span>카테고리 추가</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
