import { getLatestNews } from "@/lib/api";
import NewsCard from "@/components/news/NewsCard";

export default async function LatestNewsPage() {
  const latestNews = await getLatestNews(100); // Fetch 100 latest articles

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="border-b-4 border-red-500 pb-4 mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">최신 뉴스</h1>
        <p className="text-lg text-neutral-400 mt-2">카테고리 구분 없이 가장 새로운 전체 기사입니다.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {latestNews.map(article => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
