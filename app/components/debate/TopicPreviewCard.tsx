"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { useTheme } from "next-themes";

// Define the type based on the user's provided structure
interface TopicPreview {
  id: number;
  display_name: string;
  status: string;
  left_count: number;
  right_count: number;
  vote_remaining_time: string | null;
  vote_end_at?: string; // Made optional to match lib/types/topic.ts
}

interface TopicPreviewCardProps {
  topic?: TopicPreview | null; // Make topic optional
  isNotFound?: boolean; // New prop for "not found" state
  failedTopicId?: string; // Optional: to display the ID of the topic that failed
}

export default function TopicPreviewCard({ topic, isNotFound, failedTopicId }: TopicPreviewCardProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  if (isNotFound || !topic) {
    return (
      <div className={`block mt-2 max-w-full`}>
        <div className={`w-full rounded-lg ${isDarkMode ? "border border-gray-800 bg-black" : "border border-gray-200 bg-white"} p-4 transition-all opacity-70`}>
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-lg text-foreground line-clamp-2 leading-tight">토론을 찾을 수 없습니다.</h4>
            <span className="text-xs font-semibold px-2 py-1 bg-red-500/10 text-red-500 rounded-full shrink-0 ml-2">
              오류
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            요청하신 토론 ID ({failedTopicId || '알 수 없음'}) 에 해당하는 토론을 찾을 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  const totalVotes = topic.left_count + topic.right_count;
  const leftPercent = totalVotes > 0 ? (topic.left_count / totalVotes) * 100 : 50;
  const rightPercent = 100 - leftPercent;

  return (
    <Link href={`/debate/${topic.id}`} className="block mt-2 max-w-full" draggable="true" onDragStart={(e) => {
      e.dataTransfer.setData("text/plain", `${window.location.origin}/debate/${topic.id}`);
      e.dataTransfer.setData("application/json", JSON.stringify({ type: 'topic', data: topic }));
    }}>
      <div className={`w-full rounded-lg ${isDarkMode ? "border border-gray-800 bg-black" : "border border-gray-200 bg-white"} p-4 transition-all hover:border-gray-700 hover:shadow-primary/10 hover:shadow-lg`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-lg text-foreground line-clamp-2 leading-tight">{topic.display_name}</h4>
          <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full shrink-0 ml-2">
            {topic.status}
          </span>
        </div>
        
        {/* Integrated Vote Bar */}
        <div className="w-full flex rounded-full text-white text-xs font-bold overflow-hidden h-6 my-3 bg-muted">
            <div className="bg-blue-600 flex items-center justify-start pl-3" style={{ width: `${leftPercent}%` }}>
                {leftPercent > 15 && <span>{Math.round(leftPercent)}%</span>}
            </div>
            <div className="bg-red-600 flex items-center justify-end pr-3" style={{ width: `${rightPercent}%` }}>
                {rightPercent > 15 && <span>{Math.round(rightPercent)}%</span>}
            </div>
        </div>

        {/* Vote details with glove icons */}
        <div className="flex justify-between items-center text-sm text-muted-foreground px-1">
            <div className="flex items-center gap-2">
                <Image src="/blue--glove.svg" width={18} height={18} alt="Pro" />
                <span className="font-semibold text-foreground">{topic.left_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{topic.right_count.toLocaleString()}</span>
                <Image src="/red--glove.svg" width={18} height={18} alt="Con" />
            </div>
        </div>
        
        {/* Footer with time */}
        {topic.vote_end_at && ( // Changed from vote_remaining_time
          <div className="text-center text-sm font-medium text-primary mt-4 pt-3 border-t border-border/50 flex items-center justify-center gap-2">
            <Clock size={14} />
            <span className="truncate">{topic.vote_end_at}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
