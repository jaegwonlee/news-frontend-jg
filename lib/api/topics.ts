import { Article, Topic, TopicDetail, TopicPreview } from "@/types";
import { fetchWrapper } from "./fetchWrapper";
import { mockMainTopicDetail, mockPopularTopics, mockLatestTopics } from "@/app/mocks/topics";

// Define the type for a single chat message from the API
export interface ApiChatMessage {
  id: number;
  message: string; // Changed from 'content'
  created_at: string;
  author: string; // Changed from 'nickname'
  profile_image_url?: string; // Added as per POST response
  article_preview?: Article | null;
  topic_preview?: TopicPreview | null;
}

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'; // Set to true to use mock data

/**
 * 가장 최근에 발행된 토픽 10개를 가져옵니다.
 * @returns 최신 토픽 목록 (Topic[] 타입)
 */
export async function getLatestTopics(): Promise<Topic[]> {
  if (USE_MOCKS) {
    return Promise.resolve(mockLatestTopics);
  }
  try {
    const response = await fetchWrapper(`/api/topics/latest`, {
      method: "GET",
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch latest topics");
    }

    return response.json();
  } catch (error) {
    console.warn("Error fetching latest topics, returning empty array:", error);
    return [];
  }
}

/**
 * 모든 토픽을 최신순으로 가져옵니다.
 * @returns 모든 토픽 목록 (Topic[] 타입)
 */
export async function getAllTopics(): Promise<Topic[]> {
  // This function is not used on the main page, so we can leave it or mock it simply
  if (USE_MOCKS) {
    return Promise.resolve([...mockLatestTopics, ...mockPopularTopics]);
  }
  try {
    const response = await fetchWrapper(`/api/topics`, {
      method: "GET",
      cache: 'no-store', // Disable caching to avoid 2MB limit warning for potentially large lists
    });
    if (!response.ok) {
      console.error("Failed to fetch all topics");
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error in getAllTopics:", error);
    return [];
  }
}

/**
 * 모든 토픽을 인기순으로 가져옵니다.
 * @returns 모든 토픽 목록 (Topic[] 타입)
 */
export async function getPopularTopicsAll(): Promise<Topic[]> {
    // This function is not used on the main page, so we can leave it or mock it simply
  if (USE_MOCKS) {
    return Promise.resolve(mockPopularTopics);
  }
  try {
    const response = await fetchWrapper(`/api/topics/popular-all`, {
      method: "GET",
      cache: 'no-store', // Disable caching to avoid 2MB limit warning for potentially large lists
    });
    if (!response.ok) {
      console.error("Failed to fetch all popular topics");
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error in getPopularTopicsAll:", error);
    return [];
  }
}

export async function getTopicDetail(topicId: string, token?: string): Promise<TopicDetail> {
  if (USE_MOCKS && topicId === "1") {
    return Promise.resolve(mockMainTopicDetail);
  }
  // Fallback for other topic IDs if needed
  if (USE_MOCKS) {
    const topic = [...mockPopularTopics, ...mockLatestTopics].find(t => t.id.toString() === topicId);
    return Promise.resolve({
        topic: topic || mockMainTopicDetail.topic,
        articles: mockMainTopicDetail.articles
    });
  }

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetchWrapper(`/api/topics/${topicId}`, {
    cache: 'no-store', // Disable caching to avoid 2MB limit warning for potentially large topic details
    headers: headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch topic detail for ${topicId}`);
  }
  return response.json();
}

export async function incrementTopicView(topicId: string): Promise<void> {
  if (USE_MOCKS) {
    console.log(`Mock incrementing view for topic ${topicId}`);
    return Promise.resolve();
  }
  try {
    const response = await fetchWrapper(`/api/topics/${topicId}/view`, {
      method: "POST",
    });
    if (!response.ok) {
      console.error(`Failed to increment topic view count. Status: ${response.status}`);
    }
  } catch (error) {
    if ((error as Error).message === "Session expired") return;
    console.error("Error in incrementTopicView:", error);
  }
}

export async function getPopularTopics(): Promise<Topic[]> {
  if (USE_MOCKS) {
    return Promise.resolve(mockPopularTopics);
  }
  try {
    const response = await fetchWrapper(`/api/topics/popular-ranking`, { next: { revalidate: 0 } });
    if (!response.ok) {
      throw new Error("Failed to fetch popular topics");
    }
    return response.json();
  } catch (error) {
    console.warn("Error fetching popular topics, returning empty array:", error);
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
  if (USE_MOCKS) {
    // For now, return an empty history. A full mock would require a mock message store.
    console.log(`Mock fetching chat history for topic ${topicId}`);
    return Promise.resolve([]);
  }
  try {
    const response = await fetchWrapper(`/api/topics/${topicId}/chat?limit=${limit}&offset=${offset}`, {
      method: "GET",
      next: { revalidate: 0 }, // Don't cache chat history
    });

    if (!response.ok) {
      // Handle non-OK responses consistently
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error("Failed to fetch chat history:", errorData.message);
      throw new Error(errorData.message || "Failed to fetch chat history");
    }

    const rawMessages: any[] = await response.json();
    
    return rawMessages.map((rawMsg: any) => ({
        id: rawMsg.id,
        message: rawMsg.content, // 'content' from backend maps to 'message' here
        created_at: rawMsg.created_at,
        author: rawMsg.nickname,
        profile_image_url: rawMsg.profile_image_url,
        article_preview: rawMsg.article_preview,
        topic_preview: rawMsg.topic_preview,
    }));
  } catch (error) {
    if ((error as Error).message === "Session expired") return [];
    console.error("Failed to fetch chat history", error);
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
    if (USE_MOCKS) {
        console.log(`Mock sending message to topic ${topicId}: ${content}`);
        const mockResponse: ApiChatMessage = {
            id: Math.floor(Math.random() * 10000),
            message: content,
            created_at: new Date().toISOString(),
            author: "목업맨", // Mock user from auth mock
            profile_image_url: '/user-placeholder.svg',
        };
        // In a real mock, this would also trigger a socket event.
        // For now, we just resolve the promise. The UI will update optimistically.
        return Promise.resolve(mockResponse);
    }

  const response = await fetchWrapper(`/api/topics/${topicId}/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "메시지 전송에 실패했습니다.");
  }

  return response.json();
}

/**
 * Deletes a specific chat message.
 * @param messageId The ID of the message to delete.
 * @param token The user's authentication token.
 */
export async function deleteChatMessage(messageId: number, token: string): Promise<void> {
  if (USE_MOCKS) {
    console.log(`Mock deleting message ${messageId}`);
    return Promise.resolve();
  }
  const response = await fetchWrapper(`/api/chat/${messageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "메시지 삭제에 실패했습니다.");
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
export async function getPresignedUrlForChat(
  token: string,
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; fileUrl: string }> {
  if (USE_MOCKS) {
      console.log("Mock generating presigned URL");
      // This is tricky to mock. We'll return a placeholder that will fail to upload
      // but allows the UI to proceed. A more advanced mock would use a local blob URL.
      return Promise.resolve({
          uploadUrl: `mock-upload-url-for/${fileName}`,
          fileUrl: `https://via.placeholder.com/300.png` // Return a placeholder image
      });
  }
  const response = await fetchWrapper(`/api/chat/presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ fileName, fileType }),
  });

  if (!response.ok) {
    let errorMessage = "Presigned URL 생성에 실패했습니다.";
    try {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
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
export async function reportChatMessage(
  messageId: number,
  reason: string,
  token: string
): Promise<{ message: string }> {
  if (USE_MOCKS) {
    console.log(`Mock reporting message ${messageId} for reason: ${reason}`);
    return Promise.resolve({ message: "신고가 접수되었습니다. (목업)" });
  }
  const response = await fetchWrapper(`/api/chat/${messageId}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }), // Add reason to the body
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || "메시지 신고에 실패했습니다.");
  }

  return response.json();
}

/**
 * Casts a vote for a specific topic with a given stance.
 * @param topicId The ID of the topic.
 * @param stance The user's stance ('LEFT' or 'RIGHT').
 * @param token The user's authentication token.
 * @returns A promise that resolves to an object containing a message and potentially updated vote counts.
 */
export async function castTopicVote(
  topicId: number,
  stance: 'LEFT' | 'RIGHT',
  token: string
): Promise<{ message: string; voteCountLeft?: number; voteCountRight?: number }> {
  if (USE_MOCKS) {
    console.log(`Mock voting for topic ${topicId} with stance ${stance}`);
    return Promise.resolve({ message: "Vote cast successfully (mock)", voteCountLeft: 10, voteCountRight: 5 });
  }
  try {
    const response = await fetchWrapper(`/api/topics/${topicId}/${stance}/vote`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || "투표에 실패했습니다.");
    }
    return response.json();
  } catch (error) {
    console.error("Error in castTopicVote:", error);
    throw error;
  }
}

