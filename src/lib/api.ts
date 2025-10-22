

import { User, UserUpdate, UserPasswordUpdate } from "@/types/user";

export const API_BASE_URL = "https://news02.onrender.com/api";

export interface Topic {
  id: number;
  display_name: string;
  summary: string;
  published_at: string;
  chat_room_id?: string;
}

export interface TopicDetailResponse {
  topic: Topic;
  articles: Article[];
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

export async function getTopics(): Promise<Topic[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/topics`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Topic[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch topics:", error);
    return [];
  }
}

export async function getTopicById(id: string): Promise<TopicDetailResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/topics/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Topic not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: TopicDetailResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch topic with id ${id}:`, error);
    return null;
  }
}

export async function getExclusiveNews() {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/exclusives?limit=5&offset=0`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const rawArticles: RawNewsArticle[] = await res.json();
    return rawArticles.map(article => ({
      id: article.id.toString(),
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

export async function getBreakingNews() {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/breaking?limit=10&offset=0`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const rawArticles: RawNewsArticle[] = await res.json();
    return rawArticles.map(article => ({
      id: article.id.toString(),
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

export async function getCategoryNews(categoryName: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/articles/by-category?name=${categoryName}&limit=10&offset=0`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const rawArticles: RawNewsArticle[] = await res.json();
    return rawArticles.map(article => ({
      id: article.id.toString(),
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
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

export async function fetchUser(token: string) {
  const res = await fetch(`${API_BASE_URL}/user/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'No error message from server' }));
    const errorMessage = errorData.message || JSON.stringify(errorData);
    throw new Error(`Failed to fetch user: ${res.status} - ${errorMessage}`);
  }

  return await res.json();
}

export async function searchArticles(query: string, page: number = 1, limit: number = 10, sortBy: string = 'created_at', sortOrder: 'asc' | 'desc' = 'desc'): Promise<Article[]> {
  try {
    const url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}&sort_by=${sortBy}&order=${sortOrder}`;
    console.log("Fetching search results from:", url);
    const res = await fetch(url);
    console.log("Search API response status:", res.status);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'No error message from server' }));
      const errorMessage = errorData.message || JSON.stringify(errorData);
      throw new Error(`HTTP error! status: ${res.status} - ${errorMessage}`);
    }
    const rawArticles: RawNewsArticle[] = await res.json();
    return rawArticles.map(article => ({
      id: article.id.toString(),
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
    const promises = categories.map(category => getCategoryNews(category));
    const results = await Promise.all(promises);

    // Flatten the array of arrays and create a map to remove duplicates
    const allArticles = results.flat();
    const uniqueArticlesMap = new Map<string, Article>();
    allArticles.forEach(article => {
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

export async function updateUser(token: string, userId: number, userData: UserUpdate): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/user/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'No error message from server' }));
    const errorMessage = errorData.message || JSON.stringify(errorData);
    throw new Error(`Failed to update user: ${res.status} - ${errorMessage}`);
  }

  return await res.json();
}

export async function updateUserPassword(token: string, passwordData: UserPasswordUpdate): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/user/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'No error message from server' }));
    const errorMessage = errorData.message || JSON.stringify(errorData);
    throw new Error(`Failed to update password: ${res.status} - ${errorMessage}`);
  }

  return await res.json();
}

export async function deleteUser(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/user/me`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'No error message from server' }));
    const errorMessage = errorData.message || JSON.stringify(errorData);
    throw new Error(`Failed to delete user: ${res.status} - ${errorMessage}`);
  }

  return await res.json();
}

export async function uploadAvatar(token: string, file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetch(`${API_BASE_URL}/avatars`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'No error message from server' }));
    const errorMessage = errorData.message || JSON.stringify(errorData);
    throw new Error(`Failed to upload avatar: ${res.status} - ${errorMessage}`);
  }

  return await res.json();
}
