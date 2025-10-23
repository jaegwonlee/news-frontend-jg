import { Article } from './article';

export interface Topic {
  id: number;
  display_name: string;
  summary: string;
  published_at: string;
  view_count: number;
  popularity_score?: number;
}

export interface TopicDetail {
  topic: {
    id: number;
    display_name: string;
    summary: string;
    published_at: string;
    view_count: number;
  };
  articles: Article[];
}
