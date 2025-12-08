"use client";

import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import ArticleSidePanel from "@/app/components/debate/ArticleSidePanel";
import TopicCommentSection from "@/app/components/debate/comments/TopicCommentSection";
import TopicVoteUI from "@/app/components/debate/TopicVoteUI";
import { useAuth } from "@/app/context/AuthContext";
import { getTopicDetail } from "@/lib/api/topics";
import { TopicDetail } from "@/lib/types/topic";
import { format } from "date-fns";
import { Calendar, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function TopicDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { token } = useAuth();

  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [userVoteStance, setUserVoteStance] = useState<"LEFT" | "RIGHT" | null>(null);
  const [voteCounts, setVoteCounts] = useState<{ left: number; right: number }>({ left: 0, right: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopicData = useCallback(async () => {
    if (!id || isNaN(parseInt(id, 10))) {
      setIsLoading(false);
      setError("유효하지 않은 토픽 ID입니다.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await getTopicDetail(id, token || undefined);
      setTopicDetail(data);
      setUserVoteStance(data.topic.my_vote || null);
      setVoteCounts({
        left: data.topic.vote_count_left || 0,
        right: data.topic.vote_count_right || 0,
      });
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

  const handleVoteSuccess = useCallback(
    (newVoteCounts: { left: number; right: number }, newUserStance: "LEFT" | "RIGHT") => {
      setVoteCounts(newVoteCounts);
      setUserVoteStance(newUserStance);
      setTopicDetail((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          topic: {
            ...prev.topic,
            vote_count_left: newVoteCounts.left,
            vote_count_right: newVoteCounts.right,
            my_vote: newUserStance,
          },
        };
      });
    },
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-10">{error}</div>;
  }

  if (!topicDetail) {
    return <div className="text-center p-10">토픽 정보를 찾을 수 없습니다.</div>;
  }

  const { topic, articles } = topicDetail;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Main Content: Topic Header + Comments */}
        <main className="lg:col-span-2">
          <header className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              {topic.display_name}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">{topic.summary}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-base text-gray-400 pb-4 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <span>조회수 {topic.view_count.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-purple-400" />
                <span>게시일: {format(new Date(topic.published_at), "yyyy년 MM월 dd일")}</span>
              </div>
            </div>
          </header>

          {topic && (
            <TopicVoteUI
              topicId={parseInt(id as string, 10)}
              initialVoteCounts={voteCounts}
              userStance={userVoteStance}
              onVoteSuccess={handleVoteSuccess}
            />
          )}

          <TopicCommentSection topicId={id as string} />
        </main>

        {/* Side Panel: Articles with Tabs */}
        <ArticleSidePanel articles={articles} />
      </div>
    </div>
  );
}
