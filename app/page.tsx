export const dynamic = 'force-dynamic';
import { getCategoryNews } from "@/lib/api/articles";
import { getTopicDetail } from "@/lib/api/topics";
import { Article } from "@/types";
import { Briefcase, Landmark, Palette, Users } from "lucide-react";
import LivingNewsWall from "./components/LivingNewsWall";
import MainGrid from "./components/MainGrid"; // Import the new client component

// This is now a Server Component
export default async function Home() {
  // Fetch all data on the server
  const topicDetailPromise = getTopicDetail("1").catch(err => {
    console.error("메인 페이지 토픽 로드 실패:", err);
    return null;
  });

  const categories = ["정치", "경제", "사회", "문화"];
  const newsPromises = categories.map((category) =>
    getCategoryNews(category, 10).catch((err) => {
      console.error(`메인 페이지 서버 렌더링 중 ${category} 뉴스 로드 실패:`, err);
      return [];
    })
  );

  const [topicDetail, politicsNews, economyNews, socialNews, cultureNews] = await Promise.all([
    topicDetailPromise,
    ...newsPromises
  ]);

  const mainTopic = topicDetail ? topicDetail.topic : undefined;

  // Calculate latestNews on the server
  const allArticles = [...politicsNews, ...economyNews, ...socialNews, ...cultureNews];
  const uniqueArticlesMap = new Map<number, Article>();
  allArticles.forEach((article) => {
    uniqueArticlesMap.set(article.id, article);
  });
  const latestNews = Array.from(uniqueArticlesMap.values())
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 10);

  return (
    <div className="w-full max-w-[1920px] mx-auto px-16 md:px-24 lg:px-32 pt-2 md:pt-3 lg:pt-4">
      <main className="flex flex-col gap-6 lg:gap-8">
        {/* Render the client component with data as props */}
        <MainGrid 
          mainTopic={mainTopic} 
          latestNews={latestNews}
          isLoading={false} // Data is pre-fetched, so isLoading is false
        />

        {/* These components are simple enough to not need to be client components */}
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
