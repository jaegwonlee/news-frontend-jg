// app/components/TrendingTopics.tsx

"use client";

import { useEffect, useState } from "react";
import { getPopularTopics, getLatestTopics } from "@/lib/api";
import { Eye, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Topic } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

interface TrendingTopicsProps {
  displayMode: 'popular' | 'latest';
}

export default function TrendingTopics({ displayMode }: TrendingTopicsProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let fetchedTopics: Topic[];
        if (displayMode === 'popular') {
          fetchedTopics = await getPopularTopics();
          fetchedTopics.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
          setTopics(fetchedTopics.slice(0, 10));
        } else { // displayMode === 'latest'
          fetchedTopics = await getLatestTopics();
          setTopics(fetchedTopics.slice(0, 10));
        }
      } catch (err) {
        setError("토픽 목록을 불러오는 데 실패했습니다.");
        console.error(err);
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [displayMode]);

  return (
    <>
      <Tooltip id="trending-topic-tooltip" />

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center text-zinc-400">
          로딩 중...
        </div>
      ) : error ? (
        <div className="flex-1 flex justify-center items-center text-red-500">
          {error}
        </div>
      ) : (
        <div className="space-y-3 h-full overflow-y-auto pr-2">
          {topics.length === 0 ? (
            <p className="text-zinc-500 text-center pt-10">표시할 토픽이 없습니다.</p>
          ) : (
            topics.map((topic, index) => {
              const rank = index + 1;
              const isPopular = displayMode === 'popular';

              // Define styles for top ranks
              const rankColors = [
                "text-yellow-400", // 1st
                "text-slate-300",  // 2nd
                "text-amber-600"   // 3rd
              ];
              const rankColor = isPopular && rank <= 3 ? rankColors[index] : "text-zinc-400";
              const rankGlow = isPopular && rank <= 3 ? `hover:shadow-[0_0_15px_2px_${rank === 1 ? 'rgba(250,204,21,0.4)' : rank === 2 ? 'rgba(203,213,225,0.4)' : 'rgba(217,119,6,0.4)'}]` : 'hover:shadow-blue-500/20';

              return (
                <Link
                  href={`/debate/${topic.id}`}
                  key={topic.id}
                  className={`group relative block bg-gradient-to-br from-zinc-900 to-zinc-800 p-4 rounded-lg border border-zinc-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:border-blue-500/50 hover:from-zinc-800 hover:to-zinc-700 ${rankGlow}`}
                  data-tooltip-id="trending-topic-tooltip"
                  data-tooltip-content={topic.display_name}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank or Bullet */}
                    <div className="flex-shrink-0 w-6 text-center">
                      {isPopular ? (
                        <span className={`font-bold text-lg ${rankColor} transition-colors`}>{rank}</span>
                      ) : (
                        <span className="text-blue-400 font-bold">•</span>
                      )}
                    </div>

                    {/* Topic Name and Metadata */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-400 truncate group-hover:from-white group-hover:to-zinc-300 transition-colors">
                        {topic.display_name}
                      </h4>
                      {/* Repositioned and Reordered Metadata */}
                      <div className="flex justify-end items-center gap-3 mt-1 text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                          <span>{formatRelativeTime(topic.published_at)}</span>
                        </div>
                        <span className="text-zinc-600">·</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{topic.view_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </>
  );
}
