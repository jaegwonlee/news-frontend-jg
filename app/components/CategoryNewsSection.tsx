"use client";

import ArticleCard from './ArticleCard';
import { Article } from '@/types';
import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getCategoryNews } from '@/lib/api'; // Use the centralized API function

interface CategoryNewsSectionProps {
  categoryName: string;
}

export default function CategoryNewsSection({ categoryName }: CategoryNewsSectionProps) {
  const { token } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadArticles = async () => {
      const fetchedArticles = await getCategoryNews(categoryName, 5, token || undefined);
      setArticles(fetchedArticles);
    };
    loadArticles();
  }, [categoryName, token]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
      {articles.length === 0 && (
        <p className="text-zinc-500 sm:col-span-2 md:col-span-3 lg:col-span-5 text-center py-5">
          표시할 {categoryName} 뉴스가 없습니다.
        </p>
      )}
    </div>
  );
}