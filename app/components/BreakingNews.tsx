'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getBreakingNews, toggleArticleSave } from '@/lib/api/articles';
import { Article } from '@/lib/types/article';
import ArticleCard from './ArticleCard';
import LoadingSpinner from './common/LoadingSpinner';
import { AlertTriangle } from 'lucide-react';
import HorizontalNewsScroller from './common/HorizontalNewsScroller';

const BreakingNews = () => {
  const { token } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBreakingNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Pass token only if user is logged in
      const fetchedArticles = await getBreakingNews(token || undefined);
      setArticles(fetchedArticles);
    } catch (err) {
      setError('속보를 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBreakingNews();
  }, [fetchBreakingNews]);

  const handleSaveToggle = async (articleToToggle: Article) => {
    if (!token) {
      // Optionally, prompt user to log in
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    const originalArticles = articles;
    const newArticles = articles.map((a) =>
      a.id === articleToToggle.id ? { ...a, isSaved: !a.isSaved } : a
    );
    setArticles(newArticles);

    try {
      await toggleArticleSave(token, articleToToggle.id, !!articleToToggle.isSaved);
    } catch (err) {
      // Revert on error
      setArticles(originalArticles);
      alert('기사 저장 상태 변경에 실패했습니다. 다시 시도해주세요.');
      console.error(err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center text-red-500 bg-red-500/10 rounded-lg">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return null; // Don't render anything if there are no articles
  }

  return (
    <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4 px-4 md:px-0">주요 속보</h2>
        <HorizontalNewsScroller news={articles} />
    </section>
  );
};

export default BreakingNews;
