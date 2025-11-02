
import { Article } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import ArticleLikeButton from "./ArticleLikeButton";
import ArticleSaveButton from "./ArticleSaveButton";
import Favicon from "./common/Favicon";

interface ArticleCardProps {
  article: Article;
  onLikeToggle?: (articleId: number) => void;
  onSaveToggle?: (articleId: number) => void;
}

export default function ArticleCard({ 
  article, 
  onLikeToggle, 
  onSaveToggle, 
}: ArticleCardProps) {

  return (
    <div 
      className={`relative block bg-zinc-800 rounded-lg overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1'}`}
    >
      <Link href={article.url} target="_blank" rel="noopener noreferrer" className="block">
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
          <h3 className="font-bold text-lg text-zinc-100 mb-2 group-hover:text-red-500 transition-colors line-clamp-2">{article.title}</h3>
          <div className="flex items-center text-xs text-zinc-400">
            {article.favicon_url && (
              <Favicon src={article.favicon_url} alt={`${article.source} favicon`} size={16} />
            )}
            <span className="ml-2">{article.source}</span>
            <span className="mx-1.5">·</span>
            <time dateTime={article.published_at}>{formatRelativeTime(article.published_at)}</time>
          </div>
        </div>
      </Link>
      
      <div className="p-4 pt-0 flex justify-end items-center">
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
              onSaveToggle={() => onSaveToggle(article.id)}
            />
          }
        </div>
      </div>
    </div>
  );
}