"use client";

import DebateCard from "@/app/components/debate/DebateCard";
import { getAllTopics, getPopularTopicsAll } from "@/lib/api/topics";
import { Topic } from "@/lib/types/topic";
import { PenSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  const [allTopics, setAllTopics] = useState<(Topic & { pro_votes: number; con_votes: number; category: string })[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popularity" | "latest">("popularity");

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        const popular = await getPopularTopicsAll();
        const latest = await getAllTopics();
        const topicsMap = new Map<number, Topic>();
        [...popular, ...latest].forEach((topic) => topicsMap.set(topic.id, topic));
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
    let processedTopics = [...allTopics];

    // 1. Apply category filter
    if (filterCategory !== "all") {
      processedTopics = processedTopics.filter((topic) => topic.category === filterCategory);
    }

    // 2. Apply sorting
    if (sortBy === "popularity") {
      processedTopics.sort((a, b) => b.pro_votes + b.con_votes - (a.pro_votes + a.con_votes));
    } else if (sortBy === "latest") {
      processedTopics.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const ongoingTopics = processedTopics.filter((t) => new Date(t.published_at) > sevenDaysAgo);
    const pastTopics = processedTopics.filter((t) => new Date(t.published_at) <= sevenDaysAgo);

    return {
      featured: ongoingTopics[0],
      ongoing: ongoingTopics.slice(1),
      past: pastTopics,
    };
  }, [allTopics, filterCategory, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-normal text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
            DEBATE ARENA
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            가장 뜨거운 토론의 중심, 당신의 목소리를 내주세요.
          </p>
          <div className="mt-8">
            <button className="inline-flex items-center gap-2 bg-linear-to-r from-blue-500 to-purple-600 text-white font-bold px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/30">
              <PenSquare size={20} />
              <span>새로운 아레나 제안</span>
            </button>
          </div>
        </header>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center my-8 gap-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterCategory === "all"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              전체
            </button>
            {["사회", "기술", "정치", "경제", "문화"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterCategory === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort By */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("popularity")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortBy === "popularity"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              인기순
            </button>
            <button
              onClick={() => setSortBy("latest")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                sortBy === "latest"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              최신순
            </button>
          </div>
        </div>

        {/* Featured Debate (Center Stage) */}
        {featured && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center border-b border-border pb-4 mb-8 uppercase tracking-widest">
              Main Event
            </h2>
            <DebateCard topic={featured} status="ongoing" isFeatured={true} />
          </section>
        )}

        {/* Other Ongoing Debates */}
        {ongoing.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold border-b border-border pb-4 mb-8">Ongoing Debates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoing.map((topic) => (
                <DebateCard key={topic.id} topic={topic} status="ongoing" />
              ))}
            </div>
          </section>
        )}

        {/* Past Debates */}
        {past.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold border-b border-border pb-4 mb-8">Hall of Fame</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {past.map((topic) => (
                <DebateCard key={topic.id} topic={topic} status="past" />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
