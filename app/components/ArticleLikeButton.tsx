"use client";

import { Heart } from "lucide-react";

interface ArticleLikeButtonProps {
  likes: number;
  isLiked: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export default function ArticleLikeButton({ likes, isLiked, onClick, disabled = false }: ArticleLikeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 text-sm transition-colors
        ${isLiked ? "text-red-500 hover:text-red-600" : "text-zinc-400 hover:text-white"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
      <span>{likes}</span>
    </button>
  );
}
