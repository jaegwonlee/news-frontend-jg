// app/components/TrendingTopics.tsx

"use client"; // 👈 1. 클라이언트 컴포넌트로 전환

import { useEffect, useState } from "react"; // 👈 2. 훅 임포트
// 👇 3. getLatestTopics 임포트 추가
import { getPopularTopics, getLatestTopics } from "@/lib/api";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Topic } from "@/types"; // 👈 4. Topic 타입 임포트 (경로 확인 필요)
import { formatRelativeTime } from "@/lib/utils";
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'


/**
 * [수정] 인기 토픽 및 최신 토픽 목록을 탭으로 보여주는 클라이언트 컴포넌트
 */
export default function TrendingTopics() {
  const [activeTab, setActiveTab] = useState<'popular' | 'latest'>('popular');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let fetchedTopics: Topic[];
        if (activeTab === 'popular') {
          fetchedTopics = await getPopularTopics();
          fetchedTopics.sort((a, b) => b.view_count - a.view_count);
          setTopics(fetchedTopics.slice(0, 10));
        } else {
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
  }, [activeTab]);

  return (
    <>
      <Tooltip id="trending-topic-tooltip" />
      {/* Tabs */}
      <div className="flex border-b border-zinc-700 mb-4">
        <button
          onClick={() => setActiveTab('popular')}
          className={`flex-1 py-2 text-center text-sm font-semibold transition-colors ${
            activeTab === 'popular'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          인기 토픽
        </button>
        <button
          onClick={() => setActiveTab('latest')}
          className={`flex-1 py-2 text-center text-sm font-semibold transition-colors ${
            activeTab === 'latest'
              ? 'text-red-500 border-b-2 border-red-500'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          최신 토픽
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center text-zinc-400 h-[576px]">
          로딩 중...
        </div>
      ) : error ? (
        <div className="flex-1 flex justify-center items-center text-red-500 h-[576px]">
          {error}
        </div>
      ) : (
        <ol className="space-y-2 h-[576px] overflow-y-auto pr-2">
          {topics.length === 0 ? (
            <p className="text-zinc-500 text-center pt-10">표시할 토픽이 없습니다.</p>
          ) : (
            topics.map((topic, index) => (
              <li key={topic.id} className={`bg-zinc-800 p-3 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors ${activeTab === 'popular' && index === 0 ? 'animate-glow-border' : ''} ${activeTab === 'popular' && index === 1 ? 'animate-glow-border-2nd' : ''} ${activeTab === 'popular' && index === 2 ? 'animate-glow-border-3rd' : ''}`}>
                <Link
                  href={`/debate/${topic.id}`}
                  className="flex items-center gap-3"
                >
                  {activeTab === 'popular' && (
                     <span
                      className={`font-bold w-5 text-center shrink-0 ${activeTab === 'popular' && index === 0 ? 'text-red-500' : ''} ${activeTab === 'popular' && index === 1 ? 'text-orange-400' : ''} ${activeTab === 'popular' && index === 2 ? 'text-yellow-300' : ''}`}
                     >
                      {index + 1}
                     </span>
                  )}
                  {activeTab === 'latest' && (
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
                  {activeTab === 'latest' && (
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