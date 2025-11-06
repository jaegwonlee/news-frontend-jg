'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCategoryNews } from '@/lib/api';
import { Article } from '@/types';
import ArticleCard from '@/app/components/ArticleCard';
import ContentSection from '../components/common/ContentSection';
import { Newspaper } from 'lucide-react';
import ClientPaginationControls from '@/app/components/common/ClientPaginationControls';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ARTICLES_PER_PAGE = 20;

async function fetchAllLatestNews() {
  const categories = ["정치", "경제", "사회", "문화"];
  // Fetch 100 articles per category to ensure a large pool
  const newsPromises = categories.map(category => 
    getCategoryNews(category, 100).catch(err => {
      console.error(`Error fetching latest news for category ${category}:`, err);
      return [];
    })
  );

  const results = await Promise.all(newsPromises);
  const allArticles = results.flat();
  
  const uniqueArticlesMap = new Map<number, Article>();
  allArticles.forEach((article) => {
    uniqueArticlesMap.set(article.id, article);
  });

  const sortedArticles = Array.from(uniqueArticlesMap.values())
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  // Return the top 100 unique articles
  return sortedArticles.slice(0, 100);
}

export default function LatestNewsPage() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadNews = async () => {
      setIsLoading(true);
      const articles = await fetchAllLatestNews();
      setAllArticles(articles);
      setIsLoading(false);
    };
    loadNews();
  }, []);

  const totalPages = Math.ceil(allArticles.length / ARTICLES_PER_PAGE);

  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    return allArticles.slice(startIndex, endIndex);
  }, [allArticles, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
      <ContentSection title="최신 뉴스" icon={<Newspaper />}>
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner />
          </div>
        ) : paginatedArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            <ClientPaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <p className="text-center text-zinc-400">최신 뉴스가 없습니다.</p>
        )}
      </ContentSection>
    </div>
  );
}
