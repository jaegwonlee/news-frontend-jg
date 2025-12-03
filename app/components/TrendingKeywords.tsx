"use client";

import { Article } from "@/lib/types/article";
import { TrendingKeyword } from "@/lib/types/topic";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { Flame } from "lucide-react";

interface TrendingKeywordsProps {
  keywords: TrendingKeyword[];
}

const ArticleItem = ({ article }: { article: Article }) => {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 group p-2 rounded-lg hover:bg-accent transition-colors"
    >
      <div className="flex-shrink-0 w-16 h-12 rounded-md overflow-hidden relative">
        <Image
          src={article.thumbnail_url || "/placeholder.png"}
          alt={article.title}
          fill
          sizes="64px"
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <img
            src={article.favicon_url || `https://www.google.com/s2/favicons?domain=${article.source_domain}`}
            alt=""
            className="w-3.5 h-3.5"
          />
          <span className="truncate">{article.source}</span>
        </div>
      </div>
    </a>
  );
};

export default function TrendingKeywords({ keywords }: TrendingKeywordsProps) {
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState(0);

  if (!keywords || keywords.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 bg-black">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white">이슈 NOW</h2>
          </div>
        </div>
        <hr className="border-gray-700" />
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
        <div className="p-4 bg-black">
            <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h2 className="text-xl font-bold text-white">이슈 NOW</h2>
            </div>
        </div>
        <hr className="border-gray-700" />

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 min-h-0">
            {/* Keyword Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-4 px-4">
                {keywords.map((kw, index) => (
                <button
                    key={kw.keyword}
                    onClick={() => setSelectedKeywordIndex(index)}
                    className={cn(
                    "px-3 py-1.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap",
                    selectedKeywordIndex === index
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                >
                    #{kw.keyword}
                </button>
                ))}
            </div>

            {/* Article List */}
            <div className="flex-1 mt-3 space-y-2 overflow-y-auto -mx-2 pr-2">
                {selectedKeyword.articles.map((article) => (
                    <ArticleItem key={article.id} article={article} />
                ))}
            </div>
        </div>
    </div>
  );
}