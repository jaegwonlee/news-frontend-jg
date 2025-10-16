// src/app/page.tsx

import DebateRoomList from "@/components/main/DebateRoomList";
import NewsTabSection from "@/components/main/NewsTabSection";
import MediaNewsList from "@/components/news/MediaNewsList";
import { allDebateRooms, exclusiveNews, flashNews } from "@/lib/mock-data";
import Link from "next/link";

// Mock data for the new media section
const mediaCompanies = [
  {
    name: "조선일보",
    articles: Array.from({ length: 5 }).map((_, i) => ({
      title: `조선일보 최신뉴스 제목 ${i + 1}`,
      link: "#",
    })),
  },
  {
    name: "중앙일보",
    articles: Array.from({ length: 5 }).map((_, i) => ({
      title: `중앙일보 최신뉴스 제목 ${i + 1}`,
      link: "#",
    })),
  },
  {
    name: "동아일보",
    articles: Array.from({ length: 5 }).map((_, i) => ({
      title: `동아일보 최신뉴스 제목 ${i + 1}`,
      link: "#",
    })),
  },
  {
    name: "한겨레",
    articles: Array.from({ length: 5 }).map((_, i) => ({
      title: `한겨레 최신뉴스 제목 ${i + 1}`,
      link: "#",
    })),
  },
  {
    name: "오마이뉴스",
    articles: Array.from({ length: 5 }).map((_, i) => ({
      title: `오마이뉴스 최신뉴스 제목 ${i + 1}`,
      link: "#",
    })),
  },
  {
    name: "경향신문",
    articles: Array.from({ length: 5 }).map((_, i) => ({
      title: `경향신문 최신뉴스 제목 ${i + 1}`,
      link: "#",
    })),
  },
];

export default async function Home() {
  // Get Top 10 Debate Rooms by sorting and slicing
  const top10DebateRooms = [...allDebateRooms].sort((a, b) => b.participants - a.participants).slice(0, 10);

  return (
    <div className="container mx-auto px-4 mt-8">
      <section id="news-section" className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Column 1: Top 10 Debate Rooms */}
              <section className="flex flex-col h-[calc(36rem+44px)]">
                <div className="flex justify-between items-center border-b-4 border-red-500 pb-2 mb-4">
                  <h2 className="text-xl font-bold">TOP 10 논쟁방</h2>
                  {/*
                    이 부분이 a 태그에서 Link 태그로 수정되었습니다.
                  */}
                  <Link href="/debate" className="text-sm text-neutral-400 hover:text-white">
                    전체보기
                  </Link>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                  <DebateRoomList rooms={top10DebateRooms} />
                </div>
              </section>

              {/* Column 2: Round 1 Chat */}
              <section className="flex flex-col h-[calc(36rem+44px)]">
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
              <section className="flex flex-col h-[calc(36rem+44px)]">
                <NewsTabSection exclusiveNews={exclusiveNews} flashNews={flashNews} />
              </section>
            </div>
          </div>
        </div>
      </section>

      <section id="media-news-section" className="my-16">
        <h2 className="text-3xl font-bold text-center mb-8">언론사별 최신뉴스</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaCompanies.map((media) => (
            <MediaNewsList key={media.name} mediaName={media.name} articles={media.articles} />
          ))}
        </div>
      </section>
    </div>
  );
}
