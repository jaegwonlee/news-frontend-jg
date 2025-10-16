// src/components/NewsCard.tsx

import Image from "next/image";
import { Article } from "@/types/article";

const NewsCard = ({ article }: { article: Article }) => (
  <a
    href={article.link}
    target="_blank"
    rel="noopener noreferrer"
    className="group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-neutral-700 hover:shadow-lg hover:scale-[1.02] flex mb-4 p-3 cursor-pointer"
  >
    <div className="relative h-24 w-32 flex-shrink-0 mr-5">
      <Image
        src={article.imageUrl}
        alt={article.title}
        fill
        className="rounded-lg object-cover"
        unoptimized
      />
    </div>
    <div className="flex flex-col justify-between flex-grow">
      <div>
        <h3 className="text-lg font-bold text-neutral-100 transition-colors duration-300 group-hover:text-white">
          {article.title}
        </h3>
        <p className="text-sm text-neutral-400 mt-2 overflow-hidden h-10">
          {article.description}
        </p>
      </div>
      <div className="text-xs text-neutral-500 mt-2 flex items-center">
        <span>{article.source}</span>
        <span className="mx-2">·</span>
        <span>{article.date}</span>
      </div>
    </div>
  </a>
);

export default NewsCard;