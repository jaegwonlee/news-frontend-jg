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

export default function Home() {
  return (
    <div className="w-full max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
      <main className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <ContentSection title="인기 토픽" icon={<Flame />} className="xl:col-span-1">
            <TrendingTopics />
          </ContentSection>

          <ContentSection title="ROUND1" icon={<MessageCircle />} className="md:col-span-2 xl:col-span-1">
            <ChatRoom />
          </ContentSection>

          <ContentSection title="최신 뉴스" icon={<Newspaper />} className="xl:col-span-1">
            <LatestNews />
          </ContentSection>
        </div>

        <ContentSection title="정치" icon={<Landmark />} action={<ViewAllLink href="/politics" />}>
          <CategoryNewsSection categoryName="정치" />
        </ContentSection>

        <ContentSection title="경제" icon={<Briefcase />} action={<ViewAllLink href="/economy" />}>
          <CategoryNewsSection categoryName="경제" />
        </ContentSection>

        <ContentSection title="사회" icon={<Users />} action={<ViewAllLink href="/social" />}>
          <CategoryNewsSection categoryName="사회" />
        </ContentSection>

        <ContentSection title="문화" icon={<Palette />} action={<ViewAllLink href="/culture" />}>
          <CategoryNewsSection categoryName="문화" />
        </ContentSection>
      </main>
    </div>
  );
}