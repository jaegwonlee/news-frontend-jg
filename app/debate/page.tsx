"use client";

import { useEffect, useState, useMemo } from "react";
import { getPopularTopicsAll, getAllTopics } from "@/lib/api";
import { Topic } from "@/types";
import { cn } from "@/lib/utils";
import DebateCard from "../components/debate/DebateCard";
import { PenSquare } from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";

// Mock data to enrich the UI, since the API doesn't provide all needed fields
const addMockData = (topics: Topic[]): (Topic & { pro_votes: number; con_votes: number; category: string })[] => {
    const categories = ["사회", "기술", "정치", "경제", "문화"];
    return topics.map((topic, index) => ({
        ...topic,
        pro_votes: topic.popularity_score || Math.floor(Math.random() * 2000),
        con_votes: topic.view_count > 1000 ? Math.floor(topic.view_count / 2) : Math.floor(Math.random() * 2000),
        category: categories[index % categories.length],
    }));
};

export default function DebateArenaPage() {
  const [allTopics, setAllTopics] = useState<(Topic & { pro_votes: number; con_votes: number; category: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        const popular = await getPopularTopicsAll();
        const latest = await getAllTopics();
        const topicsMap = new Map<number, Topic>();
        [...popular, ...latest].forEach(topic => topicsMap.set(topic.id, topic));
        const uniqueTopics = Array.from(topicsMap.values());
        setAllTopics(addMockData(uniqueTopics));
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const { featured, ongoing, past } = useMemo(() => {
    const sortedByPopularity = [...allTopics].sort((a, b) => (b.pro_votes + b.con_votes) - (a.pro_votes + a.con_votes));
    
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const ongoingTopics = sortedByPopularity.filter(t => new Date(t.published_at) > sevenDaysAgo);
    const pastTopics = sortedByPopularity.filter(t => new Date(t.published_at) <= sevenDaysAgo);

    return {
      featured: ongoingTopics[0],
      ongoing: ongoingTopics.slice(1),
      past: pastTopics,
    };
  }, [allTopics]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-background"><LoadingSpinner size="large" /></div>;
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
            DEBATE ARENA
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            가장 뜨거운 토론의 중심, 당신의 목소리를 내주세요.
          </p>
           <div className="mt-8">
            <button className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-3 rounded-full hover:bg-red-700 transition-transform hover:scale-105 shadow-lg shadow-red-500/20">
                <PenSquare size={20} />
                <span>새로운 아레나 제안</span>
            </button>
        </div>
        </header>

        {/* Featured Debate (Center Stage) */}
        {featured && (
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-widest">Main Event</h2>
            <DebateCard topic={featured} status="ongoing" isFeatured={true} />
          </section>
        )}

        {/* Other Ongoing Debates */}
        {ongoing.length > 0 && (
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-6">Ongoing Debates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoing.map(topic => (
                <DebateCard key={topic.id} topic={topic} status="ongoing" />
              ))}
            </div>
          </section>
        )}

        {/* Past Debates */}
        {past.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Hall of Fame</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {past.map(topic => (
                <DebateCard key={topic.id} topic={topic} status="past" />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}