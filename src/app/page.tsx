import DebateRoomList from "@/components/DebateRoomList";
import Link from "next/link";
import CategoryNewsSection from "@/components/CategoryNewsSection";
import { getCategoryNews, getTopics, getLatestNews } from "@/lib/api";
import ChatRoom from "@/components/common/ChatRoom";
import LatestNewsSection from "@/components/LatestNewsSection";

export default async function Home() {
  const [latestNews, politicsNewsData, economyNewsData, societyNewsData, cultureNewsData, topics] = await Promise.all([
    getLatestNews(10),
    getCategoryNews("정치"),
    getCategoryNews("경제"),
    getCategoryNews("사회"),
    getCategoryNews("문화"),
    getTopics(),
  ]);

  // Get Top 10 latest Debate Rooms
  const top10DebateRooms = topics
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 10)
    .map(topic => ({
      id: String(topic.id),
      title: topic.display_name,
      // The API for topics doesn't provide participant or comment counts, so we use 0 as a placeholder.
      participants: 0,
    }));

  return (
    <>
      <div className="container mx-auto px-4 mt-8">
      <section id="news-section" className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Column 1: Top 10 Debate Rooms */}
              <section className="md:col-span-1 flex flex-col h-[calc(36rem+44px)]">
                <div className="flex justify-between items-center border-b-4 border-red-500 pb-2 mb-4">
                  <h2 className="text-xl font-bold">TOP 10 논쟁방</h2>
                  <Link href="/debate" className="text-sm text-neutral-400 hover:text-white">
                    전체보기
                  </Link>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 hide-scrollbar bg-neutral-800 rounded-md p-4">
                  <DebateRoomList rooms={top10DebateRooms} />
                </div>
              </section>

              {/* Column 2: Round 1 Chat */}
              <section className="md:col-span-2 flex flex-col h-[calc(36rem+44px)]">
                <ChatRoom title="ROUND 1" roomId="round1" />
              </section>

              {/* Column 3: Latest News */}
              <section className="md:col-span-1 flex flex-col h-[calc(36rem+44px)]">
                <LatestNewsSection articles={latestNews} />
              </section>
            </div>
          </div>
        </div>
      </section>



      {/* Ad Banner */}
      <section className="mb-16">
        <div className="w-full h-24 bg-neutral-800 rounded-lg flex items-center justify-center">
          <p className="text-white text-lg font-bold">광고 배너</p>
        </div>
      </section>

      {/* Politics News Section */}
      <CategoryNewsSection title="정치" articles={politicsNewsData} linkUrl="/politics" />

      {/* Economy News Section */}
      <CategoryNewsSection title="경제" articles={economyNewsData} linkUrl="/economy" />

      {/* Society News Section */}
      <CategoryNewsSection title="사회" articles={societyNewsData} linkUrl="/society" />

      {/* Culture News Section */}
      <CategoryNewsSection title="문화" articles={cultureNewsData} linkUrl="/culture" />
      </div>
    </>
  );
}
