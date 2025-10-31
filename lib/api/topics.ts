
import { Topic, TopicDetail } from "@/types";
import { BACKEND_BASE_URL } from "@/lib/constants";

/**
 * 가장 최근에 발행된 토픽 10개를 가져옵니다.
 * @returns 최신 토픽 목록 (Topic[] 타입)
 */
export async function getLatestTopics(): Promise<Topic[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/topics/latest`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    console.error('Failed to fetch latest topics');
    return [];
  }

  return response.json();
}

export async function getTopicDetail(topicId: string, token?: string): Promise<TopicDetail> {
  const url = `${BACKEND_BASE_URL}/api/topics/${topicId}`;
  const headers: HeadersInit = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    next: { revalidate: 60 },
    headers: headers
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API Error fetching topic detail: ${response.status} ${response.statusText}`);
    console.error(`URL: ${url}`);
    console.error(`Response Body: ${errorBody}`);
    throw new Error(`Failed to fetch topic details. Status: ${response.status}`);
  }
  return response.json();
}

export async function incrementTopicView(topicId: string): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/topics/${topicId}/view`, {
      method: 'POST',
    });
    if (!response.ok) {
      console.error(`Failed to increment topic view count. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error in incrementTopicView:', error);
  }
}

export async function getPopularTopics(): Promise<Topic[]> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/topics/popular-ranking`, { next: { revalidate: 60 } });
  if (!response.ok) {
    console.error('Failed to fetch popular topics');
    return [];
  }
  return response.json();
}
