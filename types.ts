/**
 * API에서 받아오는 기사(Article) 데이터 구조 정의
 */
export interface Article {
  id: number;
  source: string;
  source_domain: string;
  title: string;
  url: string;
  published_at: string;
  thumbnail_url: string;
  favicon_url: string;
  description?: string; // Added for search results
  // 상세 페이지에서 추가되는 필드
  side?: "LEFT" | "RIGHT";
  is_featured?: number;
  view_count?: number;
  like_count?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  saved_article_id?: number; // For category management
  category_id?: number | null; // Added for category management


}

/**
 * API에서 받아오는 토픽(Topic) 데이터 구조 정의
 */
export interface Topic {
  id: number;
  display_name: string;
  summary: string;
  published_at: string;
  view_count: number;
  popularity_score?: number;
}

/**
 * API에서 받아오는 특정 토픽 상세 데이터 구조 정의
 */
export interface TopicDetail {
  topic: Topic;
  articles: Article[];
}

/**
 * API에서 받아오는 사용자(User) 데이터 구조 정의
 */
export interface User {
  id: number;
  email: string;
  name: string;
  nickname?: string;
  phone?: string;
  profile_image_url?: string; // Changed to match API
  introduction?: string;
}

// 👇 프로필 업데이트 시 API 요청 본문에 사용할 타입
export interface UserUpdate {
  nickname?: string;
  introduction?: string;
  profile_image_url?: string; // API 명세에 맞춰 필드명 사용
  phone?: string; // API 명세에는 없지만 profile 페이지에서 사용하므로 추가 (선택 사항)
}

export interface SavedArticleCategory {
  id: number;
  name: string;
  created_at?: string;
}