"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Swords, Clock } from 'lucide-react';

// Define the type based on the user's provided structure
interface TopicPreview {
  id: number;
  display_name: string;
  status: string;
  left_count: number;
  right_count: number;
  vote_remaining_time: string | null;
}

interface TopicPreviewCardProps {
  topic: TopicPreview;
}

export default function TopicPreviewCard({ topic }: TopicPreviewCardProps) {
  const totalVotes = topic.left_count + topic.right_count;
  const leftPercent = totalVotes > 0 ? (topic.left_count / totalVotes) * 100 : 50;
  const rightPercent = 100 - leftPercent;

  return (
    <Link href={`/debate/${topic.id}`} className="block mt-2 w-80" draggable="true" onDragStart={(e) => {
      e.dataTransfer.setData("text/plain", `${window.location.origin}/debate/${topic.id}`);
      e.dataTransfer.setData("application/json", JSON.stringify({ type: 'topic', data: topic }));
    }}>
      <div className="w-full rounded-lg border border-gray-800 bg-black p-4 transition-all hover:border-gray-700 hover:shadow-primary/10 hover:shadow-lg">
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
                <Image src="/avatars/blue--glove.svg" width={18} height={18} alt="Pro" />
                <span className="font-semibold text-foreground">{topic.left_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{topic.right_count.toLocaleString()}</span>
                <Image src="/avatars/red--glove.svg" width={18} height={18} alt="Con" />
            </div>
        </div>
        
        {/* Footer with time */}
        {topic.vote_remaining_time && (
          <div className="text-center text-sm font-medium text-primary mt-4 pt-3 border-t border-border/50 flex items-center justify-center gap-2">
            <Clock size={14} />
            <span className="truncate">{topic.vote_remaining_time}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
