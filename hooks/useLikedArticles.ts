
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Article } from '@/types';
import { getLikedArticles } from '@/lib/api';
import { useRouter } from "next/navigation"; // 👈 useRouter 임포트

export const useLikedArticles = () => {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setArticles([]);
      setTotalCount(0);
      setIsLoading(false);
      return;
    }

    const fetchLiked = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { articles: fetchedArticles, totalCount: fetchedTotalCount } = await getLikedArticles(token);
        setArticles(fetchedArticles);
        setTotalCount(fetchedTotalCount);
      } catch (err: unknown) {
        console.error("Failed to fetch liked articles:", err);
        let errorMessage = "좋아요한 기사를 불러오는데 실패했습니다.";
        if (err instanceof Error) {
          errorMessage = err.message;
        }

        if (String(errorMessage).includes("401") || String(errorMessage).includes("Unauthorized")) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          logout();
          router.push("/login");
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLiked();

    // Add event listener for window focus to refetch data
    window.addEventListener('focus', fetchLiked);

    // Cleanup the event listener
    return () => {
      window.removeEventListener('focus', fetchLiked);
    };
  }, [token, logout, router]);

  const handleUnlike = useCallback((articleId: number) => {
    setArticles((prevArticles) =>
      prevArticles.filter((article) => article.id !== articleId)
    );
    setTotalCount(prevCount => prevCount - 1); // Optimistically decrement count
  }, []);

  return {
    articles,
    totalCount,
    isLoading,
    error,
    handleUnlike,
  };
};
