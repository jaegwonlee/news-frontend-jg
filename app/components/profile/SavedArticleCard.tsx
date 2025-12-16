import { SavedArticle } from "@/lib/types/article";
import { SavedArticleCategory } from "@/lib/types/shared";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Check, Folder, MoreHorizontal, Tag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Favicon from "../common/Favicon";

interface SavedArticleCardProps {
  article: SavedArticle;
  categories: SavedArticleCategory[];
  onMove: (article: SavedArticle, categoryId: number | null) => void;
  onUnsave: (article: SavedArticle) => void;
}

export default function SavedArticleCard({ article, categories, onMove, onUnsave }: SavedArticleCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const currentCategoryName = categories.find((c) => c.id === article.category_id)?.name;

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border transition-all duration-300",
        "border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
      )}
    >
      {/* Thumbnail Section */}
      <Link
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full aspect-[16/9] overflow-hidden bg-zinc-100 dark:bg-zinc-800"
      >
        <Image
          src={article.thumbnail_url || "/placeholder.png"}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />

        {/* Category Badge overlay */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={cn(
              "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md backdrop-blur-md shadow-sm border border-white/10",
              article.category_id ? "bg-blue-600 text-white" : "bg-black/80 text-white"
            )}
          >
            {currentCategoryName || "Unclassified"}
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col grow">
        {/* Meta Header */}
        <div className="flex items-center gap-2 mb-3">
          <Favicon src={article.favicon_url || ""} alt={article.source} size={16} className="rounded-sm" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-tight line-clamp-1">
            {article.source}
          </span>
          <span className="text-[10px] text-zinc-300 dark:text-zinc-600 font-black">•</span>
          <span className="text-xs text-zinc-400 font-medium" suppressHydrationWarning>
            {formatRelativeTime(article.published_at)}
          </span>
        </div>

        <Link href={article.url} target="_blank" rel="noopener noreferrer" className="group/title">
          <h3 className="font-bold text-lg leading-snug mb-3 text-zinc-900 dark:text-white line-clamp-2 group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors">
            {article.title}
          </h3>
        </Link>

        <p className="text-sm text-zinc-500 line-clamp-3 mb-4 leading-relaxed">
          {article.summary || article.description}
        </p>

        <div className="mt-auto pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <Link
            href={article.url}
            target="_blank"
            className="text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            Read Article
          </Link>

          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="p-2 -mr-2 rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-20 p-1.5 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                  Move to Category
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      onMove(article, null);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Folder size={14} className="text-zinc-400" />
                    <span className="flex-1 text-zinc-700 dark:text-zinc-300">Unclassified</span>
                    {article.category_id === null && <Check size={14} className="text-blue-600" strokeWidth={3} />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onMove(article, cat.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Tag size={14} className="text-zinc-400" />
                      <span className="flex-1 truncate text-zinc-700 dark:text-zinc-300">{cat.name}</span>
                      {article.category_id === cat.id && <Check size={14} className="text-blue-600" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                <button
                  onClick={() => {
                    onUnsave(article);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Remove from Saved</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
