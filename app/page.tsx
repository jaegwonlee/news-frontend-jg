export const dynamic = "force-dynamic";
import { getTrendingKeywords } from "@/lib/api/keywords";
import { getPopularTopics, getLatestTopics, getTopicDetail } from "@/lib/api/topics";
import { Topic, TrendingKeyword } from "@/lib/types/topic";
import MainGrid from "./components/MainGrid";


export default async function Home() {
  const [topicDetail, popularTopics, latestTopics, trendingKeywords] = await Promise.all([
    getTopicDetail("1").catch((err) => {
      console.error("메인 페이지 토픽 로드 실패:", err);
      return null;
    }),
    getPopularTopics().catch((err) => {
      console.error("인기 토픽 로드 실패:", err);
      return [];
    }),
    getLatestTopics().catch((err) => {
      console.error("최신 토픽 로드 실패:", err);
      return [];
    }),
    getTrendingKeywords().catch((err) => {
      console.error("인기 키워드 로드 실패:", err);
      return [];
    })
  ]);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="space-y-12">
        <MainGrid
          mainTopic={topicDetail?.topic}
          popularTopics={popularTopics as Topic[]}
          latestTopics={latestTopics as Topic[]}
          trendingKeywords={trendingKeywords as TrendingKeyword[]}
        />
      </div>
    </main>
  );
}