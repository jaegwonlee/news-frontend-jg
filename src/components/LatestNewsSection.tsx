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
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">최신 뉴스</h2>
        <Link href="/latest-news" className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
          전체보기
        </Link>
      </div>
      <div className="grow overflow-y-auto pr-2 space-y-2 custom-scrollbar">
        {articles.map((news) => {
          const faviconUrl = news.favicon_url 
            || (news.source_domain && FAVICON_URLS[news.source_domain]) 
            || FAVICON_URLS[news.source] 
            || "/favicon.ico";

          return (
            <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors dark:bg-neutral-800 dark:hover:bg-neutral-700">
              <StyledArticleTitle title={news.title} className="font-semibold truncate text-neutral-900 dark:text-white" />
              <div className="flex items-center text-xs text-neutral-600 mt-1 dark:text-neutral-400">
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
