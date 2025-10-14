import { Topic } from '@/types/topic';
import TopicCard from './TopicCard';

// Function to fetch topics for ROUND 2
async function getTopics(): Promise<Topic[]> {
  const API_URL = 'https://news-buds.onrender.com/api/topics';

  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`Failed to fetch topics. Status: ${res.status}`);
      return [];
    }
    const data = await res.json();
    // The API returns an array directly
    return data || [];
  } catch (error) {
    console.error('API Fetch Error (Topics):', error);
    return [];
  }
}

export default async function Round2Section() {
  const topicsData = await getTopics();

  return (
    <aside className="lg:col-span-3 space-y-6">
      <div className="bg-[#2e2e2e] p-4 rounded-md">
        <h3 className="font-bold text-lg mb-2">ROUND 2</h3>
        <div className="space-y-4">
          {topicsData.length > 0 ? (
            topicsData.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))
          ) : (
            <p className="text-sm text-neutral-400">현재 등록된 토론방이 없습니다.</p>
          )}
        </div>
      </div>
      <div className="bg-[#2e2e2e] p-4 rounded-md h-60 flex items-center justify-center">
        <p className="text-neutral-500">광고</p>
      </div>
    </aside>
  );
}