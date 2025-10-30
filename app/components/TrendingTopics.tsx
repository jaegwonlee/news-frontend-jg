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
export default function TrendingTopics({ className }: { className?: string }) {
  // 👇 5. 상태 변수들 선언
  const [activeTab, setActiveTab] = useState<'popular' | 'latest'>('popular'); // 현재 활성화된 탭 ('popular' 또는 'latest')
  const [topics, setTopics] = useState<Topic[]>([]); // 표시될 토픽 목록
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태

  // 👇 6. useEffect: activeTab이 변경될 때마다 적절한 API 호출
  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let fetchedTopics: Topic[];
        if (activeTab === 'popular') {
          fetchedTopics = await getPopularTopics();
          // 인기 토픽은 조회수(view_count) 순으로 정렬
          fetchedTopics.sort((a, b) => b.view_count - a.view_count);
        } else { // activeTab === 'latest'
          fetchedTopics = await getLatestTopics();
          // 최신 토픽은 API에서 이미 최신순으로 제공 (별도 정렬 불필요)
        }
        // 상위 10개만 표시
        setTopics(fetchedTopics.slice(0, 10));
      } catch (err) {
        setError("토픽 목록을 불러오는 데 실패했습니다.");
        console.error(err);
        setTopics([]); // 에러 발생 시 목록 비우기
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [activeTab]); // activeTab이 변경될 때마다 이 effect 실행

  return (
    <aside className={`bg-zinc-900 p-4 rounded-lg h-full flex flex-col ${className}`}>
      <Tooltip id="trending-topic-tooltip" />
      {/* 👇 7. 탭 버튼 UI 추가 */}
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

      {/* 👇 8. 로딩 및 에러 처리 UI */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center text-zinc-400">
          로딩 중...
        </div>
      ) : error ? (
        <div className="flex-1 flex justify-center items-center text-red-500">
          {error}
        </div>
      ) : (
        // 👇 9. 토픽 목록 렌더링 (topics 상태 사용)
        <ol className="space-y-4 flex-1 overflow-y-auto p-2 border border-zinc-700 rounded-md">
          {topics.length === 0 ? (
            <p className="text-zinc-500 text-center pt-10">표시할 토픽이 없습니다.</p>
          ) : (
            topics.map((topic, index) => (
              <li key={topic.id} className={`bg-zinc-800 p-3 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors ${activeTab === 'popular' && index === 0 ? 'animate-glow-border' : activeTab === 'popular' && index === 1 ? 'animate-glow-border-2nd' : activeTab === 'popular' && index === 2 ? 'animate-glow-border-3rd' : ''}`}>
                <Link
                  href={`/debate/${topic.id}`}
                  className="flex items-center gap-3"
                >
                  {/* 인기 토픽 탭일 때만 순위 표시 */}
                  {activeTab === 'popular' && (
                     <span
                      className={`font-bold w-5 text-center shrink-0 ${
                        index === 0 ? "text-red-500 text-3xl" : // 1st place: larger text, red
                        index === 1 ? "text-orange-400 text-2xl" : // 2nd place: slightly smaller, orange
                        index === 2 ? "text-yellow-300 text-xl" : // 3rd place: even smaller, yellow
                        "text-zinc-400 text-lg" // Others: default size, gray
                      }`}
                     >
                      {index + 1}
                     </span>
                  )}
                  {/* 최신 토픽 탭일 때는 순위 대신 점 표시 (선택 사항) */}
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
                    {activeTab === 'latest' && (
                      <div className="text-xs text-zinc-500 mt-1">
                        {formatRelativeTime(topic.published_at)}
                      </div>
                    )}
                  </span>
                  {/* 조회수 표시는 유지 (최신 토픽도 조회수 보여줌) */}
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
    </aside>
  );
}