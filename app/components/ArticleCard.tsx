"use client";

import { Article } from "@/types";
import { MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ArticleLikeButton from "./ArticleLikeButton";
import ArticleSaveButton from "./ArticleSaveButton";
import ClientOnlyTime from "./common/ClientOnlyTime";
import Favicon from "./common/Favicon";

interface ArticleCardProps {
  article: Article;
  variant?: "hero" | "standard" | "horizontal" | "compact" | "overlay";
  onLikeToggle?: (article: Article) => void;
  onSaveToggle?: (article: Article) => void;
  onCommentIconClick?: (article: Article) => void;
  className?: string;
  hoverColor?: "red" | "blue";
  hideImage?: boolean;
}

export default function ArticleCard({
  article,
  variant = "standard",
  onLikeToggle,
  onSaveToggle,
  onCommentIconClick,
  className = "",
  hoverColor = "red",
  hideImage = false,
}: ArticleCardProps) {
  const borderColorClass = hoverColor === "red" ? "group-hover:border-red-500" : "group-hover:border-blue-500";
  const textColorClass = hoverColor === "red" ? "group-hover:text-red-500" : "group-hover:text-blue-500";

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCommentIconClick) {
      onCommentIconClick(article);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLikeToggle) onLikeToggle(article);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSaveToggle) onSaveToggle(article);
  };

  const renderMetaInfo = (showTime = true) => (
    <div className="flex items-center text-xs text-muted-foreground mt-2 gap-2">
      {article.favicon_url && <Favicon src={article.favicon_url} alt={`${article.source} favicon`} size={14} />}
      <span className="font-medium">{article.source}</span>
      {showTime && (
        <>
          <span className="text-zinc-600 dark:text-zinc-500">·</span>
          <ClientOnlyTime date={article.published_at} />
        </>
      )}
    </div>
  );

  const renderActionButtons = (light = false) => (
    <div className={`flex gap-3 items-center ${light ? "text-white/80" : "text-muted-foreground"}`}>
      {onCommentIconClick && (
        <button
          onClick={handleCommentClick}
          className="flex items-center gap-1 text-xs hover:text-foreground transition-colors"
        >
          <MessageSquare size={14} />
          <span>{article.comment_count ?? 0}</span>
        </button>
      )}
      {onLikeToggle && article.like_count !== undefined && (
        <ArticleLikeButton likes={article.like_count} isLiked={article.isLiked || false} onClick={handleLikeClick} />
      )}
      {onSaveToggle && article.isSaved !== undefined && (
        <ArticleSaveButton isSaved={article.isSaved || false} onClick={handleSaveClick} />
      )}
    </div>
  );

  // --- Variant: Hero (Large, Top Image, Big Title) ---
  if (variant === "hero") {
    return (
      <Link href={article.url} target="_blank" className={`group block relative w-full ${className}`}>
        <div className="relative w-full aspect-video overflow-hidden rounded-xl mb-4 hover-zoom-img">
          <Image
            src={article.thumbnail_url || "/placeholder.png"}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            unoptimized
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className={`text-2xl md:text-3xl font-bold leading-tight transition-colors ${textColorClass}`}>
            {article.title}
          </h2>
          <p className="text-muted-foreground line-clamp-2 md:line-clamp-3 text-sm md:text-base">{article.summary}</p>
          <div className="flex justify-between items-center mt-2">
            {renderMetaInfo()}
            {renderActionButtons()}
          </div>
        </div>
      </Link>
    );
  }

  // --- Variant: Horizontal (Image Left, Content Right) ---
  if (variant === "horizontal") {
    return (
      <Link href={article.url} target="_blank" className={`group flex gap-4 w-full items-start ${className}`}>
        {!hideImage && (
          <div className="relative w-24 h-24 md:w-32 md:h-24 flex-shrink-0 overflow-hidden rounded-lg hover-zoom-img">
            <Image
              src={article.thumbnail_url || "/placeholder.png"}
              alt={article.title}
              fill
              className="object-cover"
              sizes="150px"
              unoptimized
            />
          </div>
        )}
        <div className="flex flex-col flex-grow min-w-0 justify-between h-full">
          <div>
            <h3
              className={`font-bold text-sm md:text-base leading-snug mb-1 transition-colors ${textColorClass} line-clamp-2`}
            >
              {article.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block mb-1">{article.summary}</p>
          </div>
          <div className="flex justify-between items-center mt-1">
            {renderMetaInfo(false)}
            {renderActionButtons()}
          </div>
        </div>
      </Link>
    );
  }

  // --- Variant: Compact (Minimal, Title + Meta) ---
  if (variant === "compact") {
    return (
      <Link
        href={article.url}
        target="_blank"
        className={`group block w-full py-2 border-b border-border last:border-0 ${className}`}
      >
        <h3 className={`font-medium text-sm leading-snug mb-1 transition-colors ${textColorClass} line-clamp-2`}>
          {article.title}
        </h3>
        <div className="flex justify-between items-center">{renderMetaInfo(false)}</div>
      </Link>
    );
  }

  // --- Variant: Overlay (Image Background, Text Overlay) ---
  if (variant === "overlay") {
    return (
      <Link
        href={article.url}
        target="_blank"
        className={`group relative block w-full aspect-[4/5] overflow-hidden rounded-xl ${className}`}
      >
        <Image
          src={article.thumbnail_url || "/placeholder.png"}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 300px"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end">
          <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <span className="inline-block px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded mb-2">
              {article.source}
            </span>
            <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-2 group-hover:text-red-400 transition-colors">
              {article.title}
            </h3>
            <div className="flex gap-3 text-white/70 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              <ClientOnlyTime date={article.published_at} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // --- Variant: Standard (Default - Card Style) ---
  return (
    <Link
      href={article.url}
      target="_blank"
      className={`group block h-full flex flex-col bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 ${className}`}
    >
      <div className="relative w-full aspect-video overflow-hidden hover-zoom-img">
        <Image
          src={article.thumbnail_url || "/placeholder.png"}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3
          className={`font-bold text-base md:text-lg leading-tight mb-2 transition-colors ${textColorClass} line-clamp-2`}
        >
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">{article.summary}</p>
        <div className="flex justify-between items-center pt-2 border-t border-border mt-auto">
          {renderMetaInfo()}
          {renderActionButtons()}
        </div>
      </div>
    </Link>
  );
}
