"use client";

import SectionGrid from "@/app/components/SectionGrid";
import { Article } from "@/types";

interface KeywordClientPageProps {
  articles: Article[];
  keyword: string;
}

export default function KeywordClientPage({ articles, keyword }: KeywordClientPageProps) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <header className="mb-8 border-b-4 border-primary pb-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          <span className="text-primary">#</span>
          {keyword}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{articles.length}개의 관련 기사를 찾았습니다.</p>
      </header>

      {articles.length === 0 ? (
        <div className="text-center text-muted-foreground py-20">
          <p className="text-lg">이 키워드에 대한 기사가 없습니다.</p>
        </div>
      ) : (
        <SectionGrid articles={articles} variant="3-col" />
      )}
    </div>
  );
}
