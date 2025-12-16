"use client";

import { getTopicDetail } from "@/lib/api/topics";
import { Topic } from "@/lib/types/topic";
import { MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CategoryNewsClientPage from "./CategoryNewsClientPage";
import ChatRoom from "./ChatRoom";
import LoadingSpinner from "./common/LoadingSpinner";

interface CategoryPageLayoutProps {
  categoryName: string;
}

const categoryTopicMap: { [key: string]: number } = {
  정치: 2,
  경제: 3,
  사회: 4,
  문화: 5,
  스포츠: 6,
};

export default function CategoryPageLayout({ categoryName }: CategoryPageLayoutProps) {
  const { token } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const topicId = categoryTopicMap[categoryName];

  useEffect(() => {
    const fetchTopic = async () => {
      if (!topicId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const topicData = await getTopicDetail(String(topicId));
        setTopic(topicData.topic);
      } catch (error) {
        console.error("Failed to fetch topic for chat:", error);
        // Fallback: Create a dummy topic so chat works (optimistically)
        // This allows the chat window to be active ("input") even if the topic detail is missing/404
        setTopic({
          id: topicId,
          display_name: `${categoryName} 실시간 채팅`,
          summary: "자유롭게 의견을 나누세요.",
          published_at: new Date().toISOString(),
          view_count: 0,
          category: categoryName,
        } as Topic); // Type assertion to satisfy interface
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopic();
  }, [topicId, categoryName]);

  if (!topicId) {
    return <CategoryNewsClientPage categoryName={categoryName} />;
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Margin Spacer for Center Alignment */}
      {token && isChatOpen && <div className="hidden xl:block w-[320px] 2xl:w-[340px] shrink-0" />}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <CategoryNewsClientPage categoryName={categoryName} />
      </div>

      {/* Sticky Chat Panel in the right margin */}
      {/* Sticky Chat Panel in the right margin */}
      {token && (
        <>
          {isChatOpen ? (
            <div className="hidden xl:block w-[320px] 2xl:w-[340px] shrink-0 bg-card shadow-xl z-20 relative mt-[60px] 2xl:mt-[100px]">
              <div className="sticky top-[80px] h-[calc(100vh-140px)] 2xl:h-[calc(100vh-250px)] flex flex-col">
                <div className="absolute top-0 -left-10 z-50">
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors shadow-md"
                    title="채팅방 닫기"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <ChatRoom topic={topic || undefined} />
                )}
              </div>
            </div>
          ) : (
            <div className="hidden xl:block fixed bottom-8 right-8 z-50 animate-fade-in-up">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-transform hover:scale-105 font-bold"
              >
                <MessageSquare className="w-5 h-5" />
                <span>실시간 채팅</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
