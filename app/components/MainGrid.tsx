"use client";

import { Topic } from "@/types";
import { useState } from "react";
import ChatRoom from "./ChatRoom";
import FloatingKeywords from "./FloatingKeywords";
import TrendingTopics from "./TrendingTopics";

interface MainGridProps {
  mainTopic: Topic | undefined;
  popularTopics?: Topic[];
  latestTopics?: Topic[];
}

export default function MainGrid({ mainTopic, popularTopics = [], latestTopics = [] }: MainGridProps) {
  const [topicTab, setTopicTab] = useState<"popular" | "latest">("popular");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
      {/* Left Column: Chat + News */}
      <div className="md:col-span-1 xl:col-span-2 flex flex-col gap-4 h-[600px] lg:h-[729px]">
        {/* ChatRoom Section - Takes remaining space */}
        <div className="relative z-20 rounded-2xl flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0">
            <ChatRoom topic={mainTopic} />
          </div>
        </div>
      </div>

      {/* Right Column: Trending Topics & New Component */}
      <div className="xl:col-span-1 grid grid-rows-2 gap-6 h-[600px] lg:h-[729px]">
        {/* ROUND2 Topics Section (Top Half) */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">ROUND2</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTopicTab("popular")}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                  topicTab === "popular"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                인기
              </button>
              <button
                onClick={() => setTopicTab("latest")}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                  topicTab === "latest"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                최신
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <TrendingTopics displayMode={topicTab} topics={topicTab === "popular" ? popularTopics : latestTopics} />
          </div>
        </div>

        {/* New Section (Bottom Half) */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col min-h-0">
          <FloatingKeywords />
        </div>
      </div>
    </div>
  );
}
