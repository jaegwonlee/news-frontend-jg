"use client";

import { getAllTopics, getPopularTopics, getPopularTopicsAll } from "@/lib/api/topics";
import { Topic } from "@/lib/types/topic";
import { Crown, Plus, Siren, Swords } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Use the new Arena components
import ArenaChampionCard from "@/app/components/debate/ArenaChampionCard";
import ArenaFeatureCard from "@/app/components/debate/ArenaFeatureCard";
import ArenaMatchCard from "@/app/components/debate/ArenaMatchCard";

export default function DebateArenaPage() {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [popularRanking, setPopularRanking] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        const popularAll = await getPopularTopicsAll();
        const latest = await getAllTopics();
        const ranking = await getPopularTopics(); // Used strictly for Hall of Fame

        setPopularRanking(ranking);

        // Merge latest and popularAll to get the most comprehensive list of active topics.
        // We put popularAll LAST so that if an item exists in both, the version from popularAll (presumed richer) wins.
        const topicsMap = new Map<number, Topic>();
        [...latest, ...popularAll].forEach((topic) => topicsMap.set(topic.id, topic));
        const uniqueTopics = Array.from(topicsMap.values());

        // Sort by published date for the main feed
        uniqueTopics.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

        setAllTopics(uniqueTopics);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const { featured, ongoing } = useMemo(() => {
    const processedTopics = [...allTopics];
    // No additional sorting needed as it was done in fetch

    // Logic: Featured is the absolute latest item
    // Ongoing is everything else

    return {
      featured: processedTopics[0],
      ongoing: processedTopics.slice(1),
    };
  }, [allTopics]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-red-500/30">
      <main className="relative container mx-auto px-4 py-8">
        {/* Arena Header: Clean, Bold, Industrial */}
        <header className="mb-16 text-center relative z-10">
          <div className="inline-flex items-center justify-center gap-2 mb-4 px-3 py-1 bg-black text-white rounded-xs">
            <span className="w-1.5 h-1.5 bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Live Debate Arena</span>
          </div>

          <h1 className="relative text-7xl md:text-9xl font-black tracking-tighter uppercase leading-none">
            <span className="block md:inline text-black dark:text-white">FIGHT</span>
            <span className="block md:inline text-red-600 md:ml-4">NIGHT</span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto font-medium break-keep">
            가장 뜨거운 논쟁의 중심, 토론 아레나에 오신 것을 환영합니다.
            <br className="hidden md:block" />
            당신의 의견으로 승패를 결정하세요.
          </p>

          <div className="mt-8">
            <button className="group relative inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-black text-sm tracking-wide transition-transform hover:scale-105">
              <Plus className="w-4 h-4" />
              새로운 매치 생성
            </button>
          </div>
        </header>

        {/* Main Event Section */}
        {featured && (
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800" />
              <h2 className="text-xl font-black italic tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <Siren className="w-5 h-5 text-red-500" />
                MAIN EVENT
                <Siren className="w-5 h-5 text-red-500" />
              </h2>
              <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <ArenaFeatureCard topic={featured} status="ongoing" />
          </section>
        )}

        {/* Two Column Layout: Undercard (Cage) & Hall of Fame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Ongoing Fights (Cage Container) */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black italic text-foreground flex items-center gap-2 uppercase">
                <Swords className="w-6 h-6 text-muted-foreground" />
                진행 중인 매치
              </h2>
              <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-xs border border-border">
                {ongoing.length} 매치 활성
              </span>
            </div>

            {/* "Cage" Container Style - Removed for cleaner look */}
            <div className="relative">
              {/* Ongoing Matches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ongoing.length > 0 ? (
                  ongoing.map((topic) => <ArenaMatchCard key={topic.id} topic={topic} status="ongoing" />)
                ) : (
                  <div className="col-span-2 py-20 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-lg">
                    <p className="text-slate-500 font-medium">현재 진행 중인 매치가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Hall of Fame (Ranking) */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black italic text-foreground flex items-center gap-2 uppercase">
                  <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  명예의 전당
                </h2>
              </div>

              <div className="space-y-4">
                {popularRanking.length > 0 ? (
                  popularRanking
                    .slice(0, 3)
                    .map((topic, index) => <ArenaChampionCard key={topic.id} topic={topic} rank={index + 1} />)
                ) : (
                  <p className="text-center text-muted-foreground py-4 text-sm">아직 명예의 전당이 비어있습니다.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
