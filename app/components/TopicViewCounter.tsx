"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { incrementTopicView } from "@/lib/api";

interface TopicViewCounterProps {
  topicId: string;
}

export default function TopicViewCounter({ topicId }: TopicViewCounterProps) {
  const router = useRouter(); // Get the router instance

  useEffect(() => {
    const handleViewIncrement = async () => { // Make the callback async
      // This effect runs once on the client when the component mounts.
      try {
        await incrementTopicView(topicId);
        router.refresh(); // Refresh the current route to re-fetch data
      } catch (error) {
        console.error("Failed to increment view count or refresh page:", error);
      }
    };

    handleViewIncrement();
  }, [topicId, router]); // Add router to dependency array

  // This component does not render any UI.
  return null;
}
