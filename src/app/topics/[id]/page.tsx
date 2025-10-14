import { TopicDetail } from "@/types/topic";

interface TopicDetailPageProps {
  params: {
    id: string;
  };
}

async function getTopicDetail(id: string): Promise<TopicDetail | null> {
  const API_URL = `https://news-buds.onrender.com/api/topics/${id}`;
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch topic details. Status: ${res.status}`);
    }
    const data = await res.json();
    // The API returns { topic: { ... } }
    return data.topic || null;
  } catch (error) {
    console.error("API Fetch Error (Topic Detail):", error);
    return null;
  }
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const id = params.id;
  const topic = await getTopicDetail(id);

  if (!topic) {
    return (
      <div className="container mx-auto px-4 mt-8 text-center">
        <h1 className="text-2xl text-white">토론방을 찾을 수 없습니다.</h1>
        <p className="text-neutral-400 mt-2">ID: {id}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="bg-[#1c1c1c] rounded-lg shadow-lg p-8">
        {/* Topic Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            {topic.name}
          </h1>
          <p className="text-neutral-400 mb-3">{topic.description}</p>
          <p className="text-sm text-neutral-500">
            토론 시작일: {new Date(topic.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Placeholder for Related Articles or Content */}
        <div className="bg-[#2e2e2e] p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-white mb-4">관련 기사</h2>
          <div className="text-center text-neutral-400 py-8">
            <p>관련 기사 데이터가 아직 제공되지 않았습니다.</p>
            <p className="text-sm text-neutral-500 mt-2">API 연동 후 이 곳에 기사 목록이 표시됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}