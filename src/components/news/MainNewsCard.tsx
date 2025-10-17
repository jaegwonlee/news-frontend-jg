// src/components/news/MainNewsCard.tsx
import Image from 'next/image';
import { Article } from '@/types/article';

const MainNewsCard = ({ article }: { article: Article }) => {
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
      <h3 className="text-lg font-bold text-neutral-100 mb-2 group-hover:text-white">
        {article.title}
      </h3>
      <p className="text-sm text-neutral-400">{article.source}</p>
    </a>
  );
};

export default MainNewsCard;
