"use client";

import { Topic } from "@/lib/types/topic";
import { cn } from "@/lib/utils";
import { ArrowRight, Clock, Users } from "lucide-react";
import Link from "next/link";

interface DebateCardProps {
  topic: Topic;
  status: "ongoing" | "past";
  isFeatured?: boolean;
}

export default function DebateCard({ topic, status, isFeatured = false }: DebateCardProps) {
  const proVotes = topic.pro_votes || 0;
  const conVotes = topic.con_votes || 0;
  const totalVotes = proVotes + conVotes;

  // Deterministic gradient based on ID
  const gradients = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-500",
    "from-orange-400 to-red-500",
    "from-emerald-400 to-teal-600",
    "from-indigo-500 to-blue-600",
  ];
  const gradientClass = gradients[topic.id % gradients.length];

  // Calculate remaining time text
  const getRemainingTime = (dateString: string) => {
    const endDate = new Date(dateString);
    endDate.setDate(endDate.getDate() + 7);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays}일 남음` : "마감됨";
  };

  const remainingTime = getRemainingTime(topic.published_at);

  return (
    <Link
      href={`/debate/${topic.id}`}
      className={cn(
        "group block relative w-full rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
        isFeatured ? "min-h-[400px] md:min-h-[450px]" : "min-h-[320px]"
      )}
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
          {status === "past" && (
            <div className="bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 text-white/80">
              종료됨
            </div>
          )}
        </div>

        {/* Main Title & Question */}
        <div className="mt-8 mb-auto">
          <h3
            className={cn(
              "font-extrabold leading-tight drop-shadow-sm mb-3 line-clamp-3",
              isFeatured ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
            )}
          >
            {topic.display_name}
          </h3>
          <p className="text-white/90 text-sm md:text-base font-medium line-clamp-2 opacity-90">
            {topic.summary || "당신의 생각은?"}
          </p>
        </div>

        {/* Bottom Info & Action */}
        <div className="flex items-end justify-between mt-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white/80 bg-black/10 px-2 py-1 rounded-md w-fit">
              <Clock size={12} />
              <span>{remainingTime}</span>
            </div>
          </div>

          <div className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg group-hover:bg-gray-50 transition-colors">
            {status === "ongoing" ? "참여하기" : "결과보기"}
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Decorative overlay for texture/depth */}
      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
    </Link>
  );
}
