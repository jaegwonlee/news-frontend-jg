// src/app/page.tsx

import DebateRoomList from "@/components/main/DebateRoomList";
import NewsTabSection from "@/components/main/NewsTabSection";
import { allDebateRooms, economyNews, politicsNews } from "@/lib/mock-data";
import Link from "next/link";
import CategoryNewsSection from "@/components/main/CategoryNewsSection";

interface RawNewsArticle {
  id: number;
  url: string;
  title: string;
  source: string;
  source_domain: string;
  published_at: string;
}

async function getExclusiveNews() {
  try {
    const res = await fetch('https://news-buds.onrender.com/api/articles/exclusives?limit=10&offset=0', { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const rawArticles: RawNewsArticle[] = await res.json();
    return rawArticles.map(article => ({
      id: article.id.toString(),
      title: article.title,
      source: article.source,
      url: article.url,
    }));
  } catch (error) {
    console.error("Failed to fetch exclusive news:", error);
    return [];
  }
}

async function getBreakingNews() {
  try {
    const res = await fetch('https://news-buds.onrender.com/api/articles/breaking?limit=10&offset=0', { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const rawArticles: RawNewsArticle[] = await res.json();
    return rawArticles.map(article => ({
      id: article.id.toString(),
      title: article.title,
      source: article.source,
      url: article.url,
    }));
  } catch (error) {
    console.error("Failed to fetch breaking news:", error);
    return [];
  }
}

export default async function Home() {
  // Get Top 10 Debate Rooms by sorting and slicing
  const top10DebateRooms = [...allDebateRooms].sort((a, b) => b.participants - a.participants).slice(0, 10);
  
  const [exclusiveNews, flashNews] = await Promise.all([
    getExclusiveNews(),
    getBreakingNews(),
  ]);

  return (
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
                <div className="flex-grow overflow-y-auto pr-2">
                  <DebateRoomList rooms={top10DebateRooms} />
                </div>
              </section>

              {/* Column 2: Round 1 Chat */}
              <section className="md:col-span-2 flex flex-col h-[calc(36rem+44px)]">
                <h2 className="text-xl font-bold border-b-4 border-red-500 pb-2 mb-4">ROUND 1</h2>
                <div className="flex-grow flex flex-col bg-[#2e2e2e] rounded-md p-4">
                  <div className="flex-grow mb-4 text-center text-neutral-400 text-sm overflow-y-auto">
                    <p className="mt-4">[test]님이 입장했습니다.</p>
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="메시지를 입력하세요."
                      className="w-full p-2 rounded-l-md bg-neutral-700 text-white border border-neutral-600 focus:outline-none focus:border-blue-500"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-md font-bold">
                      전송
                    </button>
                  </div>
                </div>
              </section>

              {/* Column 3: Breaking/Flash News */}
              <section className="md:col-span-1 flex flex-col h-[calc(36rem+44px)]">
                <NewsTabSection exclusiveNews={exclusiveNews} flashNews={flashNews} />
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
      <CategoryNewsSection title="정치" articles={politicsNews} linkUrl="/politics" />

      {/* Economy News Section */}
      <CategoryNewsSection title="경제" articles={economyNews} linkUrl="/economy" />

      {/* Society News Section */}
      <CategoryNewsSection title="사회" articles={politicsNews} linkUrl="/society" />

      {/* Culture News Section */}
      <CategoryNewsSection title="문화" articles={economyNews} linkUrl="/culture" />
    </div>
  );
}