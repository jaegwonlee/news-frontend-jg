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
    <div className="container mx-auto px-4 mt-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 border-b-4 border-red-500 pb-4">전체 논쟁방</h1>
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