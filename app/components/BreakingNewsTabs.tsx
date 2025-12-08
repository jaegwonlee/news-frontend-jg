"use client";

import { Article } from "@/lib/types/article";
import { cn } from "@/lib/utils";
import { AlertCircle, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import ArticleCard from "./ArticleCard";

interface BreakingNewsTabsProps {
  breakingNews?: Article[];
  exclusiveNews?: Article[];
}

export default function BreakingNewsTabs({ breakingNews = [], exclusiveNews = [] }: BreakingNewsTabsProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [activeTab, setActiveTab] = useState<"breaking" | "exclusive">("breaking");
  
  const [articles, setArticles] = useState(activeTab === "breaking" ? breakingNews : exclusiveNews);

  useEffect(() => {
    setArticles(activeTab === "breaking" ? breakingNews : exclusiveNews);
  }, [activeTab, breakingNews, exclusiveNews]);

  const handleSaveToggle = (updatedArticle: Article) => {
    setArticles(prevArticles => 
      prevArticles.map(a => a.id === updatedArticle.id ? updatedArticle : a)
    );
  };

  const displayArticles = articles;

  return (
    <div className="flex flex-col h-full">
      {/* Header with Tabs */}
      <div className={`p-4 ${isDarkMode ? "bg-black" : "bg-white"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeTab === "breaking" ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <Star className="w-5 h-5 text-yellow-500" />
            )}
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
              {activeTab === "breaking" ? "속보" : "단독"}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("breaking")}
              className={cn(
                "px-2 py-1 text-xs font-bold rounded-md transition-colors",
                activeTab === "breaking"
                  ? "bg-red-600 text-white"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              )}
            >
              속보
            </button>
            <button
              onClick={() => setActiveTab("exclusive")}
              className={cn(
                "px-2 py-1 text-xs font-bold rounded-md transition-colors",
                activeTab === "exclusive"
                  ? "bg-yellow-600 text-white"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              )}
            >
              단독
            </button>
          </div>
        </div>
      </div>
      <hr className={isDarkMode ? "border-gray-700" : "border-gray-200"} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary">
        {displayArticles.length === 0 ? (
          <p className="text-center text-muted-foreground pt-10">
            {activeTab === "breaking" ? "속보 뉴스가 없습니다." : "단독 뉴스가 없습니다."}
          </p>
        ) : (
          displayArticles.slice(0, 5).map((article) => (
            <ArticleCard 
              key={article.id}
              article={article}
              variant="compact"
              onSaveToggle={handleSaveToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
