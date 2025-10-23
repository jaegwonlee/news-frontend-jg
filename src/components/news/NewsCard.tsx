// src/components/NewsCard.tsx

import Image from "next/image";
import { Article } from "@/types/article";
import { FAVICON_URLS } from "@/lib/constants";
import StyledArticleTitle from "@/components/common/StyledArticleTitle";

const NewsCard = ({ article }: { article: Article }) => {
  const faviconUrl = article.favicon_url 
    || (article.source_domain && FAVICON_URLS[article.source_domain]) 
    || FAVICON_URLS[article.source] 
    || "/favicon.ico";

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white border border-neutral-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-neutral-300 hover:shadow-sm hover:scale-[1.02] flex mb-2 p-2 cursor-pointer dark:bg-neutral-900 dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:shadow-lg"
    >
      <div className="relative h-16 w-24 flex-shrink-0 mr-3">
        <Image
          src={article.thumbnail_url || '/placeholder-image.svg'}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
      </div>
      <div className="flex flex-col justify-between flex-grow">
        <div>
          <StyledArticleTitle title={article.title} className="text-base font-semibold text-neutral-900 transition-colors duration-300 group-hover:text-neutral-700 dark:text-neutral-100 dark:group-hover:text-white" />
        </div>
        <div className="text-xs text-neutral-600 mt-1 flex items-center dark:text-neutral-500">
          <Image
            src={faviconUrl}
            alt={`${article.source} favicon`}
            width={12}
            height={12}
            className="mr-1"
          />
          <span>{article.source}</span>
          {article.source_domain && <span className="text-neutral-500 ml-1 dark:text-neutral-600">({article.source_domain})</span>}
          <span className="mx-1">·</span>
          <span>{new Date(article.published_at).toLocaleString()}</span>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;