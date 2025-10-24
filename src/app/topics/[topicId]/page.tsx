'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TopicDetail } from '@/types/topic';
import { Article } from '@/types/article';
import Image from 'next/image';
import Link from 'next/link';
import TopicViewCounter from '@/components/TopicViewCounter';
import ChatRoom from '@/components/common/ChatRoom';

async function getTopicDetail(topicId: string): Promise<TopicDetail> {
  const res = await fetch(`https://news02.onrender.com/api/topics/${topicId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch topic details');
  }
  return res.json();
}


export default function TopicDetailPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const [topicDetail, setTopicDetail] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const data = await getTopicDetail(topicId);
        setTopicDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!topicDetail) {
    return <div>No topic found.</div>;
  }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { topic, articles } = topicDetail;

  const middleIndex = Math.ceil(articles.length / 2);
  const leftArticles = articles.slice(0, middleIndex);
  const rightArticles = articles.slice(middleIndex);

  return (
    <div className="container mx-auto px-4 py-8">
      <TopicViewCounter topicId={topicId} />
      <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-8">{topic.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column for Articles */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">관련 기사 (좌)</h2>
          <div className="grid grid-cols-1 gap-6">
            {leftArticles.map((article: Article) => (
              <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <Link href={article.url} target="_blank" rel="noopener noreferrer">
                  <div className="relative h-48">
                    <Image
                      src={article.thumbnail_url || '/placeholder-image.svg'}
                      alt={article.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{article.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      {article.favicon_url && (
                        <Image src={article.favicon_url} alt={article.source} width={16} height={16} className="mr-2" />
                      )}
                      <span>{article.source}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column for Chat Room */}
        <div className="lg:col-span-1">
          <div className="h-[600px]"> {/* Adjust height as needed */}
            <ChatRoom title={`${topic.title} 토론방`} roomId={topicId} />
          </div>
        </div>

        {/* Right Column for Articles */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">관련 기사 (우)</h2>
          <div className="grid grid-cols-1 gap-6">
            {rightArticles.map((article: Article) => (
              <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <Link href={article.url} target="_blank" rel="noopener noreferrer">
                  <div className="relative h-48">
                    <Image
                      src={article.thumbnail_url || '/placeholder-image.svg'}
                      alt={article.title}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{article.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      {article.favicon_url && (
                        <Image src={article.favicon_url} alt={article.source} width={16} height={16} className="mr-2" />
                      )}
                      <span>{article.source}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
