import Image from 'next/image';

import { Article } from '../types/article';

const NewsCard = ({ article }: { article: Article }) => (
  <div className="bg-transparent rounded-lg overflow-hidden transition-shadow duration-300 flex mb-3 p-2 hover:bg-[#3a3a3a]">
    <div className="relative h-20 w-28 flex-shrink-0 mr-4">
      <Image
        src={article.imageUrl}
        alt={article.title}
        fill
        className="rounded-md object-cover"
        unoptimized
      />
    </div>
    <div className="flex flex-col justify-between flex-grow">
      <div>
        <h3 className="text-base font-semibold text-neutral-200 hover:text-white transition-colors duration-200 cursor-pointer">{article.title}</h3>
        <p className="text-sm text-neutral-400 mt-1 overflow-hidden h-5">{article.description}</p>
      </div>
      <div className="text-xs text-neutral-500 mt-2 flex items-center">
        <span>{article.source}</span>
        <span className="mx-2">|</span>
        <span>{article.date}</span>
      </div>
    </div>
  </div>
);

export default NewsCard;
