'use client';

import { Article } from "@/types";
import Image from "next/image";
import Link from "next/link";
import Favicon from "./common/Favicon";
import ClientOnlyTime from "./common/ClientOnlyTime";

interface ChatArticleCardProps {
  article: Article;
}

export default function ChatArticleCard({ article }: ChatArticleCardProps) {
  if (!article) return null;

  return (
    <div className="w-full max-w-sm mx-auto bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 my-1">
      <Link href={article.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-zinc-700/50 transition-colors">
        <div className="flex">
          <div className="w-24 flex-shrink-0">
            <div className="relative w-full h-full aspect-square">
              <Image
                src={article.thumbnail_url || '/placeholder.png'}
                alt={`${article.title} thumbnail`}
                fill
                sizes="96px"
                style={{ objectFit: "cover" }}
                unoptimized={true}
              />
            </div>
          </div>
          <div className="flex flex-col flex-grow p-3">
            <h3 className="font-semibold text-sm text-zinc-100 mb-1 line-clamp-2">{article.title}</h3>
            <div className="flex items-center text-xs text-zinc-400 mt-auto pt-2">
              {article.favicon_url && <Favicon src={article.favicon_url} alt={`${article.source} favicon`} size={14} />}
              <span className="ml-1.5 truncate">{article.source}</span>
              <span className="mx-1.5">·</span>
              <ClientOnlyTime date={article.published_at} format="yy-MM-dd" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
