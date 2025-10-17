'use client';

import { useState } from 'react';
import { Article } from '@/types/article';
import MainNewsCard from '@/components/news/MainNewsCard';
import Link from 'next/link';

interface CategoryNewsSectionProps {
  title: string;
  articles: Article[];
  linkUrl: string;
}

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const CategoryNewsSection = ({ title, articles, linkUrl }: CategoryNewsSectionProps) => {
  const [startIndex, setStartIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const articlesToShow = 5;

  const handleNext = () => {
    if (startIndex < articles.length - articlesToShow) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center border-b-4 border-red-500 pb-2 mb-6">
        <h2 className="text-2xl font-bold">
          {title}
        </h2>
        <Link href={linkUrl} className="text-sm text-neutral-400 hover:text-white">
          전체보기
        </Link>
      </div>
      <div 
        className="relative" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {articles.slice(startIndex, startIndex + articlesToShow).map(article => (
            <MainNewsCard key={article.id} article={article} />
          ))}
        </div>
        {isHovered && (
          <>
            {startIndex > 0 && (
              <button 
                onClick={handlePrev} 
                className="absolute top-1/2 -left-5 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 z-10"
                aria-label="Previous articles"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
            )}
            {startIndex < articles.length - articlesToShow && (
              <button 
                onClick={handleNext} 
                className="absolute top-1/2 -right-5 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 z-10"
                aria-label="Next articles"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CategoryNewsSection;
