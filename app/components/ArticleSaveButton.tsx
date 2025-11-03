'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { toggleArticleSave } from '@/lib/api';
import { useRouter } from "next/navigation"; // 👈 useRouter 임포트

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
  const { token, logout } = useAuth(); // 👈 logout 함수 가져오기
  const router = useRouter(); // 👈 router 선언하기
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
      console.error("Save toggle error:", err);
      // 401 에러(토큰 만료) 감지 및 처리
      if (String(err.message).includes("401") || String(err.message).includes("Unauthorized")) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        logout(); // AuthContext의 logout 함수를 호출해 토큰/유저 정보 삭제
        router.push("/login"); // 로그인 페이지로 강제 이동
      } else {
        // 그 외 다른 에러
        setError(err.message || "저장 상태 변경에 실패했습니다.");
      }
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
