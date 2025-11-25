"use client";

import { Article } from "@/types";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import SectionGrid from "../SectionGrid";

interface EconomySectionProps {
  articles: Article[];
}

export default function EconomySection({ articles }: EconomySectionProps) {
  return (
    <section className="py-8 border-b border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <TrendingUp className="text-green-600" />
          경제
        </h2>
        <Link
          href="/economy"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-green-600 transition-colors"
        >
          더보기 <ArrowRight size={16} />
        </Link>
      </div>
      <SectionGrid articles={articles} variant="4-col" />
    </section>
  );
}
