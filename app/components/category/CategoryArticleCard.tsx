"use client";

import ArticleSaveButton from "@/app/components/ArticleSaveButton";
import ClientOnlyTime from "@/app/components/common/ClientOnlyTime";
import Favicon from "@/app/components/common/Favicon";
import { getCategoryTheme } from "@/lib/categoryColors";
import { Article } from "@/lib/types/article";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

interface CategoryArticleCardProps {
  article: Article;
  variant: "hero" | "standard" | "compact" | "horizontal" | "title-only";
  token: string | null;
  handleSaveToggle: (article: Article) => void;
  categoryTheme: ReturnType<typeof getCategoryTheme>;
}

export default function CategoryArticleCard({
  article,
  variant,
  token,
  handleSaveToggle,
  categoryTheme,
}: CategoryArticleCardProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const { title, summary, thumbnail_url, source, url, published_at, view_count, favicon_url } = article;

  const commonClasses = cn(
    "group relative block h-full bg-card rounded-xl overflow-hidden border border-border transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] hover:border-primary"
  );

  const hoverAccentClasses = categoryTheme.hoverText;
  const hoverBorderClasses = categoryTheme.hoverBorder;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSaveToggle(article);
  };

  switch (variant) {
    case "hero":
      return (
        <Link href={article.url} target="_blank" rel="noopener noreferrer" className={commonClasses}>
          <div className="relative w-full h-2/3 md:h-3/5 overflow-hidden">
            <Image
              src={thumbnail_url || "/placeholder.png"}
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
              className={cn("font-bold text-xl leading-tight line-clamp-2 mb-2 transition-colors", hoverAccentClasses)}
            >
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3 grow">
              {article.description || article.summary}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center text-xs text-muted-foreground">
                <ClientOnlyTime date={article.published_at} />
                <span className="mx-2">•</span>
                <span>{view_count?.toLocaleString() || 0} 조회</span>
              </div>
              <ArticleSaveButton isSaved={article.isSaved || false} onClick={handleSaveClick} />
            </div>
          </div>
        </Link>
      );
    case "standard":
      return (
        <Link href={article.url} target="_blank" rel="noopener noreferrer" className={commonClasses}>
          <div className="relative w-full aspect-video overflow-hidden rounded-t-xl">
            <Image
              src={thumbnail_url || "/placeholder.png"}
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
              {title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-3 grow">{article.summary}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center text-xs text-muted-foreground">
                <Favicon src={article.favicon_url || ""} alt={`${article.source} favicon`} size={12} />
                <span className="ml-1">{article.source}</span>
              </div>
              <ArticleSaveButton isSaved={article.isSaved || false} onClick={handleSaveClick} />
            </div>
          </div>
        </Link>
      );
    case "compact":
      return (
        <div className="relative">
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
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Favicon src={article.favicon_url || ""} alt={`${article.source} favicon`} size={12} />
                <span className="ml-1">{article.source}</span>
              </div>
              <ArticleSaveButton isSaved={article.isSaved || false} onClick={handleSaveClick} />
            </div>
          </Link>
        </div>
      );
    case "horizontal":
      return (
        <div className="relative">
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(commonClasses, "flex flex-row items-start gap-4 p-4")}
          >
            <div className="relative w-24 h-16 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={thumbnail_url || "/placeholder.png"}
                alt={article.title}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
            </div>
            <div className="flex flex-col grow">
              <h3 className={cn("font-bold text-base leading-snug line-clamp-2 transition-colors", hoverAccentClasses)}>
                {title}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Favicon src={article.favicon_url || ""} alt={`${article.source} favicon`} size={12} />
                  <span className="ml-1">{source}</span>
                </div>
                <ArticleSaveButton isSaved={article.isSaved || false} onClick={handleSaveClick} />
              </div>
            </div>
          </Link>
        </div>
      );
    case "title-only":
      return (
        <div className="relative">
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "block p-3 rounded-lg bg-card border border-border transition-all duration-300 hover:shadow-sm",
              hoverBorderClasses
            )}
          >
            <div className="flex items-center justify-between">
              <h3
                className={cn("font-semibold text-sm leading-snug line-clamp-2 transition-colors", hoverAccentClasses)}
              >
                {article.title}
              </h3>
              <ArticleSaveButton isSaved={article.isSaved || false} onClick={handleSaveClick} />
            </div>
          </Link>
        </div>
      );
    default:
      return null;
  }
}
