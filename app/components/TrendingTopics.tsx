// app/components/TrendingTopics.tsx

"use client";

import { useEffect, useState } from "react";
import { getPopularTopics, getLatestTopics } from "@/lib/api";
import { Eye } from "lucide-react";
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
        <div className="flex-1 flex justify-center items-center text-zinc-400 h-[576px]">
          로딩 중...
        </div>
      ) : error ? (
        <div className="flex-1 flex justify-center items-center text-red-500 h-[576px]">
          {error}
        </div>
      ) : (
        <ol className="space-y-2 h-full overflow-y-auto pr-2 flex flex-col">
          {topics.length === 0 ? (
            <p className="text-zinc-500 text-center pt-10">표시할 토픽이 없습니다.</p>
          ) : (
            topics.map((topic, index) => (
              <li key={topic.id} className={`flex-1 bg-zinc-800 p-3 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors ${displayMode === 'popular' && index === 0 ? 'animate-glow-border-main' : ''} ${displayMode === 'popular' && index === 1 ? 'animate-glow-border-main-2nd' : ''} ${displayMode === 'popular' && index === 2 ? 'animate-glow-border-main-3rd' : ''}`}>
                <Link
                  href={`/debate/${topic.id}`}
                  className="flex items-center gap-3 h-full"
                >
                  {displayMode === 'popular' && (
                     <span
                      className={`font-bold w-5 text-center shrink-0 ${displayMode === 'popular' && index === 0 ? 'text-red-500' : ''} ${displayMode === 'popular' && index === 1 ? 'text-orange-400' : ''} ${displayMode === 'popular' && index === 2 ? 'text-yellow-300' : ''}`}
                     >
                      {index + 1}
                     </span>
                  )}
                  {displayMode === 'latest' && (
                    <span className="text-zinc-400 w-5 text-center shrink-0">•</span>
                  )}

                  <span className="flex-1 text-base text-white">
                  <div
                    className="line-clamp-1 group-hover:underline"
                    data-tooltip-id="trending-topic-tooltip"
                    data-tooltip-content={topic.display_name}
                  >
                    {topic.display_name}
                  </div>
                  </span>
                  {displayMode === 'latest' && (
                    <div className="flex items-center text-xs text-zinc-500 shrink-0">
                      <span>{formatRelativeTime(topic.published_at)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-zinc-500 shrink-0">
                    <Eye className="w-3 h-3" />
                    <span>{topic.view_count}</span>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ol>
      )}
    </>
  );
}
