'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { toggleArticleSave } from '@/lib/api';

interface ArticleSaveButtonProps {
  articleId: number;
  initialIsSaved: boolean;
  onSaveToggle?: (articleId: number) => void;
}

export default function ArticleSaveButton({
  articleId,
  initialIsSaved,
  onSaveToggle,
}: ArticleSaveButtonProps) {
  const { token } = useAuth();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  const handleSaveToggle = async () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await toggleArticleSave(token, articleId, isSaved);
      const newIsSaved = !isSaved;
      setIsSaved(newIsSaved);

      if (onSaveToggle && !newIsSaved) {
        onSaveToggle(articleId);
      }
    } catch (err: any) {
      setError(err.message || "저장 상태 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSaveToggle}
      disabled={isLoading}
      className={`flex items-center gap-1 text-sm transition-colors ${
        isSaved ? "text-blue-500 hover:text-blue-600" : "text-zinc-400 hover:text-white"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isSaved ? "저장 취소" : "저장하기"}
    >
      <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current text-blue-500" : "text-zinc-400"}`} />
      {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
    </button>
  );
}
