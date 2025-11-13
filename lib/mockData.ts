import { Article } from '@/types';

// Helper function to create a unique article
const createArticle = (baseArticle: Article, index: number): Article => {
  const newId = parseInt(`${baseArticle.id}${index}`);
  return {
    ...baseArticle,
    id: newId,
    title: `${baseArticle.title} #${index + 1}`,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * index).toISOString(),
    view_count: Math.floor(Math.random() * 5000) + 100,
    like_count: Math.floor(Math.random() * 1000) + 10,
    thumbnail_url: `https://picsum.photos/seed/${newId}/300/200`, // picsum.photos 사용
  };
};

// Base articles for each category
const basePolitics: Article = {
  id: 100,
  source: "가상뉴스",
  source_domain: "example.com",
  side: "LEFT",
  title: "[정치] 새로운 정책 발표",
  url: "#",
  published_at: new Date().toISOString(),
  thumbnail_url: "https://picsum.photos/seed/100/300/200", // Placeholder
  view_count: 1200,
  category: "정치",
  description: "국회에서 새로운 정책에 대한 열띤 토론이 있었습니다.",
  like_count: 150,
  isLiked: false,
  favicon_url: "https://www.google.com/s2/favicons?domain=example.com"
};

const baseEconomy: Article = {
  id: 200,
  source: "이코노미 타임즈",
  source_domain: "example.com",
  title: "[경제] 기준 금리 관련 소식",
  url: "#",
  published_at: new Date().toISOString(),
  thumbnail_url: "https://picsum.photos/seed/200/300/200", // Placeholder
  view_count: 3100,
  category: "경제",
  description: "한국은행 금융통화위원회에서 기준 금리에 대한 발표가 있었습니다.",
  like_count: 450,
  isLiked: false,
  favicon_url: "https://www.google.com/s2/favicons?domain=example.com"
};

const baseSocial: Article = {
  id: 300,
  source: "소셜 투데이",
  source_domain: "example.com",
  side: "LEFT",
  title: "[사회] 새로운 사회 현상",
  url: "#",
  published_at: new Date().toISOString(),
  thumbnail_url: "https://picsum.photos/seed/300/300/200", // Placeholder
  view_count: 4500,
  category: "사회",
  description: "최근 우리 사회에 나타난 새로운 현상에 대해 심층 분석합니다.",
  like_count: 890,
  isLiked: true,
  favicon_url: "https://www.google.com/s2/favicons?domain=example.com"
};

const baseCulture: Article = {
  id: 400,
  source: "컬쳐 위클리",
  source_domain: "example.com",
  title: "[문화] K-콘텐츠의 새로운 성공",
  url: "#",
  published_at: new Date().toISOString(),
  thumbnail_url: "https://picsum.photos/seed/400/300/200", // Placeholder
  view_count: 5800,
  category: "문화",
  description: "전 세계를 휩쓴 K-콘텐츠의 또 다른 성공 신화를 조명합니다.",
  like_count: 1200,
  isLiked: true,
  favicon_url: "https://www.google.com/s2/favicons?domain=example.com"
};

// Generate 50 articles for each category
const politicsArticles = Array.from({ length: 50 }, (_, i) => createArticle(basePolitics, i));
const economyArticles = Array.from({ length: 50 }, (_, i) => createArticle(baseEconomy, i));
const socialArticles = Array.from({ length: 50 }, (_, i) => createArticle(baseSocial, i));
const cultureArticles = Array.from({ length: 50 }, (_, i) => createArticle(baseCulture, i));

export const mockArticles: Article[] = [
  ...politicsArticles,
  ...economyArticles,
  ...socialArticles,
  ...cultureArticles,
];
