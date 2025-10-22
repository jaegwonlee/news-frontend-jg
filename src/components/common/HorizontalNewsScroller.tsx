'use client';

import StyledArticleTitle from "@/components/common/StyledArticleTitle";
import React from 'react';
import Link from 'next/link';
import { Article } from '@/types/article';

interface HorizontalNewsScrollerProps {
  news: Article[];
}

const HorizontalNewsScroller: React.FC<HorizontalNewsScrollerProps> = ({ news }) => {
  if (!news || news.length === 0) {
    return null;
  }

  const duplicatedNews = [...news, ...news, ...news, ...news];

  return (
    <>
      <div className="flex items-center" style={{ animation: 'marquee 60s linear infinite' }}>
        {duplicatedNews.map((article, index) => (
          <Link
            key={`${article.id}-${index}`}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 truncate max-w-md text-sm text-neutral-300 hover:text-white px-6"
            title={article.title}
          >
            <StyledArticleTitle title={article.title} />
          </Link>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        /* Ensure the animation container doesn't pause on hover when the link itself has a hover effect */
        .flex:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
};

export default HorizontalNewsScroller;
