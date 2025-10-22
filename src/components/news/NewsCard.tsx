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
      className="group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-neutral-700 hover:shadow-lg hover:scale-[1.02] flex mb-4 p-3 cursor-pointer"
    >
      <div className="relative h-24 w-32 flex-shrink-0 mr-5">
        <Image
          src={article.thumbnail_url || '/placeholder-image.svg'}
          alt={article.title}
          fill
          className="rounded-lg object-cover"
          unoptimized
        />
      </div>
      <div className="flex flex-col justify-between flex-grow">
        <div>
          <StyledArticleTitle title={article.title} className="text-lg font-bold text-neutral-100 transition-colors duration-300 group-hover:text-white" />
          <p className="text-sm text-neutral-400 mt-2 overflow-hidden h-10">
            {article.description || ''}
          </p>
        </div>
        <div className="text-xs text-neutral-500 mt-2 flex items-center">
          <Image
            src={faviconUrl}
            alt={`${article.source} favicon`}
            width={16}
            height={16}
            className="mr-2"
          />
          <span>{article.source}</span>
          {article.source_domain && <span className="text-neutral-600 ml-2">({article.source_domain})</span>}
          <span className="mx-2">·</span>
          <span>{new Date(article.published_at).toLocaleString()}</span>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;