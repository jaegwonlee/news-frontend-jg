import { Topic } from '@/types/topic';
import Link from 'next/link';

async function getTopics(): Promise<Topic[]> {
  const res = await fetch(`https://news02.onrender.com/api/topics`);
  if (!res.ok) {
    throw new Error('Failed to fetch topics');
  }
  return res.json();
}

export default async function DiscussionPage() {
  const topics = await getTopics();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">토론방</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Link key={topic.id} href={`/topics/${topic.id}`}>
            <div className="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow duration-200">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{topic.display_name}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{topic.summary}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>조회수: {topic.view_count}</span>
                <span>{new Date(topic.published_at).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
