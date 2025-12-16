"use client";

import { Topic } from "@/lib/types/topic";
import { cn } from "@/lib/utils";
import { Clock, Eye, MessageCircle, Users } from "lucide-react";
import Link from "next/link";

interface ArenaMatchCardProps {
  topic: Topic;
  status: "ongoing" | "past";
}

export default function ArenaMatchCard({ topic }: ArenaMatchCardProps) {
  const proVotes = topic.vote_count_left || topic.left_count || 0;
  const conVotes = topic.vote_count_right || topic.right_count || 0;
  const totalVotes = topic.total_votes || proVotes + conVotes;
  const commentCount = topic.comment_count || 0;
  const viewCount = topic.view_count || 0;

  // D-Day Logic
  const formatEndDate = (dateString?: string) => {
    if (!dateString) return null;
    const endDate = new Date(dateString);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "종료됨";
    if (diffDays === 0) return "D-Today";
    if (diffDays === 1) return "D-1";
    return `D-${diffDays}`;
  };

  const endDateText = formatEndDate(topic.vote_end_at);
  const isExpired = endDateText === "종료됨";

  // Gradients from TrendingTopicCard - preserving the same visual identity
  const gradients = [
    "from-blue-600 via-blue-500 to-cyan-400",
    "from-purple-600 via-purple-500 to-pink-500",
    "from-orange-500 via-red-500 to-pink-600",
    "from-emerald-500 via-teal-500 to-cyan-500",
    "from-indigo-600 via-blue-600 to-purple-600",
  ];
  // Select gradient based on topic ID for consistency
  const gradient = gradients[topic.id % gradients.length];

  return (
    <Link
      href={`/debate/${topic.id}`}
      className={cn(
        "group flex flex-col h-full rounded-2xl transition-all duration-300 relative overflow-hidden",
        "shadow-lg hover:shadow-2xl hover:-translate-y-1"
      )}
    >
      {/* Background Gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br transition-all duration-700",
          gradient,
          "opacity-95 group-hover:opacity-100"
        )}
      />

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40 pointer-events-none" />

      <div className="p-6 flex flex-col h-full relative z-10 text-white">
        {/* Header: Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
              {topic.category || "General"}
            </span>
            {endDateText && (
              <span
                className={cn(
                  "px-2.5 py-1 text-[11px] font-bold rounded-full flex items-center gap-1 backdrop-blur-sm border",
                  isExpired
                    ? "bg-slate-800/50 border-slate-700 text-slate-300"
                    : "bg-red-500/80 border-red-400/50 text-white shadow-sm"
                )}
              >
                <Clock className="w-3 h-3" />
                {endDateText}
              </span>
            )}
          </div>

          {/* Live Indicator */}
          {!isExpired && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              <span className="text-[10px] font-bold text-white tracking-wide">LIVE</span>
            </div>
          )}
        </div>

        {/* Title & Summary */}
        <div className="mb-6 flex-1 text-shadow-sm">
          <h3 className="text-xl font-black leading-snug mb-3 text-white drop-shadow-md line-clamp-2">
            {topic.display_name}
          </h3>
          <p className="text-sm text-white/90 font-medium leading-relaxed line-clamp-3 drop-shadow-sm">
            {topic.summary || "매치 상세 내용을 확인하고 투표에 참여하세요."}
          </p>
        </div>

        {/* Footer: Simple Stats */}
        <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs font-medium text-white/90">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Eye className="w-4 h-4 text-white/70" />
              <span className="translate-y-[1px] font-bold">{viewCount.toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4 text-white/70" />
              <span className="translate-y-[1px] font-bold">{commentCount.toLocaleString()}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-white font-bold bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors">
            <Users className="w-3.5 h-3.5" />
            <span className="translate-y-[1px]">{totalVotes.toLocaleString()} 투표</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
