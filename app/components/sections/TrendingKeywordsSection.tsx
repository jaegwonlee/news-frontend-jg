"use client";

import { TrendingKeyword } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Flame, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ModernArticleCard from "../cards/ModernArticleCard";

interface TrendingKeywordsSectionProps {
  keywords: TrendingKeyword[];
}

export default function TrendingKeywordsSection({ keywords }: TrendingKeywordsSectionProps) {
  const [activeKeywordIndex, setActiveKeywordIndex] = useState(0);
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                이슈 NOW
                <span className="text-sm font-medium text-muted-foreground px-2 py-0.5 bg-muted rounded-full hidden sm:inline-block">
                  실시간 트렌드
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">지금 가장 뜨거운 키워드와 관련 뉴스를 확인하세요</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left: Keywords List (Tabs) */}
          <div className="w-full lg:w-1/4 shrink-0">
            <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar snap-x">
              {keywords.map((item, index) => {
                const isActive = index === activeKeywordIndex;
                return (
                  <button
                    key={item.keyword}
                    onClick={() => setActiveKeywordIndex(index)}
                    className={cn(
                      "snap-start shrink-0 flex items-center gap-4 p-4 rounded-xl transition-all duration-300 text-left relative overflow-hidden group w-64 lg:w-full",
                      isActive
                        ? "bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 scale-[1.02]"
                        : "bg-muted/30 hover:bg-muted/60 hover:scale-[1.01]"
                    )}
                  >
                    {/* Rank Number */}
                    <span
                      className={cn(
                        "text-2xl font-black italic w-8 text-center transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground/60"
                      )}
                    >
                      {index + 1}
                    </span>

                    {/* Keyword Info */}
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "font-bold text-lg leading-tight transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"
                        )}
                      >
                        {item.keyword}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <TrendingUp size={12} /> 관련 기사 {item.article_count}건
                      </span>
                    </div>

                    {/* Active Indicator (Right Border) */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}

                    {/* Arrow for mobile/active */}
                    <ChevronRight
                      className={cn(
                        "ml-auto transition-all duration-300",
                        isActive ? "text-primary opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                      )}
                      size={18}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Articles Grid (Content) */}
          <div className="w-full lg:w-3/4 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKeyword.keyword}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-primary">#{activeKeyword.keyword}</span> 관련 주요 뉴스
                  </h3>
                  <Link
                    href={`/search?q=${encodeURIComponent(activeKeyword.keyword)}`}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    더보기 <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                  {/* Main Featured Article (Left, Larger) */}
                  {activeKeyword.articles[0] && (
                    <div className="md:col-span-2 h-full">
                      <ModernArticleCard
                        article={activeKeyword.articles[0]}
                        variant="hero"
                        priority
                        className="h-full min-h-[350px] md:min-h-[450px]"
                      />
                    </div>
                  )}

                  {/* Side Articles (Right, Stacked) */}
                  <div className="flex flex-col gap-6 h-full">
                    {activeKeyword.articles.slice(1, 3).map((article) => (
                      <div key={article.id} className="flex-1">
                        <ModernArticleCard article={article} variant="compact" className="h-full" />
                      </div>
                    ))}
                    {/* If less than 3 articles, fill space or show placeholder? 
                        The API guarantees 3 articles usually, but good to be safe. 
                        If only 1 article, the grid will look empty on right. 
                        If 2 articles, the second one will be on top right.
                    */}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
