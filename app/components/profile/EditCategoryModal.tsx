
'use client';

import { useState, useEffect } from 'react';
import { Article, SavedArticleCategory } from '@/types';
import { X, PlusCircle, MinusCircle } from 'lucide-react';

interface EditCategoryModalProps {
  category: SavedArticleCategory;
  articlesInCategory: Article[];
  uncategorizedArticles: Article[];
  onClose: () => void;
  onSave: (categoryId: number, newName: string, articlesToAdd: number[], articlesToRemove: number[]) => Promise<void>;
}

import Image from 'next/image';

const ArticleItem = ({ article, onToggle, isSelected, action }: { article: Article; onToggle: (id: number) => void; isSelected: boolean; action: 'add' | 'remove' }) => (
  <div 
    className={`flex items-center gap-4 p-2 rounded-lg transition-colors ${isSelected ? (action === 'add' ? 'bg-green-500/20' : 'bg-red-500/20') : 'hover:bg-zinc-700/50'}`}
  >
    <Image 
      src={article.thumbnail_url || '/placeholder.png'}
      alt={article.title}
      width={64}
      height={36}
      className="rounded object-cover w-16 h-9"
    />
    <span className="text-white line-clamp-1 flex-1 mr-4">{article.title}</span>
    <button onClick={() => onToggle(article.saved_article_id!)} className="p-1">
      {action === 'add' ? (
        <PlusCircle size={20} className={`transition-transform ${isSelected ? 'text-green-400 rotate-45' : 'text-zinc-400 hover:text-white'}`} />
      ) : (
        <MinusCircle size={20} className={`transition-transform ${isSelected ? 'text-red-400 rotate-45' : 'text-zinc-400 hover:text-white'}`} />
      )}
    </button>
  </div>
);

export default function EditCategoryModal({ category, articlesInCategory, uncategorizedArticles, onClose, onSave }: EditCategoryModalProps) {
  const [categoryName, setCategoryName] = useState(category.name);
  const [articlesToAdd, setArticlesToAdd] = useState<number[]>([]);
  const [articlesToRemove, setArticlesToRemove] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleArticleToAdd = (id: number) => {
    setArticlesToAdd(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleArticleToRemove = (id: number) => {
    setArticlesToRemove(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(category.id, categoryName, articlesToAdd, articlesToRemove);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 md:p-6 flex justify-between items-center border-b border-zinc-700">
          <h2 className="text-xl md:text-2xl font-bold text-white">카테고리 수정</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800 transition-colors"><X className="text-zinc-400" /></button>
        </header>

        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto">
          {/* Left Side: Rename & Articles to Add */}
          <div className="flex flex-col gap-4 md:gap-6">
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-zinc-300 mb-2">카테고리 이름</label>
              <input
                id="category-name"
                type="text"
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="w-full p-3 rounded-md bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-3">기사 추가하기 (미분류)</h3>
              <div className="bg-zinc-800/50 rounded-lg p-2 md:p-3 border border-zinc-700 h-48 md:h-64 overflow-y-auto space-y-2">
                {uncategorizedArticles.length > 0 ? (
                  uncategorizedArticles.map(article => (
                    <ArticleItem key={article.saved_article_id} article={article} onToggle={toggleArticleToAdd} isSelected={articlesToAdd.includes(article.saved_article_id!)} action="add" />
                  ))
                ) : (
                  <p className="text-center text-zinc-500 pt-10">추가할 미분류 기사가 없습니다.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Articles to Remove */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-white mb-3">현재 포함된 기사 ({articlesInCategory.length})</h3>
            <div className="bg-zinc-800/50 rounded-lg p-2 md:p-3 border border-zinc-700 h-48 md:h-[20.5rem] overflow-y-auto space-y-2">
              {articlesInCategory.length > 0 ? (
                articlesInCategory.map(article => (
                  <ArticleItem key={article.saved_article_id} article={article} onToggle={toggleArticleToRemove} isSelected={articlesToRemove.includes(article.saved_article_id!)} action="remove" />
                ))
              ) : (
                <p className="text-center text-zinc-500 pt-10">카테고리에 기사가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        <footer className="p-4 md:p-6 flex flex-col sm:flex-row justify-end gap-4 border-t border-zinc-700">
          <button onClick={onClose} className="px-4 py-2 md:px-6 md:py-3 bg-zinc-700 text-white rounded-md font-semibold hover:bg-zinc-600 transition-colors">취소</button>
          <button onClick={handleSave} disabled={isSaving || !categoryName.trim()} className="px-4 py-2 md:px-6 md:py-3 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 transition-colors disabled:bg-zinc-500 disabled:cursor-not-allowed">
            {isSaving ? '저장 중...' : '변경사항 저장'}
          </button>
        </footer>
      </div>
    </div>
  );
}
