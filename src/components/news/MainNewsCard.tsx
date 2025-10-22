// src/components/news/MainNewsCard.tsx
import StyledArticleTitle from "@/components/common/StyledArticleTitle";
import Image from 'next/image';
import { Article } from '@/types/article';
import { FAVICON_URLS } from "@/lib/constants";

const MainNewsCard = ({ article }: { article: Article }) => {
  const faviconUrl = article.favicon_url 
    || (article.source_domain && FAVICON_URLS[article.source_domain]) 
    || FAVICON_URLS[article.source] 
    || "/favicon.ico";

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col"
    >
      <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
        <Image
          src={article.thumbnail_url || '/placeholder-image.svg'}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
      </div>
      <StyledArticleTitle title={article.title} className="text-lg font-bold text-neutral-100 mb-2 group-hover:text-white" />
      <div className="flex items-center text-sm text-neutral-400">
        <Image
          src={faviconUrl}
          alt={`${article.source} favicon`}
          width={16}
          height={16}
          className="mr-2"
        />
        <span>{article.source}</span>
      </div>
    </a>
  );
};

export default MainNewsCard;
