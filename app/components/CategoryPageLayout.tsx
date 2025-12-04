"use client";

import { useMemo, useState, useEffect } from "react";
import CategoryNewsClientPage from "./CategoryNewsClientPage";
import ChatRoom from "./ChatRoom";
import { Topic } from "@/lib/types/topic";
import { useAuth } from "../context/AuthContext";
import { getTopicDetail } from "@/lib/api/topics";
import LoadingSpinner from "./common/LoadingSpinner";

interface CategoryPageLayoutProps {
  categoryName: string;
}

const categoryTopicMap: { [key: string]: number } = {
  "정치": 2,
  "경제": 3,
  "사회": 4,
  "문화": 5,
  "스포츠": 6,
};

export default function CategoryPageLayout({ categoryName }: CategoryPageLayoutProps) {
  const { token } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const topicId = categoryTopicMap[categoryName];

  useEffect(() => {
    const fetchTopic = async () => {
      if (!topicId) {
        setIsLoading(false);
        return;
      };
      setIsLoading(true);
      try {
        const topicData = await getTopicDetail(String(topicId));
        setTopic(topicData.topic);
      } catch (error) {
        console.error("Failed to fetch topic for chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);


  if (!topicId) {
    return <CategoryNewsClientPage categoryName={categoryName} />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Main Content Area */}
      <CategoryNewsClientPage categoryName={categoryName} />

      {/* Fixed Chat Panel in the right margin, only shown if logged in */}
      {token && (
        <div className="fixed hidden xl:block top-24 right-0 w-[320px] h-[calc(100vh-7rem)] pr-4 z-40">
          {isLoading ? (
             <div className="flex items-center justify-center h-full bg-card border border-border rounded-2xl">
                <LoadingSpinner />
             </div>
          ) : (
            <ChatRoom topic={topic || undefined} />
          )}
        </div>
      )}
    </div>
  );
}
