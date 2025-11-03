
import { SavedArticleCategory } from "@/types";
import { useState } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

interface CategorySelectorProps {
  categories: SavedArticleCategory[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  onDeleteCategory: (id: number) => void;
  onEditCategory: (category: SavedArticleCategory) => void; // New prop to open the edit modal
}

const CategoryItem = ({ category, isActive, onSelect, onEdit, onDelete }: {
  category: SavedArticleCategory;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={onSelect}
        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex justify-between items-center cursor-pointer ${isActive ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
      >
        <span>{category.name}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
          className="p-1 rounded-full hover:bg-zinc-600"
        >
          <MoreVertical size={18} />
        </button>
      </div>
      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg z-10">
          <button onClick={() => { onEdit(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-zinc-800">
            <Edit size={14} /> 수정
          </button>
          <button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-zinc-800">
            <Trash2 size={14} /> 삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default function CategorySelector({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory, 
  onDeleteCategory,
  onEditCategory
}: CategorySelectorProps) {

  const baseStyle = "w-full text-left px-4 py-3 rounded-lg transition-colors";
  const activeStyle = "bg-zinc-700 text-white";
  const inactiveStyle = "text-zinc-400 hover:bg-zinc-800 hover:text-white";

  return (
    <nav className="flex flex-col space-y-1">
      <button 
        onClick={() => onSelectCategory(null)}
        className={`${baseStyle} ${selectedCategoryId === null ? activeStyle : inactiveStyle}`}
      >
        전체
      </button>
      {categories.map(category => (
        <CategoryItem
          key={category.id}
          category={category}
          isActive={selectedCategoryId === category.id}
          onSelect={() => onSelectCategory(category.id)}
          onEdit={() => onEditCategory(category)}
          onDelete={() => onDeleteCategory(category.id)}
        />
      ))}
    </nav>
  );
}
