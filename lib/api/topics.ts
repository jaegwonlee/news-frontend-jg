import { Topic, TopicDetail } from "@/types";
import { fetchWrapper } from "./fetchWrapper";

// Define the type for a single chat message from the API
export interface ApiChatMessage {
  id: number;
  message: string; // Changed from 'content'
  created_at: string;
  author: string;   // Changed from 'nickname'
  profile_image_url?: string; // Added as per POST response
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

/**
 * 모든 토픽을 최신순으로 가져옵니다.
 * @returns 모든 토픽 목록 (Topic[] 타입)
 */
export async function getAllTopics(): Promise<Topic[]> {
  try {
    const response = await fetchWrapper(`/api/topics`, {
      method: 'GET',
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    if (!response.ok) {
      console.error('Failed to fetch all topics');
      return [];
    }
    return response.json();
  } catch (error) {
    console.error('Error in getAllTopics:', error);
    return [];
  }
}

/**
 * 모든 토픽을 인기순으로 가져옵니다.
 * @returns 모든 토픽 목록 (Topic[] 타입)
 */
export async function getPopularTopicsAll(): Promise<Topic[]> {
  try {
    const response = await fetchWrapper(`/api/topics/popular-all`, {
      method: 'GET',
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    if (!response.ok) {
      console.error('Failed to fetch all popular topics');
      return [];
    }
    return response.json();
  } catch (error) {
    console.error('Error in getPopularTopicsAll:', error);
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

    return response.json().then((rawMessages: any[]) => {
      return rawMessages.map(rawMsg => ({
        id: rawMsg.id,
        message: rawMsg.content,
        created_at: rawMsg.created_at,
        author: rawMsg.nickname,
        profile_image_url: rawMsg.profile_image_url,
      }));
    });
  } catch (error) {
    if ((error as Error).message === 'Session expired') return [];
    console.error('Failed to fetch chat history', error);
    return [];
  }
}

/**
 * Sends a new chat message to a specific topic.
 * @param topicId The ID of the topic.
 * @param content The content of the message.
 * @param token The user's authentication token.
 * @returns The newly created message object.
 */
export async function sendChatMessage(topicId: number, content: string, token: string): Promise<ApiChatMessage> {
  const response = await fetchWrapper(`/api/topics/${topicId}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '메시지 전송에 실패했습니다.');
  }

  return response.json();
}

/**
 * Deletes a specific chat message.
 * @param messageId The ID of the message to delete.
 * @param token The user's authentication token.
 */
export async function deleteChatMessage(messageId: number, token: string): Promise<void> {
  const response = await fetchWrapper(`/api/chat/${messageId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '메시지 삭제에 실패했습니다.');
  }
  // No content expected for 200 OK on DELETE
}

/**
 * Gets a presigned URL for uploading a file to S3.
 * @param token The user's authentication token.
 * @param fileName The name of the file to upload.
 * @param fileType The MIME type of the file.
 * @returns An object containing the uploadUrl and the final fileUrl.
 */
export async function getPresignedUrlForChat(token: string, fileName: string, fileType: string): Promise<{ uploadUrl: string, fileUrl: string }> {
  const response = await fetchWrapper(`/api/chat/presigned-url`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ fileName, fileType }),
  });

  if (!response.ok) {
    let errorMessage = 'Presigned URL 생성에 실패했습니다.';
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // If JSON parsing fails, use the raw text response for better debugging
      const textResponse = await response.text();
      errorMessage = `서버 오류 (${response.status} ${response.statusText}): ${textResponse}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Reports a chat message.
 * @param messageId The ID of the message to report.
 * @param reason The reason for the report.
 * @param token The user's authentication token.
 * @returns 응답 메시지 Promise
 */
export async function reportChatMessage(messageId: number, reason: string, token: string): Promise<{ message: string }> {
  const response = await fetchWrapper(`/api/chat/${messageId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }), // Add reason to the body
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '메시지 신고에 실패했습니다.');
  }

  return response.json();
}