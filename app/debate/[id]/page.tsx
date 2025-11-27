"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getTopicDetail } from "@/lib/api";
import { Topic, Article, TopicDetail } from "@/types";
import { useAuth } from "@/app/context/AuthContext";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import TopicCommentSection from "@/app/components/debate/comments/TopicCommentSection";
import ArticleSidePanel from "@/app/components/debate/ArticleSidePanel";
import { Users, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function TopicDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token } = useAuth();

  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopicData = useCallback(async () => {
    if (!id || isNaN(parseInt(id, 10))) {
        setIsLoading(false);
        setError("유효하지 않은 토픽 ID입니다.");
        return;
    };
    setIsLoading(true);
     try {
        const data = await getTopicDetail(id, token || undefined);
        setTopicDetail(data);
    } catch (err) {
        setError("토픽 정보를 불러오는 데 실패했습니다.");
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [id, token]);


  useEffect(() => {
    fetchTopicData();
  }, [fetchTopicData]);


  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><LoadingSpinner size="large" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  if (!topicDetail) {
    return <div className="text-center p-10">토픽 정보를 찾을 수 없습니다.</div>;
  }

  const { topic, articles } = topicDetail;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Main Content: Topic Header + Comments */}
            <main className="lg:col-span-2">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-4">{topic.display_name}</h1>
                    <p className="text-base text-muted-foreground">{topic.summary}</p>
                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground border-t border-b border-border py-3">
                        <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>조회수 {topic.view_count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>게시일: {format(new Date(topic.published_at), 'yyyy년 MM월 dd일')}</span>
                        </div>
                    </div>
                </header>
                
                <TopicCommentSection topicId={id as string} />

            </main>

            {/* Side Panel: Articles with Tabs */}
            <ArticleSidePanel articles={articles} />

       </div>
    </div>
  );
}
