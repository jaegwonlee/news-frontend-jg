/**
 * @file types.ts
 * @description 전역적으로 사용되는 TypeScript 타입을 정의하는 파일입니다.
 */

export interface TopicPreview {
  id: number;
  display_name: string;
  status: string;
  left_count: number;
  right_count: number;
  vote_remaining_time: string | null;
  vote_end_at?: string;
}

/**
 * 채팅 메시지 데이터 구조
 */
export interface Message {
  id: number;
  author: string;
  message: string;
  profile_image_url?: string;
  created_at: string;
  isHidden?: boolean;
  article_preview?: Article | null;
  topic_preview?: TopicPreview | null;
}

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
  favicon_url: string | null;
  description?: string; // Added for search results
  summary?: string;
  side?: "LEFT" | "RIGHT" | "CENTER"; // Added for debate articles
  // 상세 페이지에서 추가되는 필드
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
  author_id?: number; // Mapped from API's user_id
  author_name: string; // Mapped from API's nickname
  profile_image_url?: string; // Mapped from API's profile_image_url
  content: string;
  created_at: string;
  status?: "ACTIVE" | "HIDDEN" | "DELETED_BY_USER" | "DELETED_BY_ADMIN"; // Updated based on new status policy
  parent_id?: number | null; // Mapped from API's parent_comment_id
  stance?: "LEFT" | "RIGHT" | "NEUTRAL"; // For topic comments
  children?: Comment[]; // Mapped from API's replies
  like_count?: number;
  dislike_count?: number;
  currentUserReaction?: "LIKE" | "DISLIKE" | null;
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
  avatar_url?: string;
  stance?: "LEFT" | "RIGHT" | "NEUTRAL";
  replies?: ApiComment[]; // Nested replies
  like_count?: number;
  dislike_count?: number;
  current_user_reaction?: "LIKE" | "DISLIKE" | null;
  currentUserReaction?: "LIKE" | "DISLIKE" | null; // Added to support potential camelCase response from API
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
  total_votes?: number;
  comment_count?: number;
  collection_status?: string;
  vote_count_left?: number;
  vote_count_right?: number;
  stance_left?: string;
  stance_right?: string;
  vote_start_at?: string;
  vote_end_at?: string;
  my_vote?: "LEFT" | "RIGHT" | null;
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

/**
 * @interface CommentReactionUpdate
 * @description 댓글 반응(좋아요/싫어요) API 응답 데이터 구조
 */
export interface CommentReactionUpdate {
  like_count: number;
  dislike_count: number;
  currentUserReaction: "LIKE" | "DISLIKE" | null;
}

/**
 * API에서 받아오는 문의(Inquiry) 데이터 구조 정의
 */
export interface Inquiry {
  id: number;
  subject: string;
  content: string;
  status: "SUBMITTED" | "ANSWERED" | "CLOSED"; // 예시 상태
  created_at: string;
  updated_at: string;
  user_id: number;
  file_path?: string; // 문의 관련 파일 경로 (옵션)
  file_originalname?: string; // 첨부 파일의 원본 이름 (옵션)
  reply?: InquiryReply; // 문의 답변 객체 (옵션)
}

/**
 * 문의 답변 데이터 구조 정의
 */
export interface InquiryReply {
  content: string;
  created_at: string;
}

export interface LinkMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}
