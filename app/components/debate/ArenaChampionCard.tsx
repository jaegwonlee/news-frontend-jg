"use client";

import { Topic } from "@/lib/types/topic";
import { cn } from "@/lib/utils";
import { Crown, Flame, Medal, Trophy } from "lucide-react";
import Link from "next/link";

interface ArenaChampionCardProps {
  topic: Topic;
  rank: number;
}

export default function ArenaChampionCard({ topic, rank }: ArenaChampionCardProps) {
  const proVotes = topic.vote_count_left || topic.left_count || 0;
  const conVotes = topic.vote_count_right || topic.right_count || 0;
  const totalVotes = topic.total_votes || proVotes + conVotes;

  // Premium Rank Styles
  const rankConfig = {
    1: {
      border: "border-yellow-400",
      bg: "bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/30 dark:to-yellow-900/10",
      icon: "text-yellow-500",
      text: "text-yellow-700 dark:text-yellow-400",
      shadow: "shadow-yellow-500/20",
      label: "CHAMPION",
      IconComponent: Crown,
    },
    2: {
      border: "border-slate-300",
      bg: "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-900/10",
      icon: "text-slate-400",
      text: "text-slate-600 dark:text-slate-300",
      shadow: "shadow-slate-400/20",
      label: "2ND PLACE",
      IconComponent: Medal,
    },
    3: {
      border: "border-orange-300",
      bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-orange-900/10",
      icon: "text-orange-500",
      text: "text-orange-700 dark:text-orange-400",
      shadow: "shadow-orange-500/20",
      label: "3RD PLACE",
      IconComponent: Flame,
    },
  };

  const config = rankConfig[rank as 1 | 2 | 3] || rankConfig[3]; // Fallback safe
  const Icon = config.IconComponent;

  return (
    <Link
      href={`/debate/${topic.id}`}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1",
        config.border,
        config.bg,
        "hover:shadow-lg",
        config.shadow
      )}
    >
      {/* Rank Badge / Visual */}
      <div className="shrink-0 relative">
        <div
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 shadow-sm",
            config.border,
            config.icon
          )}
        >
          <span className="text-xl font-black italic">{rank}</span>
        </div>
        <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <Icon className={cn("w-3.5 h-3.5", config.icon)} fill="currentColor" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-[10px] font-black tracking-widest uppercase", config.text)}>{config.label}</span>
        </div>

        <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {topic.display_name}
        </h3>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 border border-slate-100 dark:border-slate-800">
            <Trophy className="w-3 h-3 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {totalVotes.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">Votes</span>
            </span>
          </div>
        </div>
      </div>

      {/* Arrow Indicator (Subtle) */}
      <div className="shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <div className={cn("w-1 h-8 rounded-full", config.icon.replace("text-", "bg-"))} />
      </div>
    </Link>
  );
}
