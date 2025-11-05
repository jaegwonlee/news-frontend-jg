'use client';

import { Article } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { incrementArticleView } from '@/lib/api/articles';

interface LatestNewsProps {
  articles: Article[];
}

export default function LatestNews({ articles }: LatestNewsProps) {
  if (articles.length === 0) {
    return <div className="text-center text-zinc-400 py-5">최신 뉴스가 없습니다.</div>;
  }

  const handleArticleClick = (articleId: number) => {
    incrementArticleView(articleId);
  };

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Link 
          href={article.url} 
          key={article.id} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-4 p-0 rounded-lg hover:bg-zinc-800 transition-colors"
          onClick={() => handleArticleClick(article.id)}
        >
          <div className="w-16 h-12 flex-shrink-0 relative">
            <Image
              src={article.thumbnail_url || '/placeholder.svg'} 
              alt={article.title}
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {article.title}
            </h3>
            <div className="flex items-center text-xs text-zinc-500 mt-1">
              <span>{article.source}</span>
              <span className="mx-1.5">·</span>
              <span>
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true, locale: ko })}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}