import { SavedArticleCategory } from "@/lib/api";
import { useState } from 'react';
import { Edit, Trash2, X } from 'lucide-react';

interface CategorySelectorProps {
  categories: SavedArticleCategory[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  onDeleteCategory: (id: number) => void;
  onRenameCategory: (id: number, newName: string) => void;
}

const Modal = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={onClose}>
    <div className="bg-zinc-800 p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export default function CategorySelector({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory, 
  onDeleteCategory,
  onRenameCategory
}: CategorySelectorProps) {
  const [editingCategory, setEditingCategory] = useState<SavedArticleCategory | null>(null);
  const [renameName, setRenameName] = useState("");

  const handleRename = () => {
    if (editingCategory && renameName.trim()) {
      onRenameCategory(editingCategory.id, renameName.trim());
      setEditingCategory(null);
      setRenameName('');
    }
  };

  const baseStyle = "px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 cursor-pointer flex items-center gap-2";
  const activeStyle = "bg-red-500 text-white";
  const inactiveStyle = "bg-zinc-700 text-zinc-300 hover:bg-zinc-600";

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        <button 
          onClick={() => onSelectCategory(null)}
          className={`${baseStyle} ${selectedCategoryId === null ? activeStyle : inactiveStyle}`}
        >
          미분류
        </button>
        {categories.map(category => (
          <div 
            key={category.id}
            className={`group relative ${baseStyle} ${selectedCategoryId === category.id ? activeStyle : inactiveStyle}`}
            onClick={() => onSelectCategory(category.id)}
          >
            <span>{category.name}</span>
            <div className="absolute inset-0 bg-black/20 rounded-full flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingCategory(category); setRenameName(category.name); }}
                className="text-white hover:text-yellow-400"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteCategory(category.id); }}
                className="text-white hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingCategory && (
        <Modal onClose={() => setEditingCategory(null)}>
          <h3 className="text-xl font-bold text-white mb-4">카테고리 이름 변경</h3>
          <input
            type="text"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            className="w-full p-3 rounded bg-zinc-700 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="mt-6 flex justify-end gap-4">
            <button onClick={() => setEditingCategory(null)} className="px-4 py-2 bg-zinc-600 text-white rounded-md hover:bg-zinc-500 transition-colors">취소</button>
            <button onClick={handleRename} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">변경</button>
          </div>
        </Modal>
      )}
    </>
  );
}
