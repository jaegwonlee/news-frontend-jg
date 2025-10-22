import DebateRoomList from "@/components/DebateRoomList";
import { getTopics, Topic } from "@/lib/api"; // Import getTopics and Topic

export default async function DebateListPage() {
  let topics: Topic[] = [];
  let fetchError: string | null = null;
  try {
    topics = await getTopics();
  } catch (error) {
    console.error("Failed to fetch topics for debate list page:", error);
    fetchError = "토픽 데이터를 불러올 수 없습니다.";
  }

  const debateRooms = topics.map(topic => ({
    id: String(topic.id),
    title: topic.display_name,
    participants: 0,
  }));

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4">전체 논쟁방</h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            다양한 주제에 대한 실시간 토론에 참여하고 의견을 나누세요.
          </p>
        </div>

        <div className="relative min-h-[300px]">
          {fetchError && (
            <p className="text-red-500 text-center absolute inset-0 flex items-center justify-center">{fetchError}</p>
          )}
          <DebateRoomList rooms={debateRooms} />
        </div>
      </div>
    </div>
  );
}
