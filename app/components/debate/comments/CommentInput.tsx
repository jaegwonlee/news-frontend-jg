"use client";

import { Button } from "@/app/components/common/Button";
import { useAuth } from "@/app/context/AuthContext";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CommentInputProps {
  onSubmit: (content: string, parentId: number | null) => Promise<void>;
  initialContent?: string;
  onCancel?: () => void;
  parentId?: number | null;
  placeholder?: string;
}

export default function CommentInput({
  onSubmit,
  initialContent = "",
  onCancel,
  parentId = null,
  placeholder = "이 토픽에 대한 당신의 날카로운 의견을 남겨주세요...",
}: CommentInputProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, parentId);
      setContent(""); // Clear input after successful submission
      if (onCancel) onCancel(); // Close edit/reply form
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl border-dashed">
        <p className="text-zinc-500 dark:text-zinc-400 mb-2 font-medium">로그인이 필요합니다</p>
        <a
          href="/login"
          className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold hover:opacity-80 transition-opacity shadow-lg"
        >
          로그인하고 참여하기
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-start w-full group">
      <div className="shrink-0 pt-1 hidden sm:block">
        <Image
          src={user.profile_image_url || "/user-placeholder.svg"}
          alt={user.nickname || "user"}
          width={48}
          height={48}
          className="rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm object-cover bg-zinc-100 dark:bg-zinc-800"
        />
      </div>
      <div
        className={cn(
          "grow relative transition-all duration-300 rounded-2xl border overflow-hidden",
          isFocused
            ? "shadow-lg ring-1 ring-black/5 dark:ring-white/10 border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-800"
            : "shadow-sm border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50"
        )}
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full p-5 text-[15px] leading-relaxed transition-all duration-200 resize-none min-h-[120px]",
            "bg-transparent",
            "text-black dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500",
            "focus:outline-none"
          )}
          disabled={isSubmitting}
        />

        {/* Actions Bar */}
        <div className="flex items-center justify-between px-3 pb-3 pt-2 bg-transparent">
          {/* Left side actions (optional later: markdown help etc) */}
          <div />

          <div className="flex gap-2">
            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
                className="text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                취소
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isSubmitting}
              className={cn(
                "rounded-xl font-bold transition-all transform active:scale-95 px-6",
                content.trim()
                  ? "bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black shadow-lg"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
              )}
            >
              {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              {isSubmitting ? "등록 중..." : initialContent ? "수정완료" : "등록하기"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
