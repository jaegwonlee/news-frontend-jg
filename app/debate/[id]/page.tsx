'use client';

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ArticleCard from "@/app/components/ArticleCard";
import ChatRoom from "@/app/components/ChatRoom";
import TopicViewCounter from "@/app/components/TopicViewCounter";
import { getTopicDetail, toggleArticleLike, toggleArticleSave } from "@/lib/api";
import { TopicDetail, Article } from "@/types";
import { useAuth } from "@/app/context/AuthContext";
import ContentSection from "@/app/components/common/ContentSection";
import { MessageCircle } from "lucide-react";

export default function TopicDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token } = useAuth();

  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && !isNaN(parseInt(id, 10))) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
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
  }, [id, token]);

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

  if (isLoading) {
    return <div className="text-center text-white p-10">로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  if (!topicDetail) {
    return <div className="text-center text-white p-10">토픽 정보를 찾을 수 없습니다.</div>;
  }

  const { topic, articles } = topicDetail;
  const leftArticles = articles.filter((article) => article.side === "LEFT");
  const rightArticles = articles.filter((article) => article.side === "RIGHT");

  return (
    <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-0">
      {id && <TopicViewCounter topicId={id} />}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
        <aside className="lg:col-span-3">
          <div className="space-y-6 h-[750px] overflow-y-auto pr-2 pt-4 w-full">
            {leftArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="horizontal"
                onLikeToggle={() => handleLikeToggle(article)}
                onSaveToggle={() => handleSaveToggle(article)}
                hoverColor="blue"
              />
            ))}
          </div>
        </aside>
        <main className="lg:col-span-6">
          <ContentSection 
            title="ROUND2" 
            icon={<MessageCircle />}
            className="h-[750px]"
            fillHeight={true}
            collapsibleContent={{
              title: topic.display_name,
              summary: topic.summary,
              published_at: topic.published_at
            }}
          >
            <ChatRoom topic={topic} />
          </ContentSection>
        </main>
        <aside className="lg:col-span-3">
          <div className="space-y-6 h-[750px] overflow-y-auto pr-2 pt-4 w-full">
            {rightArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="horizontal"
                onLikeToggle={() => handleLikeToggle(article)}
                onSaveToggle={() => handleSaveToggle(article)}
                hoverColor="red"
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}