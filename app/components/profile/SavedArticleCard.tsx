"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article, SavedArticleCategory } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { MoreHorizontal, Tag, Folder, Trash2, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedArticleCardProps {
  article: Article;
  categories: SavedArticleCategory[];
  onMove: (article: Article, categoryId: number | null) => void;
  onUnsave: (article: Article) => void;
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

  const currentCategoryName = categories.find(c => c.id === article.category_id)?.name;

  return (
    <div className="group relative flex flex-col bg-card rounded-xl border border-border transition-all duration-300 hover:shadow-lg">
      <Link href={article.url} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-video overflow-hidden rounded-t-xl hover-zoom-img">
        <Image
          src={article.thumbnail_url || "/placeholder.png"}
          alt={article.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink size={16} />
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-base leading-tight mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-xs text-muted-foreground flex-grow">
          {article.source} · {formatRelativeTime(article.published_at)}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/80">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag size={14} className={currentCategoryName ? 'text-primary' : ''} />
            <span className="truncate">{currentCategoryName || '미분류'}</span>
          </div>
          
          <div ref={menuRef} className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <MoreHorizontal size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-popover border border-border rounded-lg shadow-xl z-10 p-2">
                <p className="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">카테고리 이동</p>
                <div className="max-h-40 overflow-y-auto">
                  <button onClick={() => { onMove(article, null); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent">
                    <Folder size={14} />
                    <span className="flex-1">미분류</span>
                    {article.category_id === null && <Check size={16} className="text-primary" />}
                  </button>
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => { onMove(article, cat.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent">
                      <Tag size={14} />
                      <span className="flex-1 truncate">{cat.name}</span>
                      {article.category_id === cat.id && <Check size={16} className="text-primary" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border my-2"></div>
                <button onClick={() => { onUnsave(article); setIsMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-destructive hover:bg-destructive/10">
                  <Trash2 size={14} />
                  <span>저장 취소</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
