export interface Article {
  id: number;
  url: string;
  thumbnail_url?: string;
  title: string;
  description?: string; // Optional as it's not in the API response
  source: string;
  source_domain?: string;
  favicon_url?: string;
  published_at: string;
  category?: string; // Optional as it's not in the API response
  side?: 'LEFT' | 'RIGHT' | 'NEUTRAL'; // Added for debate room articles
  is_featured?: number;
  view_count?: number;
  like_count?: number;
}