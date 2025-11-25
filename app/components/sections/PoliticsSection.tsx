"use client";

import { Article } from "@/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import SectionGrid from "../SectionGrid";

interface PoliticsSectionProps {
  articles: Article[];
}

export default function PoliticsSection({ articles }: PoliticsSectionProps) {
  return (
    <section className="py-8 border-b border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold font-serif tracking-tight text-foreground flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-900 dark:bg-blue-600 rounded-sm"></span>
          정치
        </h2>
        <Link
          href="/politics"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors"
        >
          더보기 <ArrowRight size={16} />
        </Link>
      </div>
      <SectionGrid articles={articles} variant="1+4" />
    </section>
  );
}
