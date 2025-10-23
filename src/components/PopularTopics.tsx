'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Topic } from '@/types/topic';

const PopularTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularTopics = async () => {
      try {
        const response = await fetch('https://news02.onrender.com/api/topics/popular-ranking');
        if (!response.ok) {
          throw new Error('Failed to fetch popular topics');
        }
        const data: Topic[] = await response.json();
        setTopics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularTopics();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">인기 토픽</h2>
      <ul className="space-y-2">
        {topics.map((topic, index) => (
          <li key={topic.id}>
            <Link href={`/topics/${topic.id}`} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center">
                <span className="text-lg font-bold mr-2 text-blue-500">{index + 1}</span>
                <span className="text-gray-800 dark:text-gray-200">{topic.display_name}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">조회수: {topic.view_count}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PopularTopics;
