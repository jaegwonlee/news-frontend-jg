// app/components/TrendingTopics.tsx

import { getPopularTopics } from "@/lib/api";
import { Eye } from "lucide-react";
import Link from "next/link";

/**
 * 인기 토픽 목록을 보여주는 서버 컴포넌트
 * - API를 통해 인기 토픽 데이터를 가져와 조회수 순으로 정렬하여 표시합니다.
 * - 상위 10개만 표시하도록 수정되었습니다.
 */
export default async function TrendingTopics({ className }: { className?: string }) {
  const topicsFromApi = await getPopularTopics();
  const sortedTopics = topicsFromApi.sort((a, b) => b.view_count - a.view_count);

  // 👇 상위 10개의 토픽만 선택합니다.
  const top10Topics = sortedTopics.slice(0, 10);

  return (
    <aside className={`bg-zinc-900 p-4 rounded-lg h-full flex flex-col ${className}`}> {/* flex flex-col 추가 */}
      <h2 className="text-xl font-bold text-white border-b border-zinc-700 pb-2 mb-4">인기 토픽</h2>
      
      {/* 👇 flex-1 overflow-y-auto 추가하여 스크롤 가능하게 (만약 10개도 길다면) */}
      <ol className="space-y-4 flex-1 overflow-y-auto pr-1"> 
        {/* 👇 top10Topics를 사용하여 map 실행 */}
        {top10Topics.map((topic, index) => (
          <li key={topic.id}>
            <Link
              href={`/debate/${topic.id}`}
              className="flex items-center gap-3 group transition-colors hover:bg-zinc-800 p-1 rounded-md"
            >
              <span
                className={`text-2xl font-bold w-5 text-center ${index < 3 ? "text-red-500" : "text-zinc-400"}`}>
                {index + 1}
              </span>
              <span className="flex-1 text-lg text-white group-hover:underline line-clamp-2"> {/* line-clamp-2 추가 */}
                {topic.display_name}
              </span>
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Eye className="w-3 h-3" />
                <span>{topic.view_count}</span>
              </div>
            </Link>
          </li>
        ))}
        {/* 토픽이 없을 경우 메시지 */}
        {top10Topics.length === 0 && (
          <p className="text-zinc-500 text-center pt-10">인기 토픽이 없습니다.</p>
        )}
      </ol>
    </aside>
  );
}