import { Article } from "@/types";

// A utility function to create diverse mock articles
const createArticle = (id: number, category: string, options: Partial<Article> = {}): Article => ({
  id,
  source: `출처 ${id}`,
  source_domain: `source${id}.com`,
  title: `${category} 카테고리 목업 기사 ${id}: ${options.title || '다양한 UI 테스트를 위한 제목'}`,
  url: "#",
  published_at: new Date(Date.now() - id * 3 * 60 * 60 * 1000).toISOString(),
  thumbnail_url: `https://picsum.photos/seed/${id}/400/300`,
  favicon_url: `https://www.google.com/s2/favicons?domain=source${id}.com`,
  summary: `이것은 ${category} 기사에 대한 목업 데이터입니다. 본문 요약이 여기에 표시됩니다. 텍스트가 길어지면 어떻게 보이는지 테스트하기 위해 조금 더 긴 문장을 사용합니다.`,
  view_count: 5000 - id * 150,
  like_count: 100 - id * 5,
  comment_count: 20 - id,
  ...options,
});

export const mockBreakingNews: Article[] = [
  createArticle(201, "속보", { title: "긴급 속보: 프론트엔드 목업 데이터 성공적으로 로드" }),
  createArticle(202, "속보", { title: "백엔드 서버 없이도 UI 개발 가능해져" }),
  createArticle(203, "속보", { title: "사용자 경험 개선을 위한 대규모 업데이트" }),
  createArticle(204, "속보", { title: "리팩토링, 코드 품질을 높이는가?" }),
  createArticle(205, "속보", { title: "테스트 주도 개발의 중요성" }),
];

export const mockExclusiveNews: Article[] = [
  createArticle(301, "단독", { title: "[단독] '오로라 글래스' 디자인, 차세대 UI 트렌드로 부상", side: "LEFT", is_featured: 1 }),
  createArticle(302, "단독", { title: "[단독] 목업 데이터의 비밀: 개발 효율성 200% 증가 비결은?", side: "RIGHT", is_featured: 1 }),
];

export const mockPoliticsNews: Article[] = Array.from({ length: 10 }, (_, i) => createArticle(401 + i, "정치"));
export const mockEconomyNews: Article[] = Array.from({ length: 10 }, (_, i) => createArticle(501 + i, "경제"));
export const mockSocialNews: Article[] = Array.from({ length: 10 }, (_, i) => createArticle(601 + i, "사회"));
export const mockCultureNews: Article[] = Array.from({ length: 10 }, (_, i) => createArticle(701 + i, "문화"));
export const mockSportsNews: Article[] = Array.from({ length: 10 }, (_, i) => createArticle(801 + i, "스포츠"));

export const mockAllCategoryNews: { [key: string]: Article[] } = {
  "정치": mockPoliticsNews,
  "경제": mockEconomyNews,
  "사회": mockSocialNews,
  "문화": mockCultureNews,
  "스포츠": mockSportsNews,
};

export let mockSavedArticles: Article[] = [
  createArticle(901, "저장", { saved_article_id: 1, isSaved: true, category_id: 1 }),
  createArticle(902, "저장", { saved_article_id: 2, isSaved: true, category_id: 1 }),
  createArticle(903, "저장", { saved_article_id: 3, isSaved: true, category_id: null }),
  createArticle(904, "저장", { saved_article_id: 4, isSaved: true, category_id: 2 }),
  createArticle(905, "저장", { saved_article_id: 5, isSaved: true, category_id: null }),
];
