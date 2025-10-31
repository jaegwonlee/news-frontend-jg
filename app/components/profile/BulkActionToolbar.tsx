'use client';

import { SavedArticleCategory } from "@/lib/api";
import { useState } from "react";

interface BulkActionToolbarProps {
  selectedCount: number;
  categories: SavedArticleCategory[];
  onAssignCategory: (categoryId: number | null) => void;
  onCancel: () => void;
}

export default function BulkActionToolbar({ 
  selectedCount, 
  categories, 
  onAssignCategory, 
  onCancel 
}: BulkActionToolbarProps) {
  const [targetCategoryId, setTargetCategoryId] = useState<string>('null');

  const handleAssign = () => {
    const categoryId = targetCategoryId === 'null' ? null : Number(targetCategoryId);
    onAssignCategory(categoryId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-800 border-t border-zinc-700 p-4 z-40 flex justify-center">
      <div className="w-full max-w-4xl flex justify-between items-center">
        <p className="text-white font-semibold">{selectedCount}개 기사 선택됨</p>
        <div className="flex items-center gap-4">
          <select 
            value={targetCategoryId}
            onChange={(e) => setTargetCategoryId(e.target.value)}
            className="bg-zinc-700 text-white text-sm rounded px-3 py-2 pr-8 cursor-pointer hover:bg-zinc-600 transition-colors"
          >
            <option value="null">카테고리 없음</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
            ))}
          </select>
          <button 
            onClick={handleAssign}
            className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors"
          >
            적용
          </button>
        </div>
        <button onClick={onCancel} className="text-zinc-400 hover:text-white">취소</button>
      </div>
    </div>
  );
}
