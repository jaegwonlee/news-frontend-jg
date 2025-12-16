"use client";

import ArticleCard from "@/app/components/ArticleCard";
import { Article } from "@/lib/types/article";
import { cn } from "@/lib/utils";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { useState } from "react";

interface ArticleSidePanelProps {
  articles: Article[];
}

export type Stance = "LEFT" | "CENTER" | "RIGHT"; // Exported for potential external use if needed, or kept internal

export const stanceConfig = {
  LEFT: { label: "진보", color: "blue", Icon: AlignLeft },
  CENTER: { label: "중도", color: "gray", Icon: AlignCenter },
  RIGHT: { label: "보수", color: "red", Icon: AlignRight },
};

export default function ArticleSidePanel({ articles }: ArticleSidePanelProps) {
  const [activeStance, setActiveStance] = useState<Stance>("LEFT");

  const filteredArticles = articles.filter((a) => a.side === activeStance);

  return (
    <aside className="sticky top-[100px] h-fit">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          Match Briefing
        </h3>

        {/* Minimal Pill Tabs */}
        <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-full">
          {Object.entries(stanceConfig).map(([stanceKey, config]) => {
            const currentStance = stanceKey as Stance;
            const isActive = activeStance === currentStance;

            return (
              <button
                key={currentStance}
                onClick={() => setActiveStance(currentStance)}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-full transition-all duration-300",
                  isActive
                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full inline-block mr-1.5",
                    config.color === "blue" ? "bg-blue-500" : config.color === "red" ? "bg-red-500" : "bg-slate-400"
                  )}
                />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Grid (No Box) */}
      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant="compact"
              className="bg-transparent border-0 shadow-none rounded-xl transition-colors p-2"
              hideImage={false}
              disableHover={true}
            />
          ))
        ) : (
          <div className="text-center py-10 opacity-50">
            <p className="text-xs font-bold">관련 브리핑이 존재하지 않습니다.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
