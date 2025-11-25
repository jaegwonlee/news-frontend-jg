"use client";

import { getCategoryTheme } from "@/lib/categoryColors";
import { Article } from "@/types";
import { useMemo, useState } from "react";
import SectionGrid from "./SectionGrid";

interface CategoryNewsClientPageProps {
  articles: Article[];
  categoryName: string;
}

export default function CategoryNewsClientPage({ articles, categoryName }: CategoryNewsClientPageProps) {
  const [selectedSource, setSelectedSource] = useState("전체");

  const theme = getCategoryTheme(categoryName);

  const sources = useMemo(() => {
    const allSources = articles.map((article) => article.source);
    return ["전체", ...Array.from(new Set(allSources))];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return selectedSource === "전체" ? articles : articles.filter((article) => article.source === selectedSource);
  }, [articles, selectedSource]);

  const topArticles = filteredArticles.slice(0, 5);
  const restArticles = filteredArticles.slice(5);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in rounded-xl">
      <header className="mb-8">
        <h1 className={`text-5xl font-extrabold text-foreground border-b-4 ${theme.border} pb-4 inline-block`}>
          {categoryName}
        </h1>
      </header>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {sources.map((source) => (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                selectedSource === source
                  ? `${theme.bg} text-white`
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          <p className="text-lg">해당 언론사의 뉴스가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Top Section: 1 Hero + 4 Side */}
          <SectionGrid articles={topArticles} variant="1+4" />

          {/* Remaining Articles: 3 Column Grid */}
          {restArticles.length > 0 && <SectionGrid articles={restArticles} variant="3-col" />}
        </div>
      )}
    </div>
  );
}
