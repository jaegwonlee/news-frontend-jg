import NewsCard from '@/components/NewsCard';
import Round2Section from '@/components/round2/Round2Section';
import { Article } from '@/types/article';

export default async function Home() {
  // Mock data for "최신 뉴스"
  const newsData: Article[] = Array.from({ length: 10 }).map((_, i) => ({
    imageUrl: "/placeholder-image.png",
    title: `최신 뉴스 제목 ${i + 1}`,
    description: `최신 뉴스 설명입니다. ${i + 1}`,
    source: `출처 ${i + 1}`,
    date: `2025. 10. 14.`,
  }));

  // Mock data for "인기 뉴스" as API is not specified
  const popularNewsData: Article[] = Array.from({ length: 10 }).map((_, i) => ({
    imageUrl: "/placeholder-image.png",
    title: `인기 뉴스 제목 ${i + 1}`,
    description: `인기 뉴스 설명입니다. ${i + 1}`,
    source: `출처 ${i + 1}`,
    date: `2025. 10. 14.`,
  }));


  return (
    <div className="container mx-auto px-4 mt-8">
      <section id="news-section" className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <section className="flex flex-col">
                <h2 className="text-xl font-bold border-b-4 border-red-500 pb-2 mb-4">최신 뉴스</h2>
                <div className="h-96 overflow-y-auto pr-2">
                  {newsData.map((article, index) => (
                    <NewsCard key={index} article={article} />
                  ))}
                </div>
              </section>
              <section className="flex flex-col">
                <h2 className="text-xl font-bold border-b-4 border-red-500 pb-2 mb-4">뉴스톡</h2>
                <div className="flex-grow flex flex-col bg-[#2e2e2e] rounded-md p-4">
                  <div className="flex-grow mb-4 text-center text-neutral-400 text-sm">
                    <p className="mt-4">[test]님이 입장했습니다.</p>
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="메시지를 입력하세요."
                      className="w-full p-2 rounded-l-md bg-neutral-700 text-white border border-neutral-600 focus:outline-none focus:border-blue-500"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-md font-bold">전송</button>
                  </div>
                </div>
              </section>
              <section className="flex flex-col">
                <h2 className="text-xl font-bold border-b-4 border-red-500 pb-2 mb-4">인기 뉴스</h2>
                <div className="h-96 overflow-y-auto pr-2">
                  {popularNewsData.map((article, index) => (
                    <NewsCard key={index} article={article} />
                  ))}
                </div>
              </section>
            </div>
          </div>
          <Round2Section />
        </div>
      </section>

      <section id="new-section" className="my-16">
        <h2 className="text-3xl font-bold text-center mb-8">새로운 섹션</h2>
        <div className="h-96 bg-[#2e2e2e] rounded-lg flex items-center justify-center">
          <p className="text-neutral-500 text-2xl">여기에 새로운 기능이 추가될 예정입니다.</p>
        </div>
      </section>
    </div>
  );
}
