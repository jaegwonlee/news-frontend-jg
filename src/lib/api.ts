import { Article } from "@/types/article";
import { Topic, TopicDetail } from "@/types/topic";
import { User, UserPasswordUpdate, UserUpdate } from "@/types/user";

export const API_BASE_URL = "https://news02.onrender.com/api";

// Helper function to add a timeout to fetch requests
async function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);
  return response;
}

export interface RawNewsArticle {
  id: number;
  url: string;
  title: string;
  source: string;
  source_domain: string;
  published_at: string;
  thumbnail_url?: string;
  favicon_url?: string;
}

export async function getExclusiveNews(): Promise<Article[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/articles/exclusives?limit=5&offset=0`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const rawArticles: RawNewsArticle[] = await res.json();
    return rawArticles.map((article) => ({
      id: article.id,
      title: article.title,
      source: article.source,
      url: article.url,
      published_at: article.published_at,
      thumbnail_url: article.thumbnail_url,
      favicon_url: article.favicon_url,
    }));
  } catch (error) {
    console.error("Failed to fetch exclusive news:", error);
    return [];
  }
}

export async function getBreakingNews(): Promise<Article[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/articles/breaking?limit=10&offset=0`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const rawArticles: RawNewsArticle[] = await res.json();
    return rawArticles.map((article) => ({
      id: article.id,
      title: article.title,
      source: article.source,
      url: article.url,
      published_at: article.published_at,
      thumbnail_url: article.thumbnail_url,
      favicon_url: article.favicon_url,
    }));
  } catch (error) {
    console.error("Failed to fetch breaking news:", error);
    return [];
  }
}

export async function getCategoryNews(categoryName: string): Promise<Article[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/articles/by-category?name=${categoryName}&limit=10&offset=0`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const rawArticles: RawNewsArticle[] = await res.json();
    return rawArticles.map((article) => ({
      id: article.id,
      title: article.title,
      source: article.source,
      url: article.url,
      published_at: article.published_at,
      thumbnail_url: article.thumbnail_url,
      favicon_url: article.favicon_url,
    }));
  } catch (error) {
    console.error(`Failed to fetch ${categoryName} news:`, error);
    return [];
  }
}

export async function signUpUser(userData: Record<string, unknown>) {
  const res = await fetchWithTimeout(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    const message = errorData.message || JSON.stringify(errorData);
    throw new Error(message);
  }

  return await res.json();
}

export async function loginUser(credentials: Record<string, unknown>) {
  const res = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errorData = await res.json();
    const message = errorData.message || JSON.stringify(errorData);
    throw new Error(message);
  }

  return await res.json();
}

export async function fetchUser(token: string): Promise<User> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "No error message from server" }));
    const errorMessage = errorData.message || JSON.stringify(errorData);
    throw new Error(`Failed to fetch user: ${res.status} - ${errorMessage}`);
  }

  return await res.json();
}

export interface ChatHistoryMessage {
  id: number;
  content: string;
  created_at: string;
  nickname: string;
}

export async function fetchChatHistory(topicId: string): Promise<ChatHistoryMessage[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/topics/${topicId}/chat`);
    if (!res.ok) {
      throw new Error(`Failed to fetch chat history: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return [];
  }
}

export async function searchArticles(
  query: string,
  page: number = 1,
  limit: number = 10,
  sortBy: string = "created_at",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Article[]> {
  try {
    const url = `${API_BASE_URL}/search?q=${encodeURIComponent(
      query
    )}&page=${page}&limit=${limit}&sort_by=${sortBy}&order=${sortOrder}`;
    console.log("Fetching search results from:", url);
    const res = await fetchWithTimeout(url);
    console.log("Search API response status:", res.status);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: "No error message from server" }));
      const errorMessage = errorData.message || JSON.stringify(errorData);
      throw new Error(`HTTP error! status: ${res.status} - ${errorMessage}`);
    }
    const rawArticles: RawNewsArticle[] = await res.json();
    return rawArticles.map((article) => ({
      id: article.id,
      title: article.title,
      source: article.source,
      url: article.url,
      published_at: article.published_at,
      thumbnail_url: article.thumbnail_url,
      favicon_url: article.favicon_url,
    }));
  } catch (error) {
    console.error(`Failed to search articles for query "${query}":`, error);
    return [];
  }
}

export async function getLatestNews(limit: number = 10): Promise<Article[]> {
  try {
    const categories = ["정치", "경제", "사회", "문화"];
    const promises = categories.map((category) => getCategoryNews(category));
    const results = await Promise.all(promises);

    // Flatten the array of arrays and create a map to remove duplicates
    const allArticles = results.flat();
    const uniqueArticlesMap = new Map<number, Article>(); // Changed to number for id
    allArticles.forEach((article) => {
      uniqueArticlesMap.set(article.id, article);
    });

    // Convert map back to array and sort by date
    const uniqueArticles = Array.from(uniqueArticlesMap.values());
    uniqueArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // Return the limited number of articles
    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error("Failed to fetch latest news:", error);
    return [];
  }
}

export async function getTopicById(topicId: number): Promise<TopicDetail | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/topics/${topicId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch topic: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch topic with id ${topicId}:`, error);
    return null;
  }
}

export async function updateUser(token: string, userId: number, userData: UserUpdate): Promise<User> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/user/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "No error message from server" }));
    const errorMessage = errorData.message || JSON.stringify(errorData);
    throw new Error(`Failed to update user: ${res.status} - ${errorMessage}`);
  }

  return await res.json();
}

export async function updateUserPassword(token: string, passwordData: UserPasswordUpdate): Promise<User> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/user/me/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "No error message from server" }));
    const errorMessage = errorData.message || JSON.stringify(errorData);
    throw new Error(`Failed to update password: ${res.status} - ${errorMessage}`);
  }

  return await res.json();
}

export async function deleteUser(token: string): Promise<User> {
  const res = await fetchWithTimeout(`${API_BASE_URL}/user/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "No error message from server" }));
    const errorMessage = errorData.message || JSON.stringify(errorData);
    throw new Error(`Failed to delete user: ${res.status} - ${errorMessage}`);
  }

  return await res.json();
}
