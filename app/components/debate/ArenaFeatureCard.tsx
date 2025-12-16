"use client";

import { Topic } from "@/lib/types/topic";
import { Eye, MessageCircle, Swords, Timer, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ArenaFeatureCardProps {
  topic: Topic;
  status: "ongoing" | "past";
}

export default function ArenaFeatureCard({ topic }: ArenaFeatureCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const proVotes = topic.vote_count_left || topic.left_count || 0;
  const conVotes = topic.vote_count_right || topic.right_count || 0;
  const totalVotes = topic.total_votes || proVotes + conVotes;
  const commentCount = topic.comment_count || 0;
  const viewCount = topic.view_count || 0;

  const proPercent = totalVotes === 0 ? 50 : Math.max(15, Math.round((proVotes / totalVotes) * 100));
  const conPercent = totalVotes === 0 ? 50 : Math.max(15, Math.round((conVotes / totalVotes) * 100));

  const totalPercent = proPercent + conPercent;
  const proWidth = (proPercent / totalPercent) * 100;
  const conWidth = (conPercent / totalPercent) * 100;

  // D-Day Logic
  const formatEndDate = (dateString?: string) => {
    if (!dateString) return null;
    const endDate = new Date(dateString);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "종료됨";
    if (diffDays === 0) return "오늘 마감";
    if (diffDays === 1) return "내일 마감";
    return `D-${diffDays}`;
  };

  const endDateText = formatEndDate(topic.vote_end_at);

  return (
    <Link
      href={`/debate/${topic.id}`}
      className="group relative block w-full overflow-hidden rounded-[2.5rem] border-4 border-slate-800 bg-slate-900 shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:border-slate-600 hover:shadow-slate-900/40"
    >
      {/* Background with Split Effect */}
      <div className="absolute inset-0 flex">
        {/* Left Side (Blue Corner) */}
        <div className="relative h-full w-1/2 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
        </div>

        {/* Right Side (Red Corner) */}
        <div className="relative h-full w-1/2 overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-red-900/20 mix-blend-multiply" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-red-600/10 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
        </div>
      </div>

      {/* Metal Mesh texture overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />

      {/* Content Layer */}
      <div className="relative z-10 flex min-h-[420px] flex-col items-center justify-between p-8 md:p-12">
        {/* Top Header: Badge & Timer */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 backdrop-blur-md shadow-lg">
            <Trophy className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-black tracking-widest text-yellow-500 uppercase">메인 매치</span>
          </div>
          <div className="flex items-center gap-3">
            {endDateText && (
              <div className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-black text-red-500 shadow-lg">
                <Timer className="h-3.5 w-3.5" />
                {endDateText}
              </div>
            )}
          </div>
        </div>

        {/* Center: The Matchup */}
        <div className="flex w-full flex-col items-center gap-8 py-6 md:flex-row md:justify-between md:gap-4">
          {/* Blue Side Text */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-4xl font-black italic tracking-tighter text-blue-500 md:text-5xl lg:text-6xl drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              BLUE
            </h3>
            <div className="mt-2 h-1.5 w-24 bg-blue-600 md:mr-auto shadow-[0_0_10px_rgba(37,99,235,0.8)] rounded-full" />
          </div>

          {/* VS Badge */}
          <div className="relative shrink-0 z-20">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-slate-800 bg-slate-900 shadow-2xl">
              <span className="text-4xl font-black italic text-white/90 drop-shadow-md">VS</span>
            </div>
          </div>

          {/* Red Side Text */}
          <div className="flex-1 text-center md:text-right">
            <h3 className="text-4xl font-black italic tracking-tighter text-red-500 md:text-5xl lg:text-6xl drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              RED
            </h3>
            <div className="mt-2 h-1.5 w-24 bg-red-600 md:ml-auto shadow-[0_0_10px_rgba(220,38,38,0.8)] rounded-full" />
          </div>
        </div>

        {/* Topic Title */}
        <div className="mx-auto max-w-4xl text-center mb-4">
          <h2 className="text-3xl font-black leading-tight text-white md:text-5xl lg:text-5xl drop-shadow-2xl break-keep tracking-tight">
            {topic.display_name}
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-300 break-keep">{topic.summary}</p>
        </div>

        {/* Info Stats Bar */}
        <div className="flex items-center gap-6 mb-8 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Eye className="w-5 h-5" />
            <span className="text-sm font-bold">{viewCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{commentCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-5 h-5" />
            <span className="text-sm font-bold">{totalVotes.toLocaleString()} 투표</span>
          </div>
        </div>

        {/* Tale of the Tape (Visual Voting Bar) */}
        <div className="w-full max-w-3xl">
          <div className="mb-3 flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
            <span className="text-blue-400">청코너 승률</span>
            <span className="text-red-400">홍코너 승률</span>
          </div>

          <div className="relative h-8 w-full overflow-hidden rounded-md bg-slate-800 border border-slate-700 shadow-inner">
            <div
              className="absolute left-0 top-0 h-full bg-linear-to-r from-blue-700 to-blue-500 transition-all duration-1000 ease-out"
              style={{ width: mounted ? `${proWidth}%` : "50%" }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-linear-to-l from-red-700 to-red-500 transition-all duration-1000 ease-out"
              style={{ width: mounted ? `${conWidth}%` : "50%" }}
            />
            {/* Gloss Effect */}
            <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Center Line */}
            <div className="absolute left-1/2 top-0 -ml-px h-full w-[2px] bg-black/50 z-10" />

            {/* Percentages inside bar */}
            <div className="absolute inset-0 flex items-center justify-between px-4 text-sm font-black text-white drop-shadow-md z-20">
              <span>{Math.round(proWidth)}%</span>
              <span>{Math.round(conWidth)}%</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12">
          <span className="group/btn inline-flex items-center gap-3 rounded-sm border-2 border-white/20 bg-white/5 px-10 py-4 text-lg font-black text-white transition-all hover:bg-white hover:text-black hover:border-white hover:scale-105 active:scale-95 backdrop-blur-sm">
            ARENA 입장하기
            <Swords className="h-5 w-5 transition-transform group-hover/btn:rotate-90 group-hover/btn:scale-110" />
          </span>
        </div>
      </div>
    </Link>
  );
}
