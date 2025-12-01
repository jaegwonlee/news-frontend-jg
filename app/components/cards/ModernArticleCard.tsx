"use client";

import { Article } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bookmark, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ClientOnlyTime from "../common/ClientOnlyTime";
import Favicon from "../common/Favicon";

interface ModernArticleCardProps {
  article: Article;
  variant?: "hero" | "standard" | "compact" | "horizontal" | "text-only" | "glass";
  className?: string;
  priority?: boolean;
  hoverColorClass?: string;
}

export default function ModernArticleCard({
  article,
  variant = "standard",
  className,
  priority = false,
  hoverColorClass = "group-hover:text-primary",
}: ModernArticleCardProps) {
  const { title, summary, thumbnail_url, source, url, published_at, view_count, favicon_url } = article;

  // Common hover and transition classes
  const cardBaseClasses =
    "group relative overflow-hidden rounded-xl bg-card border border-border/50 transition-all duration-300 hover:shadow-lg hover:border-primary/20";

  // Variant: Hero (Large, Immersive)
  if (variant === "hero") {
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(cardBaseClasses, "block h-full min-h-[400px]", className)}
      >
        <div className="absolute inset-0">
          <Image
            src={thumbnail_url || "/placeholder.png"}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={priority}
            sizes="(max-width: 768px) 100vw, 66vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-end h-full">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/80 backdrop-blur-md rounded-full border border-white/10 shadow-sm">
              <Favicon src={favicon_url || ""} alt={source} size={14} className="rounded-full bg-white/10 p-0.5" />
              <span className="text-xs font-bold text-white">{source}</span>
            </div>
            {view_count && view_count > 1000 && (
              <span className="px-2 py-0.5 text-[10px] font-medium text-amber-300 bg-black/40 backdrop-blur-sm rounded-full border border-amber-500/30 flex items-center gap-1">
                <Eye size={10} /> {view_count.toLocaleString()}
              </span>
            )}
          </div>

          <h2
            className={cn(
              "text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight mb-3 drop-shadow-sm transition-colors",
              hoverColorClass
            )}
          >
            {title}
          </h2>

          <p className="text-gray-200 text-sm md:text-base line-clamp-2 max-w-3xl mb-4 opacity-90">{summary}</p>

          <div className="flex items-center justify-between w-full mt-2">
            <ClientOnlyTime date={published_at} className="text-gray-300 text-xs" />
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
              <Bookmark size={20} className="text-gray-300 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Variant: Glass (Overlay style, good for featured but smaller than hero)
  if (variant === "glass") {
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(cardBaseClasses, "block h-full min-h-[250px]", className)}
      >
        <Image
          src={thumbnail_url || "/placeholder.png"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        <div className="absolute bottom-4 left-4 right-4 glass-panel p-4 rounded-lg border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Favicon src={favicon_url || ""} alt={source} size={12} />
            <span className="text-xs font-semibold text-foreground/80">{source}</span>
          </div>
          <h3 className={cn("font-bold text-lg leading-snug line-clamp-2 mb-1 transition-colors", hoverColorClass)}>
            {title}
          </h3>
        </div>
      </Link>
    );
  }

  // Variant: Horizontal (List style)
  if (variant === "horizontal") {
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(cardBaseClasses, "flex flex-row items-stretch h-32 md:h-40", className)}
      >
        <div className="relative w-1/3 md:w-48 shrink-0">
          <Image
            src={thumbnail_url || "/placeholder.png"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="200px"
            unoptimized
          />
        </div>
        <div className="flex flex-col justify-between p-4 grow">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <Favicon src={favicon_url || ""} alt={source} size={12} />
                <span className="text-xs font-medium text-primary/70">{source}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">•</span>
              <ClientOnlyTime date={published_at} className="text-[10px] text-muted-foreground" />
            </div>
            <h3
              className={cn(
                "font-bold text-base md:text-lg leading-snug line-clamp-2 transition-colors",
                hoverColorClass
              )}
            >
              {title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 hidden md:block mt-1">{summary}</p>
        </div>
      </Link>
    );
  }

  // Variant: Text Only (Minimal)
  if (variant === "text-only") {
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn("block group py-3 border-b border-border/40 last:border-0", className)}
      >
        <div className="flex items-start justify-between gap-4">
          <h3
            className={cn(
              "font-medium text-sm md:text-base leading-snug line-clamp-2 transition-colors",
              hoverColorClass
            )}
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex items-center gap-1.5">
            <Favicon src={favicon_url || ""} alt={source} size={12} />
            <span className="text-xs text-muted-foreground">{source}</span>
          </div>
          <span className="text-[10px] text-muted-foreground/50">•</span>
          <ClientOnlyTime date={published_at} className="text-[10px] text-muted-foreground/50" />
        </div>
      </Link>
    );
  }

  // Variant: Compact (For Bento Grid side items)
  if (variant === "compact") {
    return (
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(cardBaseClasses, "flex flex-col h-full", className)}
      >
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={thumbnail_url || "/placeholder.png"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        </div>
        <div className="flex flex-col grow p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Favicon src={favicon_url || ""} alt={source} size={12} />
            <span className="text-xs font-bold text-primary/80">{source}</span>
          </div>
          <h3 className={cn("font-bold text-sm leading-snug line-clamp-2 mb-2 transition-colors", hoverColorClass)}>
            {title}
          </h3>
          <div className="mt-auto pt-2 flex items-center justify-between border-t border-border/30">
            <ClientOnlyTime date={published_at} className="text-[10px] text-muted-foreground" />
          </div>
        </div>
      </Link>
    );
  }

  // Variant: Standard (Default vertical card)
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(cardBaseClasses, "flex flex-col h-full", className)}
    >
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          src={thumbnail_url || "/placeholder.png"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold bg-background/90 backdrop-blur text-foreground rounded shadow-sm">
            <Favicon src={favicon_url || ""} alt={source} size={12} />
            {source}
          </div>
        </div>
      </div>

      <div className="flex flex-col grow p-4 md:p-5">
        <h3 className={cn("font-bold text-lg leading-snug line-clamp-2 mb-2 transition-colors", hoverColorClass)}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 grow">{summary}</p>

        <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto">
          <div className="flex items-center text-xs text-muted-foreground">
            <ClientOnlyTime date={published_at} />
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            {/* Share icon removed as requested */}
            <Bookmark size={14} className="hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}
