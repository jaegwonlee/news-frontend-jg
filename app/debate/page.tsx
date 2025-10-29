import { getLatestTopics } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { Eye, MessageSquarePlus } from "lucide-react";
import Link from "next/link";

/**
 * 논쟁 페이지 (경로: /debate)
 * - API에서 토픽 목록을 가져와 토론 방 형태로 보여줍니다.
 */
export default async function DebatePage() {
  const topics = await getLatestTopics();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">논쟁 토픽</h1>

      </div>

      {/* 토픽 목록 */}
      <div className="space-y-6">
        {topics.map((topic) => (
          <Link
            href={`/debate/${topic.id}`}
            key={topic.id}
            className="block p-6 bg-zinc-900 rounded-lg shadow-md hover:bg-zinc-800 transition-colors duration-300"
          >
            <div className="flex flex-col h-full">
              <h2 className="text-2xl font-bold text-red-500 mb-3">{topic.display_name}</h2>
              <p className="text-zinc-300 mb-4 flex-grow">{topic.summary}</p>
              <div className="flex justify-between items-center text-sm text-zinc-500 mt-auto">
                <time dateTime={topic.published_at}>{formatRelativeTime(topic.published_at)}</time>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{topic.view_count}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}