import { Topic } from '@/types/topic';
import Link from 'next/link';

interface TopicCardProps {
  topic: Topic;
}

export default function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link href={`/topics/${topic.id}`} className="block p-4 bg-[#3a3a3a] rounded-md hover:bg-neutral-700 transition-colors">
      <h4 className="font-bold text-md mb-1 truncate">{topic.display_name}</h4>
      <p className="text-sm text-neutral-300 truncate">{topic.summary}</p>
    </Link>
  );
}