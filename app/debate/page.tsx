import { getLatestTopics } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { Eye, MessageSquarePlus } from "lucide-react";
import Link from "next/link";

export default async function DebatePage() {
  const topics = await getLatestTopics();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">토픽 리스트</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Link
            href={`/debate/${topic.id}`}
            key={topic.id}
            className="flex flex-col p-6 bg-zinc-800/50 rounded-xl shadow-lg hover:bg-zinc-700/50 hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 h-64"
          >
            <h2 className="text-xl font-bold text-red-500 mb-3 line-clamp-2">{topic.display_name}</h2>
            <p className="text-zinc-300 mb-4 flex-grow text-sm line-clamp-3">{topic.summary}</p>
            <div className="flex justify-between items-center text-sm text-zinc-500 mt-auto">
              <time dateTime={topic.published_at}>{formatRelativeTime(topic.published_at)}</time>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{topic.view_count}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
