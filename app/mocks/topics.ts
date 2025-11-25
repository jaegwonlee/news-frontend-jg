import { Topic, TopicDetail, Article } from "@/types";

// Mock Articles to be used within the mock TopicDetail
const mockArticlesForTopic: Article[] = [
  {
    id: 101,
    source: "Mock News",
    source_domain: "mock.news",
    title: "목업 데이터로 보는 주요 뉴스 1: 경제 전망",
    url: "#",
    published_at: "2025-11-24T10:00:00Z",
    thumbnail_url: "https://via.placeholder.com/150",
    favicon_url: "https://via.placeholder.com/16",
    summary: "백엔드 없이 프론트엔드 UI를 테스트하기 위한 목업 기사입니다. 이 기사는 경제에 대한 내용을 다룹니다.",
    side: "LEFT",
    view_count: 1200,
    like_count: 45,
    isLiked: false,
    isSaved: false,
    comment_count: 12,
  },
  {
    id: 102,
    source: "Data Times",
    source_domain: "data.times",
    title: "목업 데이터로 보는 주요 뉴스 2: 사회 현상",
    url: "#",
    published_at: "2025-11-24T11:00:00Z",
    thumbnail_url: "https://via.placeholder.com/150",
    favicon_url: "https://via.placeholder.com/16",
    summary: "사회적 거리두기 이후의 변화에 대한 목업 기사입니다. 다양한 관점을 제공합니다.",
    side: "RIGHT",
    view_count: 2500,
    like_count: 120,
    isLiked: true,
    isSaved: false,
    comment_count: 34,
  },
];

// Mock TopicDetail for the main page chat room (topic ID 1)
export const mockMainTopicDetail: TopicDetail = {
  topic: {
    id: 1,
    display_name: "메인 토픽 (목업)",
    summary: "이것은 백엔드 서버 없이 프론트엔드 UI를 테스트하기 위한 목업 토픽입니다. 실시간 채팅방의 제목과 설명으로 사용됩니다.",
    published_at: "2025-11-24T09:00:00Z",
    view_count: 12345,
  },
  articles: mockArticlesForTopic,
};

// Mock list of popular topics
export const mockPopularTopics: Topic[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 2, // Start from ID 2 to avoid collision with main topic
  display_name: `인기 토픽 ${i + 1} (목업)`,
  summary: `이것은 인기 토픽 목록을 테스트하기 위한 ${i + 1}번째 목업 데이터입니다.`,
  published_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  view_count: 10000 - i * 500,
  popularity_score: 95.5 - i * 2,
}));

// Mock list of latest topics
export const mockLatestTopics: Topic[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 12, // Use a different ID range
  display_name: `최신 토픽 ${i + 1} (목업)`,
  summary: `이것은 최신 토픽 목록을 테스트하기 위한 ${i + 1}번째 목업 데이터입니다.`,
  published_at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(), // More recent dates
  view_count: 150 + i * 50,
}));
