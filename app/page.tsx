"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategoryNews } from "@/lib/api/articles";
import { getTopicDetail } from "@/lib/api/topics";
import { Article, Topic } from "@/types";
import { Briefcase, Flame, Landmark, MessageCircle, Newspaper, Palette, Users } from "lucide-react";
import ChatRoom from "./components/ChatRoom";
import TrendingTopics from "./components/TrendingTopics";
import LatestNews from "./components/LatestNews";
import LivingNewsWall from "./components/LivingNewsWall";

const ViewAllLink = ({ href }: { href: string }) => (
  <Link href={href} className="text-sm text-zinc-400 hover:text-red-500 transition-colors">
    전체보기
  </Link>
);

export default function Home() {
  const [politicsNews, setPoliticsNews] = useState<Article[]>([]);
  const [economyNews, setEconomyNews] = useState<Article[]>([]);
  const [socialNews, setSocialNews] = useState<Article[]>([]);
  const [cultureNews, setCultureNews] = useState<Article[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [mainTopic, setMainTopic] = useState<Topic | null>(null); // State for the main topic
  const [isLoading, setIsLoading] = useState(true);
  const [topicTab, setTopicTab] = useState<"popular" | "latest">("popular");

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      
      // Fetch Topic for ChatRoom
      const topicDetailPromise = getTopicDetail("1").catch(err => {
        console.error("메인 페이지 토픽 로드 실패:", err);
        return null;
      });

      // Fetch News Categories
      const categories = ["정치", "경제", "사회", "문화"];
      const newsPromises = categories.map((category) =>
        getCategoryNews(category, 10).catch((err) => {
          console.error(`메인 페이지 서버 렌더링 중 ${category} 뉴스 로드 실패:`, err);
          return [];
        })
      );

      const [topicDetail, ...newsResults] = await Promise.all([topicDetailPromise, ...newsPromises]);
      const [politics, economy, social, culture] = newsResults;

      if (topicDetail) {
        setMainTopic(topicDetail.topic);
      }

      setPoliticsNews(politics);
      setEconomyNews(economy);
      setSocialNews(social);
      setCultureNews(culture);

      const allArticles = [...politics, ...economy, ...social, ...culture];
      const uniqueArticlesMap = new Map<number, Article>();
      allArticles.forEach((article) => {
        uniqueArticlesMap.set(article.id, article);
      });
      const processedLatestNews = Array.from(uniqueArticlesMap.values())
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, 10);
      setLatestNews(processedLatestNews);

      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-12 md:px-16 lg:px-20 pt-2 md:pt-3 lg:pt-4">
      <main className="flex flex-col gap-6 lg:gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          <div className="rounded-2xl p-6 xl:col-span-1 flex flex-col h-[665px] lg:h-[807px]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-900/50 shadow-lg shadow-red-500/50">
                  <Flame />
                </div>
                <h2 className="text-xl font-bold text-white">실시간 토픽</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTopicTab("popular")}
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                    topicTab === "popular" ? "bg-red-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                  }`}
                >
                  인기
                </button>
                <button
                  onClick={() => setTopicTab("latest")}
                  className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                    topicTab === "latest" ? "bg-red-600 text-white" : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                  }`}
                >
                  최신
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <TrendingTopics displayMode={topicTab} />
            </div>
          </div>

          <div className="rounded-2xl md:col-span-2 xl:col-span-2 h-[665px] lg:h-[807px] flex flex-col">
            <div className="flex-1 min-h-0">
              <ChatRoom topic={mainTopic || undefined} />
            </div>
          </div>

          <div className="rounded-2xl p-6 xl:col-span-1 flex flex-col h-[665px] lg:h-[807px]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-700/50 shadow-lg shadow-zinc-500/50">
                  <Newspaper />
                </div>
                <h2 className="text-xl font-bold text-white">최신 뉴스</h2>
              </div>
              <div className="px-3 py-1.5 border border-zinc-700 rounded-full text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-700 hover:border-zinc-600 hover:text-white">
                <ViewAllLink href="/latest-news" />
              </div>
            </div>
            <div className="flex-1 min-h-0">
              {isLoading ? <div className="text-center pt-10">로딩 중...</div> : <LatestNews articles={latestNews} />}
            </div>
          </div>
        </div>

        <LivingNewsWall 
          category="정치" 
          icon={<Landmark />} 
          articles={politicsNews} 
          href="/politics" 
        />
        <LivingNewsWall 
          category="경제" 
          icon={<Briefcase />} 
          articles={economyNews} 
          href="/economy" 
        />
        <LivingNewsWall 
          category="사회" 
          icon={<Users />} 
          articles={socialNews} 
          href="/social" 
        />
        <LivingNewsWall 
          category="문화" 
          icon={<Palette />} 
          articles={cultureNews} 
          href="/culture" 
        />
      </main>
    </div>
  );
}