"use client";

import ArticleCard from "@/app/components/ArticleCard";
import ChatRoom from "@/app/components/ChatRoom";
import ContentSection from "@/app/components/common/ContentSection";
import TopicViewCounter from "@/app/components/TopicViewCounter";
import { useAuth } from "@/app/context/AuthContext"; // 👈 1. useAuth 임포트
import { getTopicDetail, toggleArticleLike, toggleArticleSave } from "@/lib/api";
import { Article, TopicDetail } from "@/types";
import { MessageCircle } from "lucide-react";
import Image from "next/image"; // Import Image component
import { useParams } from "next/navigation"; // URL 파라미터를 읽기 위한 hook
import { useCallback, useEffect, useState } from "react";

/**
 * =====================================================================================
 * 토픽 상세 페이지 (클라이언트 컴포넌트 버전)
 * =====================================================================================
 * 서버 컴포넌트의 params 전달 버그를 우회하기 위해 클라이언트 컴포넌트로 전환합니다.
 * 페이지가 브라우저에 로드된 후, URL에서 직접 ID를 읽어와 데이터를 가져옵니다.
 */
export default function TopicDetailPage() {
  // 1. URL 파라미터 추출 (클라이언트 사이드 방식)
  // -------------------------------------------------------------------------------------
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token } = useAuth(); // 👈 2. useAuth로 토큰 가져오기

  // 2. 데이터 상태 관리
  // -------------------------------------------------------------------------------------
  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. 데이터 페칭 (Client-side Effect)
  // -------------------------------------------------------------------------------------
  useEffect(() => {
    // id가 유효한 경우에만 데이터 페칭 실행
    if (id && !isNaN(parseInt(id, 10))) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          // 👇 3. API 호출 시 token 전달
          const data = await getTopicDetail(id, token || undefined);
          setTopicDetail(data);
        } catch (err) {
          setError("토픽 정보를 불러오는 데 실패했습니다.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [id, token]); // 👈 4. useEffect 의존성 배열에 token 추가

  const handleLikeToggle = useCallback(
    async (articleToToggle: Article) => {
      if (!token) return;
      try {
        const response = await toggleArticleLike(token, articleToToggle.id, articleToToggle.isLiked || false);
        setTopicDetail((prevDetail) => {
          if (!prevDetail) return null;
          return {
            ...prevDetail,
            articles: prevDetail.articles.map((article) =>
              article.id === articleToToggle.id
                ? { ...article, isLiked: response.data.isLiked, like_count: response.data.likes }
                : article
            ),
          };
        });
      } catch (error) {
        console.error("Failed to toggle like:", error);
      }
    },
    [token]
  );

  const handleSaveToggle = useCallback(
    async (articleToToggle: Article) => {
      if (!token) return;
      const newIsSaved = !articleToToggle.isSaved;
      try {
        await toggleArticleSave(token, articleToToggle.id, articleToToggle.isSaved || false);
        setTopicDetail((prevDetail) => {
          if (!prevDetail) return null;
          return {
            ...prevDetail,
            articles: prevDetail.articles.map((article) =>
              article.id === articleToToggle.id ? { ...article, isSaved: newIsSaved } : article
            ),
          };
        });
      } catch (error) {
        console.error("Failed to toggle save:", error);
      }
    },
    [token]
  );

  // 4. 로딩 및 에러 상태 처리
  // -------------------------------------------------------------------------------------
  if (isLoading) {
    return <div className="text-center text-white p-10">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  if (!topicDetail) {
    return <div className="text-center text-white p-10">토픽 정보를 찾을 수 없습니다.</div>;
  }

  // 5. 최종 페이지 렌더링
  // -------------------------------------------------------------------------------------
  const { topic, articles } = topicDetail;
  const leftArticles = articles.filter((article) => article.side === "LEFT");
  const rightArticles = articles.filter((article) => article.side === "RIGHT");

  return (
    <div className="w-full max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* id가 유효한 string일 때만 렌더링하도록 수정 */}
      {id && <TopicViewCounter topicId={id} />}
      <section className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-3">{topic.display_name}</h1>
        <p className="text-lg text-zinc-400 max-w-4xl mx-auto">{topic.summary}</p>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3">
          <div className="flex justify-center mb-4">
            <Image src="/avatars/blue--glove.svg" alt="Blue Glove" width={100} height={100} />
          </div>
          <div className="space-y-6">
            {leftArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onLikeToggle={() => handleLikeToggle(article)}
                onSaveToggle={() => handleSaveToggle(article)}
              />
            ))}
          </div>
        </aside>
        <main className="lg:col-span-6">
          <ContentSection title="ROUND2" icon={<MessageCircle />}>
            <ChatRoom topicId={topic.id} />
          </ContentSection>
        </main>
        <aside className="lg:col-span-3">
          <div className="flex justify-center mb-4">
            <Image src="/avatars/red--glove.svg" alt="Red Glove" width={100} height={100} />
          </div>
          <div className="space-y-6">
            {rightArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onLikeToggle={() => handleLikeToggle(article)}
                onSaveToggle={() => handleSaveToggle(article)}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
