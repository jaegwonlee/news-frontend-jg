export const dynamic = "force-dynamic";
import { getBreakingNews, getCategoryNews, getExclusiveNews } from "@/lib/api/articles";
import { getLatestTopics, getPopularTopics, getTopicDetail } from "@/lib/api/topics";
import { Article, Topic, TopicDetail } from "@/types";
import MainGrid from "./components/MainGrid";
import CultureSection from "./components/sections/CultureSection";
import EconomySection from "./components/sections/EconomySection";
import PoliticsSection from "./components/sections/PoliticsSection";
import SocialSection from "./components/sections/SocialSection";
import SportsSection from "./components/sections/SportsSection";

export default async function Home() {
  const topicDetailPromise = getTopicDetail("1").catch((err) => {
    console.error("메인 페이지 토픽 로드 실패:", err);
    return null;
  });

  const categories = ["정치", "경제", "사회", "문화", "스포츠"];
  // Fetch ALL articles for each category
  const newsPromises = categories.map((category) =>
    getCategoryNews(category).catch((err) => { // No limit
      console.error(`메인 페이지 서버 렌더링 중 ${category} 뉴스 로드 실패:`, err);
      return [];
    })
  );

  const [
    topicDetail,
    rawPoliticsNews,
    rawEconomyNews,
    rawSocialNews,
    rawCultureNews,
    rawSportsNews,
    breakingNews,
    exclusiveNews,
    popularTopics,
    latestTopics,
  ] = (await Promise.all([
    topicDetailPromise,
    ...newsPromises,
    getBreakingNews(),
    getExclusiveNews(),
    getPopularTopics().catch((err) => {
      console.error("인기 토픽 로드 실패:", err);
      return [];
    }),
    getLatestTopics().catch((err) => {
      console.error("최신 토픽 로드 실패:", err);
      return [];
    }),
  ])) as [
    TopicDetail | null,
    Article[],
    Article[],
    Article[],
    Article[],
    Article[],
    Article[],
    Article[],
    Topic[],
    Topic[]
  ];

  // Filter articles to include only those from the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const filterByDate = (articles: Article[]) => articles.filter(a => new Date(a.published_at) > sevenDaysAgo);

  const politicsNews = filterByDate(rawPoliticsNews);
  const economyNews = filterByDate(rawEconomyNews);
  const socialNews = filterByDate(rawSocialNews);
  const cultureNews = filterByDate(rawCultureNews);
  const sportsNews = filterByDate(rawSportsNews);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-12">
        <MainGrid
          mainTopic={topicDetail?.topic}
          popularTopics={popularTopics}
          latestTopics={latestTopics}
        />

        {politicsNews.length > 0 && <PoliticsSection articles={politicsNews} />}
        {economyNews.length > 0 && <EconomySection articles={economyNews} />}
        {socialNews.length > 0 && <SocialSection articles={socialNews} />}
        {cultureNews.length > 0 && <CultureSection articles={cultureNews} />}
        {sportsNews.length > 0 && <SportsSection articles={sportsNews} />}
      </div>
    </main>
  );
}
