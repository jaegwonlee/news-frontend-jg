import { User, Article, NotificationSetting, SavedArticleCategory } from "@/types";
import { mockPoliticsNews, mockEconomyNews } from "./articles"; // Reusing mock articles

// Mock User Profile
export const mockUserProfile: User = {
  id: 1,
  email: 'mockuser@example.com',
  name: '모의 사용자',
  nickname: '모의유저123',
  phone: '010-1234-5678',
  profile_image_url: '/user-placeholder.svg', // Placeholder image
  introduction: '안녕하세요! 프론트엔드 개발을 위해 로그인된 모의 사용자입니다. 즐거운 개발 되세요!',
};

// Mock Liked Articles (reuse some from mockArticles)
export const mockLikedArticles: Article[] = [
  { ...mockPoliticsNews[0], isLiked: true },
  { ...mockEconomyNews[1], isLiked: true },
  {
    id: 1001,
    source: "Mock Likes",
    source_domain: "mocklikes.com",
    title: "좋아요 누른 기사 1 (목업)",
    url: "#",
    published_at: "2025-11-20T10:00:00Z",
    thumbnail_url: "https://via.placeholder.com/150",
    favicon_url: "https://via.placeholder.com/16",
    isLiked: true,
  },
  {
    id: 1002,
    source: "Mock Likes",
    source_domain: "mocklikes.com",
    title: "좋아요 누른 기사 2 (목업)",
    url: "#",
    published_at: "2025-11-19T10:00:00Z",
    thumbnail_url: "https://via.placeholder.com/150",
    favicon_url: "https://via.placeholder.com/16",
    isLiked: true,
  },
];

// Mock Saved Articles (reuse some from mockArticles, add categories)
export const mockSavedArticles: Article[] = [
  { ...mockPoliticsNews[1], isSaved: true, saved_article_id: 2001, category_id: 100 },
  { ...mockEconomyNews[0], isSaved: true, saved_article_id: 2002, category_id: 101 },
  {
    id: 2003,
    source: "Mock Saves",
    source_domain: "mocksaves.com",
    title: "저장된 기사 1 (목업)",
    url: "#",
    published_at: "2025-11-18T10:00:00Z",
    thumbnail_url: "https://via.placeholder.com/150",
    favicon_url: "https://via.placeholder.com/16",
    isSaved: true,
    saved_article_id: 2003,
    category_id: null, // Uncategorized
  },
  {
    id: 2004,
    source: "Mock Saves",
    source_domain: "mocksaves.com",
    title: "저장된 기사 2 (목업)",
    url: "#",
    published_at: "2025-11-17T10:00:00Z",
    thumbnail_url: "https://via.placeholder.com/150",
    favicon_url: "https://via.placeholder.com/16",
    isSaved: true,
    saved_article_id: 2004,
    category_id: 100, // Tech Category
  },
];

export const mockSavedArticleCategories: SavedArticleCategory[] = [
  { id: 100, name: '읽을거리', article_count: 2 },
  { id: 101, name: '나중에 볼 기사', article_count: 1 },
  { id: 102, name: '연구 자료', article_count: 0 },
];


// Mock Avatars
export const mockAvatars: string[] = [
  "/avatars/default.svg",
  "/avatars/blue--glove.svg",
  "/avatars/red--glove.svg",
  "https://via.placeholder.com/64/FF0000/FFFFFF?text=A1",
  "https://via.placeholder.com/64/00FF00/000000?text=A2",
];

// Mock Notification Settings
export const mockNotificationSettings: NotificationSetting[] = [
  { notification_type: "NEW_TOPIC", is_enabled: true },
  { notification_type: "BREAKING_NEWS", is_enabled: false },
  { notification_type: "EXCLUSIVE_NEWS", is_enabled: true },
];
