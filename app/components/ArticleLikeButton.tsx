"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react"; // Only import Heart
import { useAuth } from "@/app/context/AuthContext";
import { toggleArticleLike } from "@/lib/api";
import { useRouter } from "next/navigation"; // 👈 1. useRouter 임포트

interface ArticleLikeButtonProps {
  articleId: number;
  initialLikes: number;
  initialIsLiked: boolean;
  onLikeToggle?: (articleId: number) => void; // Optional callback for when like status changes
}

export default function ArticleLikeButton({
  articleId,
  initialLikes,
  initialIsLiked,
  onLikeToggle, // Destructure onLikeToggle prop
}: ArticleLikeButtonProps) {
  const { token, logout } = useAuth(); // 👈 2. useAuth에서 logout 함수 가져오기
  const router = useRouter(); // 👈 3. router 선언하기
  console.log("ArticleLikeButton - articleId:", articleId, "token:", token, "initialLikes:", initialLikes, "initialIsLiked:", initialIsLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add this useEffect to update internal state when initial props change
  useEffect(() => {
    setLikes(initialLikes);
    setIsLiked(initialIsLiked);
  }, [initialLikes, initialIsLiked]); // Re-run when these props change

  const handleLikeToggle = async () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log("Attempting to toggle like for articleId:", articleId, "current isLiked:", isLiked);
    try {
      // Pass currentIsLiked to toggleArticleLike
      const response = await toggleArticleLike(token, articleId, isLiked);
      console.log("Like toggle response:", response);
      setLikes(response.data.likes);
      setIsLiked(response.data.isLiked);

      // If onLikeToggle is provided and the article is now unliked, call it
      if (onLikeToggle && !response.data.isLiked) {
        onLikeToggle(articleId);
      }
    } catch (err: any) {
      console.error("Like toggle error:", err);

      // 5. 401 에러(토큰 만료) 감지 및 처리
      if (String(err.message).includes("401") || String(err.message).includes("Unauthorized")) {
        // 401 에러가 발생하면 (토큰 만료)
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        logout(); // (A) AuthContext의 logout 함수를 호출해 토큰/유저 정보 삭제
        router.push("/login"); // (B) 로그인 페이지로 강제 이동
      } else {
        // 그 외 다른 에러 (예: 500 서버 에러)
        setError(err.message || "좋아요 상태 변경에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
      console.log("Like toggle finished. isLoading:", false);
    }
  };

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={`flex items-center gap-1 text-sm transition-colors
        ${isLiked ? "text-red-500 hover:text-red-600" : "text-zinc-400 hover:text-white"}
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? "fill-current text-red-500" : "text-zinc-400"}`} />
      <span>{likes}</span>
      {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
    </button>
  );
}
