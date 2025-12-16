"use client";

import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import ArticleSidePanel from "@/app/components/debate/ArticleSidePanel";
import TopicCommentSection from "@/app/components/debate/comments/TopicCommentSection";
import TopicVoteUI from "@/app/components/debate/TopicVoteUI";
import { useAuth } from "@/app/context/AuthContext";
import { getTopicDetail, incrementTopicView } from "@/lib/api/topics";
import { TopicDetail } from "@/lib/types/topic";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { BarChart2, Calendar, Clock, Trophy, Users } from "lucide-react";
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

      // Increment view count
      incrementTopicView(id);
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
      // Optimistically update topic detail as well if needed
      setTopicDetail((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          topic: {
            ...prev.topic,
            my_vote: newUserStance,
            vote_count_left: newVoteCounts.left,
            vote_count_right: newVoteCounts.right,
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

  // Aesthetic Gradients (consistent with ArenaMatchCard)
  const gradients = [
    { bg: "from-blue-600 via-blue-500 to-cyan-400", border: "border-blue-500/30" },
    { bg: "from-purple-600 via-purple-500 to-pink-500", border: "border-purple-500/30" },
    { bg: "from-orange-500 via-red-500 to-pink-600", border: "border-orange-500/30" },
    { bg: "from-emerald-500 via-teal-500 to-cyan-500", border: "border-emerald-500/30" },
    { bg: "from-indigo-600 via-blue-600 to-purple-600", border: "border-indigo-500/30" },
  ];
  const gradient = gradients[topic.id % gradients.length];

  // Logic for D-Day / Status
  let statusText = "진행중";
  let statusColor = "bg-green-500";

  const isClosed =
    topic.collection_status === "CLOSED" || (topic.vote_end_at && new Date(topic.vote_end_at).getTime() < Date.now());

  if (isClosed) {
    statusText = "종료됨";
    statusColor = "bg-slate-500";
  } else if (topic.collection_status === "SCHEDULED") {
    statusText = "예정됨";
    statusColor = "bg-yellow-500";
  }

  // Calculate D-Day for Badge
  const getDDay = (endString?: string) => {
    if (!endString) return null;
    const end = new Date(endString);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "오늘 마감";
    return `D-${days}`;
  };
  const dDayBadge = getDDay(topic.vote_end_at);

  return (
    <div className="min-h-screen pb-20 bg-background text-foreground transition-colors">
      {/* 1. Hero Header */}
      <div
        className={cn("relative w-full overflow-hidden text-white shadow-2xl pb-24", "bg-gradient-to-br", gradient.bg)}
      >
        {/* Background Noise & Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 mix-blend-soft-light" />
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up">
            <div
              className={cn(
                "px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 border border-white/20 backdrop-blur-md",
                statusColor
              )}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {statusText}
            </div>
            {dDayBadge && (
              <div className="bg-red-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black border border-white/30 shadow-md">
                {dDayBadge}
              </div>
            )}
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
              ID: {topic.id}
            </div>
          </div>

          {/* Title & Summary */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 drop-shadow-2xl animate-fade-in-up delay-100">
            {topic.display_name}
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-3xl drop-shadow-md animate-fade-in-up delay-200">
            {topic.summary || "상세 내용이 없습니다."}
          </p>

          {/* Metadata Grid */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl animate-fade-in-up delay-300">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-colors">
              <div className="flex items-center gap-2 text-white/60 text-xs font-bold mb-1 uppercase tracking-wider">
                <Users size={14} /> 조회수
              </div>
              <div className="text-xl font-black">{topic.view_count.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-colors">
              <div className="flex items-center gap-2 text-white/60 text-xs font-bold mb-1 uppercase tracking-wider">
                <Calendar size={14} /> 게시일
              </div>
              <div className="text-lg font-bold">{format(new Date(topic.published_at), "yy.MM.dd")}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-colors">
              <div className="flex items-center gap-2 text-white/60 text-xs font-bold mb-1 uppercase tracking-wider">
                <Clock size={14} /> 투표 시작
              </div>
              <div className="text-lg font-bold">
                {topic.vote_start_at ? format(new Date(topic.vote_start_at), "MM.dd HH:mm") : "-"}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-colors">
              <div className="flex items-center gap-2 text-white/60 text-xs font-bold mb-1 uppercase tracking-wider">
                <Trophy size={14} /> 현재 1위
              </div>
              <div className="text-lg font-bold">
                {voteCounts.left > voteCounts.right
                  ? topic.stance_left || "찬성"
                  : voteCounts.right > voteCounts.left
                  ? topic.stance_right || "반대"
                  : "동률"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content Column */}
          <main className="lg:col-span-2">
            {/* Vote Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <BarChart2 className="text-blue-500 w-6 h-6" />
                투표 현황
              </h3>
              {topic && (
                <TopicVoteUI
                  topicId={parseInt(id as string, 10)}
                  initialVoteCounts={voteCounts}
                  userStance={userVoteStance}
                  onVoteSuccess={handleVoteSuccess}
                  stanceLeft={topic.stance_left || "찬성"}
                  stanceRight={topic.stance_right || "반대"}
                  voteEndAt={topic.vote_end_at} // Passing the end date for countdown
                />
              )}
            </div>

            <TopicCommentSection
              topicId={id as string}
              userVoteStance={userVoteStance}
              stanceLeft={topic.stance_left || "찬성"}
              stanceRight={topic.stance_right || "반대"}
            />
          </main>

          {/* Side Panel: Articles with Tabs */}
          <ArticleSidePanel articles={articles} />
        </div>
      </div>
    </div>
  );
}
