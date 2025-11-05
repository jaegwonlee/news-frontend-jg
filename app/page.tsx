export const dynamic = 'force-dynamic';

import Link from 'next/link';

const ViewAllLink = ({ href }: { href: string }) => (
  <Link href={href} className="text-sm text-zinc-400 hover:text-red-500 transition-colors">
    전체보기
  </Link>
);

import ChatRoom from "./components/ChatRoom";
import LatestNews from "./components/LatestNews";
import TrendingTopics from "./components/TrendingTopics";
import CategoryNewsSection from "./components/CategoryNewsSection";
import ContentSection from "./components/common/ContentSection";
import { Flame, MessageCircle, Newspaper, BarChart, Landmark, Briefcase, Users, Palette } from 'lucide-react';

import { getCategoryNews } from '@/lib/api';
import { Article } from '@/types';

export default async function Home() {
  // 1. Fetch all category news in parallel, with individual error handling.
  const categories = ["정치", "경제", "사회", "문화"];
  const newsPromises = categories.map(category => 
    getCategoryNews(category, 6).catch(err => {
      console.error(`메인 페이지 서버 렌더링 중 ${category} 뉴스 로드 실패:`, err);
      return []; // Return an empty array on failure to prevent Promise.all from failing
    })
  );

  const [politicsNews, economyNews, socialNews, cultureNews] = await Promise.all(newsPromises);

  // 2. Process the fetched data to create the latest news list.
  const allArticles = [...politicsNews, ...economyNews, ...socialNews, ...cultureNews];
  const uniqueArticlesMap = new Map<number, Article>();
  allArticles.forEach((article) => {
    uniqueArticlesMap.set(article.id, article);
  });
  const latestNews = Array.from(uniqueArticlesMap.values())
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 10);

  return (
    <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
      <main className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <ContentSection title="인기 토픽" icon={<Flame />} className="xl:col-span-1">
            <TrendingTopics />
          </ContentSection>

          <ContentSection title="ROUND1" icon={<MessageCircle />} className="md:col-span-2 xl:col-span-2">
            <ChatRoom topicId={1} />
          </ContentSection>

          <ContentSection title="최신 뉴스" icon={<Newspaper />} className="xl:col-span-1" action={<ViewAllLink href="/latest-news" />}>
            <LatestNews articles={latestNews} />
          </ContentSection>
        </div>

        <ContentSection title="정치" icon={<Landmark />} action={<ViewAllLink href="/politics" />}>
          <CategoryNewsSection categoryName="정치" articles={politicsNews.slice(0, 5)} />
        </ContentSection>

        <ContentSection title="경제" icon={<Briefcase />} action={<ViewAllLink href="/economy" />}>
          <CategoryNewsSection categoryName="경제" articles={economyNews.slice(0, 5)} />
        </ContentSection>

        <ContentSection title="사회" icon={<Users />} action={<ViewAllLink href="/social" />}>
          <CategoryNewsSection categoryName="사회" articles={socialNews.slice(0, 5)} />
        </ContentSection>

        <ContentSection title="문화" icon={<Palette />} action={<ViewAllLink href="/culture" />}>
          <CategoryNewsSection categoryName="문화" articles={cultureNews.slice(0, 5)} />
        </ContentSection>
      </main>
    </div>
  );
}