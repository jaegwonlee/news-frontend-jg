export const dynamic = "force-dynamic";
import { getTrendingKeywords } from "@/lib/api/keywords";
import { getLatestTopics, getPopularTopics, getTopicDetail } from "@/lib/api/topics";
import { Article } from "@/lib/types/article";
import { Topic, TrendingKeyword } from "@/lib/types/topic";
import MainGrid from "./components/MainGrid";

// Helper function to create mock data
const createMockArticle = (id: number, title: string, category: '속보' | '단독'): Article => ({
    id,
    source: "동아일보",
    source_domain: "donga.com",
    side: "RIGHT",
    title: `${"["+category+"]"} ${title} ${id}`,
    url: "https://www.donga.com/news/Politics/article/all/20251208/132917212/1",
    published_at: new Date().toISOString(),
    view_count: id * 100,
    created_at: new Date().toISOString(),
    category: "정치",
    thumbnail_url: `https://picsum.photos/seed/${id}/400/300`,
    description: "‘남자가 군대 가니 여자도 군대 가’라는 식으로 여성 징병제 문제를 풀 수는 없다.”원민경 성평등가족부 장관은 5일 본보 인터뷰에서 여성 징병제와 군 가산점을 시행해야 한다는 일각의 목소리에 대해 “사회에서 취업 이후의 모든 삶에 있어서 여성에게 평등한 기회와 일터, 안전한 사회가 보장이 되는지 봐야 한다”고 말했다.",
});

const mockBreakingNews: Article[] = Array.from({ length: 5 }, (_, i) => createMockArticle(i + 1, "남자 군대가니 여자도 가라는 식으로 여성 징병제 문제 못 풀어", '속보'));
const mockExclusiveNews: Article[] = Array.from({ length: 5 }, (_, i) => createMockArticle(i + 6, "반도체 클러스터, 이번엔 용수 공급에 발목 잡히나", '단독'));


export default async function Home() {
  const [topicDetail, popularTopics, latestTopics, trendingKeywords, breakingNews, exclusiveNews] = await Promise.all([
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
    }),
    Promise.resolve(mockBreakingNews),
    Promise.resolve(mockExclusiveNews),
  ]);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-12">
        <MainGrid
          mainTopic={topicDetail?.topic}
          popularTopics={popularTopics as Topic[]}
          latestTopics={latestTopics as Topic[]}
          trendingKeywords={trendingKeywords as TrendingKeyword[]}
          breakingNews={breakingNews as Article[]}
          exclusiveNews={exclusiveNews as Article[]}
        />
      </div>
    </main>
  );
}
