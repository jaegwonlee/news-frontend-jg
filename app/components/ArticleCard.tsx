import { Article } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import ArticleLikeButton from "./ArticleLikeButton"; // Import ArticleLikeButton

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="block bg-zinc-800 rounded-lg overflow-hidden group"> {/* Changed Link to div to wrap ArticleLikeButton */}
      <Link href={article.url} target="_blank" rel="noopener noreferrer"> {/* Link only for image and title */}
        {article.thumbnail_url && (
          <div className="relative w-full h-40">
            <Image
              src={article.thumbnail_url}
              alt={`${article.title} thumbnail`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              className="group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
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
      {/* Add ArticleLikeButton */}
      {article.id && article.like_count !== undefined && article.isLiked !== undefined && (
        <div className="p-4 pt-0 flex justify-end">
          <ArticleLikeButton
            articleId={article.id}
            initialLikes={article.like_count}
            initialIsLiked={article.isLiked}
          />
        </div>
      )}
    </div>
  );
}