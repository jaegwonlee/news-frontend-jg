"use client";

import { Article } from "@/lib/types/article";
import { TrendingKeyword } from "@/lib/types/topic";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import Image from "next/image"; // Re-import Image

interface TrendingKeywordsProps {
  keywords: TrendingKeyword[];
}

const ArticleItem = ({ article, isDarkMode }: { article: Article; isDarkMode: boolean }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "article", ...article }));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 group p-2 rounded-lg transition-colors border",
        isDarkMode
          ? "bg-neutral-900 hover:bg-red-950/30 border-red-900/50"
          : "bg-red-50 hover:bg-red-100 border-red-100"
      )}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <Image
            src={article.favicon_url || "/placeholder.png"}
            alt=""
            width={14}
            height={14}
            className="w-3.5 h-3.5"
          />
          <span className="truncate">{article.source}</span>
        </div>
      </div>
    </a>
  );
};

export default function TrendingKeywords({ keywords }: TrendingKeywordsProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(0);

  if (!keywords || keywords.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className={`p-4 ${isDarkMode ? "bg-black" : "bg-white"}`}>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>이슈 NOW</h2>
          </div>
        </div>
        <hr className={isDarkMode ? "border-gray-700" : "border-gray-200"} />
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
          <p>현재 인기 키워드가 없습니다.</p>
        </div>
      </div>
    );
  }

  const selectedKeyword = keywords[selectedKeywordIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? "bg-black border-gray-800" : "bg-white border-gray-100"}`}>
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-600 dark:text-red-500" />
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>이슈 NOW</h2>
        </div>
      </div>

      {/* Content */}
      <div className="py-4 px-2 flex flex-col flex-1 min-h-0 bg-muted/10 dark:bg-muted/5">
        {/* Keyword Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {keywords.slice(0, 5).map((kw, index) => (
            <button
              key={kw.keyword}
              onClick={() => setSelectedKeywordIndex(index)}
              className={cn(
                "px-2.5 py-1 text-xs font-bold rounded-full transition-colors whitespace-nowrap border",
                selectedKeywordIndex === index
                  ? "bg-red-600 text-white shadow-sm border-red-600"
                  : "bg-background hover:bg-muted text-muted-foreground border-border hover:border-red-200 dark:hover:border-red-900/50"
              )}
            >
              #{kw.keyword}
            </button>
          ))}
        </div>

        {/* Article List */}
        <div className="flex-1 mt-1 space-y-2 overflow-y-auto pr-1">
          {selectedKeyword.articles.slice(0, 3).map((article) => (
            <ArticleItem key={article.id} article={article} isDarkMode={isDarkMode} />
          ))}
        </div>
      </div>
    </div>
  );
}
