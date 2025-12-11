"use client";

import { Article } from "@/lib/types/article";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ArticleEmbedCardProps {
  article: Article;
  className?: string;
}

export default function ArticleEmbedCard({ article, className }: ArticleEmbedCardProps) {
  // Use explicit color classes with !important to force overrides if necessary,
  // though clean specificity should handle it.
  // Light: bg-white, text-zinc-900
  // Dark: bg-zinc-800, text-zinc-100 (Clean dark gray card, white-ish text)

  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block relative w-full rounded-xl overflow-hidden border transition-all duration-200",
        // Base structure
        "flex flex-row h-24 min-h-[96px]", // Fixed height for consistency
        // Colors - Light
        "bg-white border-zinc-200",
        // Colors - Dark (explicitly overriding)
        "dark:bg-zinc-700 dark:border-zinc-700",
        // Hover effects
        "hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-400/50",
        className
      )}
    >
      {/* Image Section - Left */}
      <div className="relative w-24 h-full shrink-0 bg-zinc-100 dark:bg-zinc-900/50">
        <Image
          src={article.thumbnail_url || "/placeholder.png"}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
      </div>

      {/* Content Section - Right */}
      <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
        {/* Source & Badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 line-clamp-1">{article.source}</span>
          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 px-1.5 py-0.5 rounded-sm">
            뉴스
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-bold leading-snug line-clamp-2 text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>

        {/* External Link Icon (Absolute bottom right) */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ExternalLink size={12} className="text-zinc-400 dark:text-zinc-500" />
        </div>
      </div>
    </Link>
  );
}
