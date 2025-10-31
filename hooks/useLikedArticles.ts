
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Article } from '@/types';
import { getLikedArticles } from '@/lib/api';

export const useLikedArticles = () => {
  const { token } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setArticles([]);
      setIsLoading(false);
      return;
    }

    const fetchLiked = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedArticles = await getLikedArticles(token);
        setArticles(fetchedArticles);
      } catch (err: any) {
        setError(err.message || "좋아요한 기사를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiked();
  }, [token]);

  const handleUnlike = useCallback((articleId: number) => {
    setArticles((prevArticles) =>
      prevArticles.filter((article) => article.id !== articleId)
    );
  }, []);

  return {
    articles,
    isLoading,
    error,
    handleUnlike,
  };
};
