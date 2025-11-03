
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Article } from '@/types';
import { getLikedArticles } from '@/lib/api';
import { useRouter } from "next/navigation"; // 👈 useRouter 임포트

export const useLikedArticles = () => {
  const { token, logout } = useAuth(); // 👈 logout 함수 가져오기
  const router = useRouter(); // 👈 router 선언하기
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
        console.error("Failed to fetch liked articles:", err);
        // 401 에러(토큰 만료) 감지 및 처리
        if (String(err.message).includes("401") || String(err.message).includes("Unauthorized")) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          logout(); // AuthContext의 logout 함수를 호출해 토큰/유저 정보 삭제
          router.push("/login"); // 로그인 페이지로 강제 이동
        } else {
          // 그 외 다른 에러
          setError(err.message || "좋아요한 기사를 불러오는데 실패했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiked();
  }, [token, logout, router]); // Add logout and router to dependency array

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
