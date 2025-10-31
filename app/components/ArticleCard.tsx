import { Article } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import ArticleLikeButton from "./ArticleLikeButton";
import ArticleSaveButton from "./ArticleSaveButton";
import { SavedArticleCategory } from "@/lib/api";

interface ArticleCardProps {
  article: Article;
  onLikeToggle?: (articleId: number) => void;
  onSaveToggle?: (articleId: number) => void;
  isEditMode?: boolean;
  isSelected?: boolean;
  onSelectArticle?: (articleId: number) => void;
}

export default function ArticleCard({ 
  article, 
  onLikeToggle, 
  onSaveToggle, 
  isEditMode, 
  isSelected, 
  onSelectArticle 
}: ArticleCardProps) {

  const handleCardClick = () => {
    if (isEditMode && onSelectArticle && article.saved_article_id) {
      onSelectArticle(article.saved_article_id);
    }
  };

  return (
    <div 
      className={`relative block bg-zinc-800 rounded-lg overflow-hidden group transition-all duration-300 ease-in-out ${isEditMode ? 'cursor-pointer' : 'hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1'} ${isSelected ? 'ring-2 ring-red-500' : ''}`}
      onClick={handleCardClick}
    >
      {isEditMode && (
        <div className="absolute top-2 right-2 z-20">
          <input 
            type="checkbox" 
            checked={isSelected}
            readOnly
            className="h-5 w-5 rounded text-red-500 bg-zinc-700 border-zinc-600 focus:ring-red-500"
          />
        </div>
      )}
      <Link href={article.url} target="_blank" rel="noopener noreferrer" className={`block ${isEditMode ? 'pointer-events-none' : ''}`}> 
        <div className="relative w-full h-40 overflow-hidden">
          <Image
            src={article.thumbnail_url || '/placeholder.png'}
            alt={`${article.title} thumbnail`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-zinc-100 mb-2 group-hover:text-red-500 transition-colors">{article.title}</h3>
          <div className="flex items-center text-xs text-zinc-400">
            {article.favicon_url && (
              <Image src={article.favicon_url} alt={`${article.source} favicon`} width={16} height={16} className="mr-2 rounded" />
            )}
            <span>{article.source}</span>
            <span className="mx-1.5">·</span>
            <time dateTime={article.published_at}>{formatRelativeTime(article.published_at)}</time>
          </div>
        </div>
      </Link>
      
      <div className={`p-4 pt-0 flex justify-end items-center ${isEditMode ? 'opacity-50' : ''}`}>
        <div className="flex gap-2">
          { onLikeToggle && (article.id && article.like_count !== undefined && article.isLiked !== undefined) &&
            <ArticleLikeButton
              articleId={article.id}
              initialLikes={article.like_count}
              initialIsLiked={article.isLiked}
              onLikeToggle={onLikeToggle}
            />
          }
          { onSaveToggle && (article.id && article.isSaved !== undefined) &&
            <ArticleSaveButton
              articleId={article.id}
              initialIsSaved={article.isSaved}
              onSaveToggle={onSaveToggle}
            />
          }
        </div>
      </div>
    </div>
  );
}