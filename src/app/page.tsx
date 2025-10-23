import CategoryNewsSection from "@/components/CategoryNewsSection";
import ChatRoom from "@/components/common/ChatRoom";
import LatestNewsSection from "@/components/LatestNewsSection";
import PopularTopics from "@/components/PopularTopics";
import { getCategoryNews, getLatestNews, getTopicById } from "@/lib/api";

export default async function Home() {
  const [latestNews, politicsNewsData, economyNewsData, societyNewsData, cultureNewsData, topicData] = await Promise.all([
    getLatestNews(10),
    getCategoryNews("정치"),
    getCategoryNews("경제"),
    getCategoryNews("사회"),
    getCategoryNews("문화"),
    getTopicById(1),
  ]);

  const chatRoomTitle = topicData?.topic?.display_name || "메인 토론방";
  const chatRoomId = topicData?.topic?.id ? String(topicData.topic.id) : "main-room";

  return (
    <>
      <div className="container mx-auto px-4 mt-8">
        <section id="news-section" className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Column 1: Popular Topics */}
                <section className="md:col-span-1 flex flex-col h-[calc(36rem+44px)]">
                  <PopularTopics />
                </section>
                {/* Column 2: Round 1 Chat */}
                <section className="md:col-span-2 flex flex-col h-[calc(36rem+44px)]">
                  <ChatRoom title={chatRoomTitle} roomId={chatRoomId} />
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
          <div className="w-full h-24 bg-neutral-200 rounded-lg flex items-center justify-center dark:bg-neutral-800">
            <p className="text-lg font-bold text-neutral-900 dark:text-white">광고 배너</p>
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
