"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react"; // Only import Heart
import { useAuth } from "@/app/context/AuthContext";
import { toggleArticleLike } from "@/lib/api";

interface ArticleLikeButtonProps {
  articleId: number;
  initialLikes: number;
  initialIsLiked: boolean;
}

export default function ArticleLikeButton({
  articleId,
  initialLikes,
  initialIsLiked,
}: ArticleLikeButtonProps) {
  const { token } = useAuth();
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
      const response = await toggleArticleLike(token, articleId);
      console.log("Like toggle response:", response);
      setLikes(response.data.likes);
      setIsLiked(response.data.isLiked);
    } catch (err: any) {
      setError(err.message || "좋아요 상태 변경에 실패했습니다.");
      console.error("Like toggle error:", err);
      // Optionally revert UI state if API call fails
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
