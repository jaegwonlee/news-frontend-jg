export interface DebateRoom {
  id: string;
  title: string;
  participants: number;
  comments: number;
  createdAt: Date;
}

// Mock data for all debate rooms
export const allDebateRooms: DebateRoom[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `room-${i + 1}`,
  title: `논쟁 주제 ${i + 1}: ${i % 5 === 0 ? '이것은 정말 중요한 문제입니다.' : i % 3 === 0 ? '과연 옳은 일일까요?' : '새로운 시각으로 바라보기'}`,
  participants: Math.floor(Math.random() * 50) + 5,
  comments: Math.floor(Math.random() * 100) + 10,
  createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7), // Created within the last week
}));

// Mock data for Exclusive News
export const exclusiveNews = Array.from({ length: 10 }).map((_, i) => ({
  id: `exclusive-${i + 1}`,
  title: `[단독] 단독 보도입니다. ${i + 1}`,
  source: '뉴스 통신사',
}));

// Mock data for Flash News
export const flashNews = Array.from({ length: 10 }).map((_, i) => ({
  id: `flash-${i + 1}`,
  title: `[속보] 새로운 소식이 있습니다. ${i + 1}`,
  source: '속보 채널',
}));

// Mock data for Politics News
export const politicsNews = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  url: '#',
  thumbnail_url: `https://picsum.photos/seed/politics${i}/400/300`,
  title: `정치 기사 제목 ${i + 1}: 중요한 정치적 사건`,
  description: `정치 기사 내용 요약 ${i + 1}`,
  source: `정치 뉴스 ${i + 1}`,
  source_domain: 'politics.news.com',
  favicon_url: '/favicon.ico',
  published_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 2).toISOString(),
  category: '정치',
}));

// Mock data for Economy News
export const economyNews = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 11, // Changed starting id to avoid collision with politics
  url: '#',
  thumbnail_url: `https://picsum.photos/seed/economy${i}/400/300`,
  title: `경제 기사 제목 ${i + 1}: 경제 동향 분석`,
  description: `경제 기사 내용 요약 ${i + 1}`,
  source: `경제 뉴스 ${i + 1}`,
  source_domain: 'economy.news.com',
  favicon_url: '/favicon.ico',
  published_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 3).toISOString(),
  category: '경제',
}));
