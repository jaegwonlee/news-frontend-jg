"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const ViewAllLink = ({ href }: { href: string }) => (
  <Link href={href} className="text-sm text-zinc-400 hover:text-red-500 transition-colors">
    전체보기
  </Link>
);

import { Briefcase, Flame, Landmark, MessageCircle, Newspaper, Palette, Users } from "lucide-react";
import CategoryNewsSection from "./components/CategoryNewsSection";
import ChatRoom from "./components/ChatRoom";
import ContentSection from "./components/common/ContentSection";
import LatestNews from "./components/LatestNews";
import TrendingTopics from "./components/TrendingTopics";

import { getCategoryNews } from "@/lib/api";
import { Article } from "@/types";

export default function Home() {
  const [politicsNews, setPoliticsNews] = useState<Article[]>([]);
  const [economyNews, setEconomyNews] = useState<Article[]>([]);
  const [socialNews, setSocialNews] = useState<Article[]>([]);
  const [cultureNews, setCultureNews] = useState<Article[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topicTab, setTopicTab] = useState<"popular" | "latest">("popular");

  useEffect(() => {
    const fetchAllNews = async () => {
      setIsLoading(true);
      const categories = ["정치", "경제", "사회", "문화"];
      const newsPromises = categories.map((category) =>
        getCategoryNews(category, 6).catch((err) => {
          console.error(`메인 페이지 서버 렌더링 중 ${category} 뉴스 로드 실패:`, err);
          return [];
        })
      );

      const [politics, economy, social, culture] = await Promise.all(newsPromises);
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

    fetchAllNews();
  }, []);

  return (
    <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
      <main className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <ContentSection
            title="토픽"
            icon={<Flame />}
            className="xl:col-span-1"
            action={
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
            }
          >
            <TrendingTopics displayMode={topicTab} />
          </ContentSection>

          <ContentSection title="ROUND1" icon={<MessageCircle />} className="md:col-span-2 xl:col-span-2">
            <ChatRoom topicId={1} />
          </ContentSection>

          <ContentSection
            title="최신 뉴스"
            icon={<Newspaper />}
            className="xl:col-span-1"
            action={<ViewAllLink href="/latest-news" />}
          >
            {isLoading ? <div>로딩 중...</div> : <LatestNews articles={latestNews} />}
          </ContentSection>
        </div>

        <ContentSection title="정치" icon={<Landmark />} action={<ViewAllLink href="/politics" />}>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : (
            <CategoryNewsSection categoryName="정치" articles={politicsNews.slice(0, 5)} />
          )}
        </ContentSection>

        <ContentSection title="경제" icon={<Briefcase />} action={<ViewAllLink href="/economy" />}>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : (
            <CategoryNewsSection categoryName="경제" articles={economyNews.slice(0, 5)} />
          )}
        </ContentSection>

        <ContentSection title="사회" icon={<Users />} action={<ViewAllLink href="/social" />}>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : (
            <CategoryNewsSection categoryName="사회" articles={socialNews.slice(0, 5)} />
          )}
        </ContentSection>

        <ContentSection title="문화" icon={<Palette />} action={<ViewAllLink href="/culture" />}>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : (
            <CategoryNewsSection categoryName="문화" articles={cultureNews.slice(0, 5)} />
          )}
        </ContentSection>
      </main>
    </div>
  );
}
