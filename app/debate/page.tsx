"use client";

import { useEffect, useState, useMemo } from "react";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import { getAllTopics, getPopularTopicsAll } from "@/lib/api";
import { Topic } from "@/types";
import { cn } from "@/lib/utils";
import DebateCard from "../components/debate/DebateCard";
import CategoryFilters from "../components/debate/CategoryFilters";
import { EmptyState } from "../components/common/EmptyState";
import { MessagesSquare } from "lucide-react";

// Mock categories for filtering, as the Topic type doesn't have a category
const filterCategories = ["전체", "사회", "핫이슈", "정책", "fun", "법", "문화", "정치", "경제", "기술", "젠더"];

export default function DebatePage() {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [sortOrder, setSortOrder] = useState<"popular" | "latest">("popular");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'past'>('ongoing');
  const [selectedCategory, setSelectedCategory] = useState('전체');

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        const popular = await getPopularTopicsAll();
        const latest = await getAllTopics();
        // Combine and create a unique set of topics
        const topicsMap = new Map<number, Topic>();
        [...popular, ...latest].forEach(topic => topicsMap.set(topic.id, topic));
        const uniqueTopics = Array.from(topicsMap.values());
        setAllTopics(uniqueTopics);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
        setAllTopics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const processedTopics = useMemo(() => {
    // Assign mock categories for demonstration
    const topicsWithCategories = allTopics.map(topic => ({
      ...topic,
      category: filterCategories[(topic.id % (filterCategories.length - 1)) + 1],
    }));

    // Filter by category
    const categorizedTopics = selectedCategory === '전체'
      ? topicsWithCategories
      : topicsWithCategories.filter(t => t.category === selectedCategory);

    // Sort
    const sortedTopics = [...categorizedTopics].sort((a, b) => {
      if (sortOrder === 'popular') {
        return (b.popularity_score || b.view_count) - (a.popularity_score || a.view_count);
      }
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

    // Split into ongoing and past
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const ongoing = sortedTopics.filter(t => new Date(t.published_at) > sevenDaysAgo);
    const past = sortedTopics.filter(t => new Date(t.published_at) <= sevenDaysAgo);

    return { ongoing, past };
  }, [allTopics, selectedCategory, sortOrder]);
  
  const topicsToShow = activeTab === 'ongoing' ? processedTopics.ongoing : processedTopics.past;

  const TabButton = ({ tab, label }: { tab: 'ongoing' | 'past'; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        "px-4 py-2.5 text-lg font-bold transition-colors",
        activeTab === tab 
          ? "text-foreground border-b-2 border-primary" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="text-center my-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
          ROUND2 토론
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          가장 뜨거운 주제에 대해 다른 사람들과 의견을 나누고, 새로운 관점을 발견해보세요.
        </p>
      </header>

      <div className="sticky top-[68px] bg-background/80 backdrop-blur-md z-20 py-4 -mx-4 px-4 border-b border-border">
        <CategoryFilters selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="flex items-center border-b border-border">
          <TabButton tab="ongoing" label="진행중인 토론" />
          <TabButton tab="past" label="지난 토론" />
        </div>
        <div className="flex items-center p-1 bg-secondary rounded-lg">
          <button
            onClick={() => setSortOrder("popular")}
            className={`w-20 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              sortOrder === "popular" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            인기순
          </button>
          <button
            onClick={() => setSortOrder("latest")}
            className={`w-20 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              sortOrder === "latest" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            최신순
          </button>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <LoadingSpinner size="large" />
          </div>
        ) : topicsToShow.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicsToShow.map((topic) => (
              <DebateCard key={topic.id} topic={topic} status={activeTab} />
            ))}
          </div>
        ) : (
          <div className="py-20">
            <EmptyState
              Icon={MessagesSquare}
              title="토론 없음"
              description="선택하신 조건에 맞는 토론이 없습니다. 다른 필터를 시도해보세요."
            />
          </div>
        )}
      </div>
    </div>
  );
}
