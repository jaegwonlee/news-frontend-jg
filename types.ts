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
  summary?: string;
  // 상세 페이지에서 추가되는 필드
  side?: "LEFT" | "RIGHT";
  is_featured?: number;
  view_count?: number;
  like_count?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  saved_article_id?: number; // For category management
  category_id?: number | null; // Added for category management
  category?: string; // Added for mock data filtering
  comment_count?: number;
}

/**
 * API에서 받아오는 댓글(Comment) 데이터 구조 정의
 */
export interface Comment {
  id: number;
  author_id: number; // Mapped from API's user_id
  author_name: string; // Mapped from API's nickname
  author_profile_image_url?: string; // Mapped from API's profile_image_url
  content: string;
  created_at: string;
  parent_id?: number | null; // Mapped from API's parent_comment_id
  children?: Comment[]; // Mapped from API's replies
}

// Interface for raw API comment response, including nested replies
export interface ApiComment {
  id: number;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  updated_at?: string;
  status?: string;
  user_id?: number; // Present in GET response
  nickname: string;
  profile_image_url?: string;
  replies?: ApiComment[]; // Nested replies
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
  article_count?: number;
}

export type NotificationType = "NEW_TOPIC" | "BREAKING_NEWS" | "EXCLUSIVE_NEWS";

export interface NotificationSetting {
  notification_type: NotificationType;
  is_enabled: boolean;
}

/**
 * @interface LoginCredentials
 * @description 로그인 요청 시 사용되는 사용자 자격 증명 데이터 구조.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * @interface SignUpData
 * @description 회원가입 요청 시 사용되는 사용자 등록 데이터 구조.
 */
export interface SignUpData {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone?: string;
}

/**
 * @interface AuthResponse
 * @description 로그인 및 회원가입 성공 시 백엔드로부터 받는 응답 데이터 구조.
 */
export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

/**
 * @interface ToggleLikeResponse
 * @description 기사 '좋아요' 상태 변경 API 응답 데이터 구조.
 */
export interface ToggleLikeResponse {
  articleId: number;
  likes: number;
  isLiked: boolean;
}

/**
 * @interface ToggleSaveResponse
 * @description 기사 '저장' 상태 변경 API 응답 데이터 구조.
 * 백엔드 응답에 따라 유연하게 정의. 성공 시 { success: true } 또는 다른 데이터가 올 수 있음.
 */
export interface ToggleSaveResponse {
  success: boolean;
  // 기타 필요한 필드 추가 가능
}
