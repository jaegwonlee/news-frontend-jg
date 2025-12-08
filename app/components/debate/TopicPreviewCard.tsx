"use client";

import { ArrowRight, Clock, Users } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

// Define the type based on the user's provided structure
interface TopicPreview {
  id: number;
  display_name: string;
  status: string;
  left_count: number;
  right_count: number;
  vote_remaining_time: string | null;
  vote_end_at?: string;
  summary?: string; // Added summary for better context if available
}

interface TopicPreviewCardProps {
  topic?: TopicPreview | null;
  isNotFound?: boolean;
  failedTopicId?: string;
}

export default function TopicPreviewCard({ topic, isNotFound, failedTopicId }: TopicPreviewCardProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  if (isNotFound || !topic) {
    return (
      <div className={`block mt-2 max-w-full`}>
        <div
          className={`w-full rounded-2xl ${
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-100 border-gray-200"
          } border p-8 flex flex-col items-center justify-center text-center opacity-70 min-h-[300px]`}
        >
          <h4 className="font-bold text-xl text-foreground mb-2">토론을 찾을 수 없습니다</h4>
          <p className="text-sm text-muted-foreground">
            요청하신 토론 ID ({failedTopicId || "알 수 없음"}) 에 해당하는 토론이 존재하지 않습니다.
          </p>
        </div>
      </div>
    );
  }

  const totalVotes = topic.left_count + topic.right_count;

  // Deterministic gradient based on ID
  const gradients = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-500",
    "from-orange-400 to-red-500",
    "from-emerald-400 to-teal-600",
    "from-indigo-500 to-blue-600",
  ];
  const gradientClass = gradients[topic.id % gradients.length];

  return (
    <Link
      href={`/debate/${topic.id}`}
      className="group block relative w-full h-full min-h-[320px] rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", `${window.location.origin}/debate/${topic.id}`);
        e.dataTransfer.setData("application/json", JSON.stringify({ type: "topic", data: topic }));
      }}
    >
      {/* Background with Gradient */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradientClass} opacity-90 transition-opacity group-hover:opacity-100`}
      />

      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-between p-6 text-white z-10">
        {/* Top Badge */}
        <div className="flex justify-between items-start">
          <div className="bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold border border-white/10">
            <Users size={12} className="text-white/90" />
            <span>{totalVotes.toLocaleString()}명 투표 중</span>
          </div>
        </div>

        {/* Main Title & Question */}
        <div className="mt-8 mb-auto">
          <h3 className="text-2xl md:text-3xl font-extrabold leading-tight drop-shadow-sm mb-3 line-clamp-3">
            {topic.display_name}
          </h3>
          <p className="text-white/90 text-sm md:text-base font-medium line-clamp-2 opacity-90">당신의 생각은?</p>
        </div>

        {/* Bottom Info & Action */}
        <div className="flex items-end justify-between mt-6">
          <div className="flex flex-col gap-1">
            {topic.vote_end_at && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-white/80 bg-black/10 px-2 py-1 rounded-md w-fit">
                <Clock size={12} />
                <span>{topic.vote_end_at} 마감</span>
              </div>
            )}
          </div>

          <div className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg group-hover:bg-gray-50 transition-colors">
            참여하기
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Decorative overlay for texture/depth */}
      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
    </Link>
  );
}
