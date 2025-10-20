import { Article } from "@/types/article";

const API_BASE_URL = "https://news-buds.onrender.com/api";

export interface Topic {
  id: number;
  display_name: string;
  summary: string;
  published_at: string;
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