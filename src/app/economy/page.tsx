import NewsCard from '@/components/NewsCard';

const newsData = Array.from({ length: 10 }).map((_, i) => ({
  imageUrl: "/placeholder-image.png",
  title: `경제 뉴스 제목 ${i + 1}`,
  description: `경제 뉴스 설명입니다. ${i + 1}`,
  source: `출처 ${i + 1}`,
  date: `2025. 10. 14.`,
}));

export default function EconomyPage() {
  return (
    <div className="container mx-auto px-4 mt-8">
      <h1 className="text-3xl font-bold mb-8">경제</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsData.map((article, index) => (
          <NewsCard key={index} article={article} />
        ))}
      </div>
    </div>
  );
}
