'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Topic } from '@/types';
import { getAllTopics } from '@/lib/api/topics'; // Assuming we'll use popular topics
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface RelatedTopicsCarouselProps {
  currentTopicId: string;
}

export default function RelatedTopicsCarousel({ currentTopicId }: RelatedTopicsCarouselProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleWheelScroll = useCallback((event: WheelEvent) => { // Change type to native WheelEvent
    if (carouselRef.current) {
      event.preventDefault(); // Prevent vertical scrolling of the page
      event.stopPropagation(); // Stop event from bubbling up
      const scrollAmount = event.deltaY > 0 ? 100 : -100; // Scroll right for down, left for up
      carouselRef.current.scrollLeft += scrollAmount;
    }
  }, []);

  useEffect(() => {
    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('wheel', handleWheelScroll, { passive: false });
      return () => {
        carouselElement.removeEventListener('wheel', handleWheelScroll);
      };
    }
  }, [handleWheelScroll]); // Dependency on handleWheelScroll

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTopics = await getAllTopics(); // Fetch all topics
        // Filter out the current topic
        setTopics(fetchedTopics.filter(topic => topic.id.toString() !== currentTopicId));
      } catch (err) {
        setError("관련 토픽을 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [currentTopicId]);

  const scroll = (scrollOffset: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft += scrollOffset;
    }
  };

  if (isLoading) {
    return <div className="text-center text-zinc-400 py-5">관련 토픽 로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-5">{error}</div>;
  }

  if (topics.length === 0) {
    return null; // Don't render if no related topics
  }

  return (
    <div className="mt-8 relative">
      <h3 className="text-xl font-bold text-white mb-4">다른 토론 주제</h3>
      <div className="flex items-center">

        <div
          ref={carouselRef}
          className="flex overflow-x-scroll overflow-y-hidden scroll-smooth space-x-4 py-2 thin-scrollbar"
        >
          {topics.map((topic) => (
            <Link href={`/debate/${topic.id}`} key={topic.id} className="flex-none w-64 bg-zinc-800 rounded-lg shadow-md p-4 hover:bg-zinc-700 transition-colors cursor-pointer">
              <h4 className="text-lg font-semibold text-white truncate">{topic.display_name}</h4>
              <p className="text-sm text-zinc-400 line-clamp-2 mt-2">{topic.summary}</p>
              <div className="flex items-center text-xs text-zinc-500 mt-3">
                <span>조회수: {topic.view_count}</span>
              </div>
            </Link>
          ))}
        </div>

      </div>

      <style jsx>{`
        .thin-scrollbar::-webkit-scrollbar {
          height: 8px; /* height of horizontal scrollbar */
        }
        .thin-scrollbar::-webkit-scrollbar-track {
          background: #2a2a2a; /* Dark track */
          border-radius: 10px;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb {
          background: #555; /* Grey thumb */
          border-radius: 10px;
        }
        .thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #777; /* Lighter grey on hover */
        }
        /* For Firefox */
        .thin-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #555 #2a2a2a;
        }
      `}</style>

    </div>
  );
}
