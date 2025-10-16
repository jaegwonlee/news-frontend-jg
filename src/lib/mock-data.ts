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
