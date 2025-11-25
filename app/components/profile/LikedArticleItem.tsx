"use client";

import Link from 'next/link';
import { Article } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import ArticleImageWithFallback from '../ArticleImageWithFallback';
import { X } from 'lucide-react';

interface LikedArticleItemProps {
  article: Article;
  onUnlike: (article: Article) => void;
}

export default function LikedArticleItem({ article, onUnlike }: LikedArticleItemProps) {
  return (
    <div className="group relative flex items-start gap-4 sm:gap-6 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors duration-300">
      {/* Image */}
      <Link href={article.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden shadow-md">
          <ArticleImageWithFallback
            src={article.thumbnail_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">{article.source}</p>
        <Link href={article.url} target="_blank" rel="noopener noreferrer">
          <h3 className="text-base sm:text-lg font-bold text-foreground mt-1 leading-snug line-clamp-2 hover:underline">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {article.description || article.summary}
        </p>
        <p className="text-xs text-muted-foreground mt-3">{formatRelativeTime(article.published_at)}</p>
      </div>
      
      {/* Unlike Button */}
      <button
        onClick={() => onUnlike(article)}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-secondary/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground hover:scale-110"
        aria-label="Unlike article"
      >
        <X size={16} />
      </button>
    </div>
  );
}
