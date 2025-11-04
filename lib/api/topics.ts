
import { Topic, TopicDetail } from "@/types";
import { fetchWrapper } from "./fetchWrapper";

// Define the type for a single chat message from the API
export interface ApiChatMessage {
  id: number;
  content: string;
  created_at: string;
  nickname: string;
  profile_image_url?: string; // Add profile image URL
}


/**
 * 가장 최근에 발행된 토픽 10개를 가져옵니다.
 * @returns 최신 토픽 목록 (Topic[] 타입)
 */
export async function getLatestTopics(): Promise<Topic[]> {
  try {
    const response = await fetchWrapper(`/api/topics/latest`, {
      method: 'GET',
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error('Failed to fetch latest topics');
      return [];
    }

    return response.json();
  } catch (error) {
    if ((error as Error).message === 'Session expired') return [];
    console.error('Failed to fetch latest topics', error);
    return [];
  }
}

export async function getTopicDetail(topicId: string, token?: string): Promise<TopicDetail> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetchWrapper(`/api/topics/${topicId}`, {
    next: { revalidate: 60 },
    headers: headers
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API Error fetching topic detail: ${response.status} ${response.statusText}`);
    console.error(`URL: /api/topics/${topicId}`);
    console.error(`Response Body: ${errorBody}`);
    throw new Error(`Failed to fetch topic details. Status: ${response.status}`);
  }
  return response.json();
}

export async function incrementTopicView(topicId: string): Promise<void> {
  try {
    const response = await fetchWrapper(`/api/topics/${topicId}/view`, {
      method: 'POST',
    });
    if (!response.ok) {
      console.error(`Failed to increment topic view count. Status: ${response.status}`);
    }
  } catch (error) {
    if ((error as Error).message === 'Session expired') return;
    console.error('Error in incrementTopicView:', error);
  }
}

export async function getPopularTopics(): Promise<Topic[]> {
  try {
    const response = await fetchWrapper(`/api/topics/popular-ranking`, { next: { revalidate: 0 } });
    if (!response.ok) {
      console.error('Failed to fetch popular topics');
      return [];
    }
    return response.json();
  } catch (error) {
    if ((error as Error).message === 'Session expired') return [];
    return [];
  }
}

/**
 * Fetches the chat history for a specific topic.
 * @param topicId The ID of the topic.
 * @param limit The number of messages to fetch.
 * @param offset The number of messages to skip (for pagination).
 * @returns A promise that resolves to an array of chat messages.
 */
export async function getChatHistory(
  topicId: number,
  limit: number = 50,
  offset: number = 0
): Promise<ApiChatMessage[]> {
  try {
    const response = await fetchWrapper(
      `/api/topics/${topicId}/chat?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        next: { revalidate: 0 }, // Don't cache chat history
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch chat history');
      return [];
    }

    return response.json();
  } catch (error) {
    if ((error as Error).message === 'Session expired') return [];
    console.error('Failed to fetch chat history', error);
    return [];
  }
}
