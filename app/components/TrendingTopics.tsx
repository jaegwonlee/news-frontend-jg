// 인기 토픽 목업 데이터
// API 연동 시 이 부분을 fetch 결과로 대체합니다.
type Topic = {
  id: number;
  title: string;
  rank: number;
  views: number;
};

const mockTopics: Topic[] = [
  { id: 1, title: "정보미디어 인사청문", rank: 1, views: 22 },
  { id: 2, title: "해킹", rank: 2, views: 10 },
  { id: 3, title: "통화스와프", rank: 3, views: 8 },
  { id: 4, title: "북한 단거리 탄도미사일", rank: 4, views: 11 },
  { id: 5, title: "윤석열 현충원 참배", rank: 5, views: 7 },
  { id: 6, title: "대형마트 3,500억", rank: 6, views: 7 },
  { id: 7, title: "국가 원산지 정책", rank: 7, views: 6 },
  { id: 8, title: "유엔총회", rank: 8, views: 8 },
  { id: 9, title: "APEC 경제", rank: 9, views: 5 },
  { id: 10, title: "정부조직법 개정", rank: 10, views: 4 },
];

// 'className'을 props로 받아 유연하게 스타일을 적용할 수 있게 합니다.
export default function TrendingTopics({ className }: { className?: string }) {
  // 목업 데이터를 사용합니다.
  const topics = mockTopics;

  return (
    <aside className={`bg-zinc-900 p-4 rounded-lg ${className}`}>
      <h2 className="text-lg font-bold text-white mb-4">인기 토픽</h2>
      <ol className="space-y-3">
        {topics.map((topic, index) => (
          <li key={topic.id} className="flex items-center gap-3">
            <span className={`text-lg font-bold w-5 text-center ${index < 3 ? "text-blue-400" : "text-zinc-400"}`}>
              {topic.rank}
            </span>
            <span className="flex-1 text-sm text-white hover:underline cursor-pointer">{topic.title}</span>
            <span className="text-xs text-zinc-500">조회수: {topic.views}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
