'use client';

import { useEffect } from 'react';

type TopicViewCounterProps = {
  topicId: string;
};

const TopicViewCounter = ({ topicId }: TopicViewCounterProps) => {
  useEffect(() => {
    const incrementViewCount = async () => {
      try {
        await fetch(`https://news02.onrender.com/api/topics/${topicId}/view`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to increment view count:', error);
      }
    };

    incrementViewCount();
  }, [topicId]);

  return null; // This component does not render anything
};

export default TopicViewCounter;
