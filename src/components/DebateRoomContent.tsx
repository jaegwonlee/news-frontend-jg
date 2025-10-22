import ChatRoom from "@/components/common/ChatRoom";
import { getTopicById } from "@/lib/api";
import NewsCard from "@/components/news/NewsCard";
import { Article } from "@/types/article";

async function DebateRoomContent({ roomId }: { roomId: string }) {
  const topicDetails = await getTopicById(roomId);

  if (!topicDetails) {
    return (
      <div className="container mx-auto px-4 mt-8 text-center">
        <h1 className="text-3xl font-bold">토픽을 찾을 수 없습니다.</h1>
        <p className="mt-4">요청하신 토론방이 존재하지 않거나 삭제되었습니다.</p>
      </div>
    );
  }

  const { topic, articles } = topicDetails;

  const leftArticles = articles.filter(article => article.side === 'LEFT');
  const rightArticles = articles.filter(article => article.side === 'RIGHT');

  return (
    <div className="container mx-auto px-4 mt-8">
      {/* Topic Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 text-white">{topic.display_name}</h1>
        <p className="text-lg lg:text-xl text-neutral-300 max-w-3xl mx-auto">{topic.summary}</p>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Left-side Articles */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">좌파 기사</h2>
          <div className="space-y-4">
            {leftArticles.map((article: Article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Center Column: Chat Room */}
        <div className="lg:col-span-6 h-[calc(100vh-250px)]">
          <ChatRoom title="실시간 토론" roomId={String(topic.id)} />
        </div>

        {/* Right Column: Right-side Articles */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-400">우파 기사</h2>
          <div className="space-y-4">
            {rightArticles.map((article: Article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DebateRoomContent;