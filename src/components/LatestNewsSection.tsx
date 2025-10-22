'use client';

import StyledArticleTitle from "@/components/common/StyledArticleTitle";
import Link from 'next/link';
import Image from 'next/image';
import { FAVICON_URLS } from "@/lib/constants";
import { Article } from '@/types/article';

interface LatestNewsSectionProps {
  articles: Article[];
}

export default function LatestNewsSection({ articles }: LatestNewsSectionProps) {
  return (
    <section className="flex flex-col h-full">
      <div className="flex justify-between items-center border-b-4 border-red-500 pb-2 mb-4">
        <h2 className="text-xl font-bold">최신 뉴스</h2>
        <Link href="/latest-news" className="text-sm text-neutral-400 hover:text-white">
          전체보기
        </Link>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {articles.map((news) => {
          const faviconUrl = news.favicon_url 
            || (news.source_domain && FAVICON_URLS[news.source_domain]) 
            || FAVICON_URLS[news.source] 
            || "/favicon.ico";

          return (
            <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors">
              <StyledArticleTitle title={news.title} className="font-semibold truncate" />
              <div className="flex items-center text-xs text-neutral-400 mt-1">
                <Image
                  src={faviconUrl}
                  alt={`${news.source} favicon`}
                  width={16}
                  height={16}
                  className="mr-2"
                />
                <span>{news.source}</span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
