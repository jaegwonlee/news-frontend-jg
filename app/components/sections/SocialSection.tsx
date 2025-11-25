"use client";

import { Article } from "@/types";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import SectionGrid from "../SectionGrid";

interface SocialSectionProps {
  articles: Article[];
}

export default function SocialSection({ articles }: SocialSectionProps) {
  return (
    <section className="py-8 border-b border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="text-indigo-600" />
          사회
        </h2>
        <Link
          href="/social"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-indigo-600 transition-colors"
        >
          더보기 <ArrowRight size={16} />
        </Link>
      </div>
      <SectionGrid articles={articles} variant="1+2" />
    </section>
  );
}
