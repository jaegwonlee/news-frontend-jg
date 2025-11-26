"use client";

import { Topic } from "@/types";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Users, MessageSquare, Flame } from "lucide-react";
import { useEffect, useState } from "react";

interface DebateCardProps {
  topic: Topic;
  status: 'ongoing' | 'past';
}

// Helper to calculate remaining days
const getRemainingDays = (dateString: string) => {
    const endDate = new Date(dateString);
    // Let's assume a debate lasts for 7 days
    endDate.setDate(endDate.getDate() + 7);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

export default function DebateCard({ topic, status }: DebateCardProps) {
    const [remainingDays, setRemainingDays] = useState(0);

    useEffect(() => {
        if (status === 'ongoing') {
            setRemainingDays(getRemainingDays(topic.published_at));
        }
    }, [topic.published_at, status]);


  const renderOngoingContent = () => (
    <>
      <div className="mb-4">
        <span className="text-sm font-bold text-red-500">진행중</span>
      </div>
      <h3 className="text-lg font-bold text-foreground mb-3 flex-grow line-clamp-2">{topic.display_name}</h3>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>{topic.view_count.toLocaleString()}명 참여</span>
        </div>
        <div className="font-semibold text-red-500">
          {remainingDays > 0 ? `${remainingDays}일 남음` : '마감 임박'}
        </div>
      </div>
    </>
  );

  const renderPastContent = () => (
    <>
      <div className="mb-4">
        <span className="text-sm font-bold text-muted-foreground">종료</span>
      </div>
      <h3 className="text-lg font-bold text-foreground/70 mb-3 flex-grow line-clamp-2">{topic.display_name}</h3>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} />
          {/* comment_count is not on Topic type, using view_count as placeholder */}
          <span>토론 {topic.view_count.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
            <Flame size={16} />
            <span>투표 {(topic.popularity_score || 0).toLocaleString()}</span>
        </div>
      </div>
    </>
  );

  return (
    <Link href={`/debate/${topic.id}`}>
      <div className="h-full bg-card border border-border rounded-xl p-6 flex flex-col hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
        {status === 'ongoing' ? renderOngoingContent() : renderPastContent()}
      </div>
    </Link>
  );
}
