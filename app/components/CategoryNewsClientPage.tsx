"use client";

import { getCategoryTheme } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";
import { Article } from "@/types";
import { ChevronRight, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import ClientOnlyTime from "./common/ClientOnlyTime";
import ClientPaginationControls from "./common/ClientPaginationControls";
import { EmptyState } from "./common/EmptyState";
import Favicon from "./common/Favicon";

interface CategoryNewsClientPageProps {
  articles: Article[];
  categoryName: string;
}

const ARTICLES_PER_PAGE = 20; // Changed to 20 for more diverse layout options

export default function CategoryNewsClientPage({ articles, categoryName }: CategoryNewsClientPageProps) {
  const [selectedSource, setSelectedSource] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);

  const theme = getCategoryTheme(categoryName);

  const sources = useMemo(() => {
    const allSources = articles.map((article) => article.source);
    return ["전체", ...Array.from(new Set(allSources))];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return selectedSource === "전체" ? articles : articles.filter((article) => article.source === selectedSource);
  }, [articles, selectedSource]);

  // Reset to page 1 whenever filters change - Removed useEffect to avoid cascading renders
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [selectedSource]);

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const paginatedArticles = useMemo(() => {
    const indexOfLastArticle = currentPage * ARTICLES_PER_PAGE;
    const indexOfFirstArticle = indexOfLastArticle - ARTICLES_PER_PAGE;
    return filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  }, [filteredArticles, currentPage]);

  const renderArticleContent = (
    article: Article,
    type: "hero" | "standard" | "compact" | "horizontal" | "title-only",
    isProminent: boolean = false
  ) => {
    const commonClasses = cn(
      "group relative block h-full bg-card rounded-xl overflow-hidden border border-border transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] hover:border-primary",
      isProminent && "hover:border-2"
    );

    const hoverAccentClasses = theme.hoverText;
    const hoverBorderClasses = theme.hoverBorder;

    switch (type) {
      case "hero":
        return (
          <Link href={article.url} target="_blank" rel="noopener noreferrer" className={commonClasses}>
            <div className="relative w-full h-2/3 md:h-3/5 overflow-hidden">
              <Image
                src={article.thumbnail_url || "/placeholder.png"}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-bold px-2 py-1 rounded bg-black/50">{article.source}</span>
              </div>
            </div>
            <div className="p-4 flex flex-col justify-between grow">
              <h3
                className={cn(
                  "font-bold text-xl leading-tight line-clamp-2 mb-2 transition-colors",
                  hoverAccentClasses
                )}
              >
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3 grow">
                {article.description || article.summary}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <ClientOnlyTime date={article.published_at} />
                <span className="mx-2">•</span>
                <span>{article.view_count?.toLocaleString() || 0} 조회</span>
              </div>
            </div>
          </Link>
        );
      case "standard":
        return (
          <Link href={article.url} target="_blank" rel="noopener noreferrer" className={commonClasses}>
            <div className="relative w-full aspect-video overflow-hidden rounded-t-xl">
              <Image
                src={article.thumbnail_url || "/placeholder.png"}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
                unoptimized
              />
            </div>
            <div className="p-4 flex flex-col grow">
              <h3
                className={cn(
                  "font-bold text-base leading-tight line-clamp-2 mb-2 transition-colors",
                  hoverAccentClasses
                )}
              >
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-3 grow">{article.summary}</p>
              <div className="flex items-center text-xs text-muted-foreground mt-3">
                <Favicon src={article.favicon_url || ""} alt={`${article.source} favicon`} size={12} />
                <span className="ml-1">{article.source}</span>
              </div>
            </div>
          </Link>
        );
      case "compact":
        return (
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "block p-4 rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-md hover:translate-x-1",
              hoverBorderClasses
            )}
          >
            <h3 className={cn("font-semibold text-sm leading-snug line-clamp-2 transition-colors", hoverAccentClasses)}>
              {article.title}
            </h3>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <Favicon src={article.favicon_url || ""} alt={`${article.source} favicon`} size={12} />
              <span className="ml-1">{article.source}</span>
            </div>
          </Link>
        );
      case "horizontal":
        return (
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(commonClasses, "flex flex-row items-start gap-4 p-4")}
          >
            <div className="relative w-24 h-16 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={article.thumbnail_url || "/placeholder.png"}
                alt={article.title}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
            </div>
            <div className="flex flex-col grow">
              <h3 className={cn("font-bold text-base leading-snug line-clamp-2 transition-colors", hoverAccentClasses)}>
                {article.title}
              </h3>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Favicon src={article.favicon_url || ""} alt={`${article.source} favicon`} size={12} />
                <span className="ml-1">{article.source}</span>
              </div>
            </div>
          </Link>
        );
      case "title-only":
        return (
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "block p-3 rounded-lg bg-card border border-border transition-all duration-300 hover:shadow-sm",
              hoverBorderClasses
            )}
          >
            <h3 className={cn("font-semibold text-sm leading-snug line-clamp-2 transition-colors", hoverAccentClasses)}>
              {article.title}
            </h3>
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
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
              onClick={() => {
                setSelectedSource(source);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                selectedSource === source
                  ? `${theme.bg} text-white`
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              {source === "전체" ? "전체 언론사" : source}
              {/* Added a small arrow for selected source for visual flair */}
              {selectedSource === source && <ChevronRight size={16} className="ml-2" />}
            </button>
          ))}
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="py-20">
          <EmptyState Icon={Newspaper} title="기사 없음" description="해당 언론사의 뉴스가 없습니다." />
        </div>
      ) : (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(180px,fr)]">
            {" "}
            {/* Main Grid */}
            {paginatedArticles.map((article, index) => {
              // Decide layout based on index and overall design vision
              if (index === 0) {
                // Large Hero Feature: Full width, taller
                return (
                  <div key={article.id} className="md:col-span-2 lg:col-span-3 xl:col-span-4 row-span-2">
                    {renderArticleContent(article, "hero", true)}
                  </div>
                );
              } else if (index === 1 || index === 2) {
                // Two medium features, could be 2-col on larger screens
                return (
                  <div key={article.id} className="md:col-span-1 lg:col-span-1 xl:col-span-2">
                    {renderArticleContent(article, "standard")}
                  </div>
                );
              } else if (index === 3 || index === 4 || index === 5) {
                // Three compact articles, less visual weight
                return (
                  <div key={article.id} className="md:col-span-1 lg:col-span-1 xl:col-span-1">
                    {renderArticleContent(article, "compact")}
                  </div>
                );
              } else if (index === 6 || index === 7) {
                // Two horizontal list style articles
                return (
                  <div key={article.id} className="md:col-span-1 lg:col-span-2 xl:col-span-2">
                    {renderArticleContent(article, "horizontal")}
                  </div>
                );
              } else if (index === 8 || index === 9 || index === 10 || index === 11) {
                // A block of 4 title-only articles
                return (
                  <div key={article.id} className="xl:col-span-1">
                    {renderArticleContent(article, "title-only")}
                  </div>
                );
              }
              // Fallback for the rest of the articles
              return (
                <div key={article.id} className="lg:col-span-1">
                  {renderArticleContent(article, "standard")}
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <ClientPaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      )}
    </div>
  );
}
