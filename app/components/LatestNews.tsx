// 최신 뉴스 목업 데이터
type NewsItem = {
  id: number;
  title: string;
  source: string;
  thumbnailUrl: string; // 썸네일 URL (지금은 placeholder 사용)
};

const mockNews: NewsItem[] = [
  {
    id: 1,
    title: "올해 대기업 신입 채용, '역대급·복지'...",
    source: "중앙일보",
    thumbnailUrl: "/placeholder-img.jpg", // 실제 이미지 경로
  },
  {
    id: 2,
    title: "11월 중순, 문 열기 동동... 마지막 분양...",
    source: "중앙일보",
    thumbnailUrl: "/placeholder-img.jpg",
  },
  {
    id: 3,
    title: "11월 수도권 아파트 입주물량 전월 대비 ...",
    source: "아시아투데이",
    thumbnailUrl: "/placeholder-img.jpg",
  },
  {
    id: 4,
    title: "애 낳고 나을 리 없는 '코피노' 아빠... 얼굴 공...",
    source: "중앙일보",
    thumbnailUrl: "/placeholder-img.jpg",
  },
  {
    id: 5,
    title: "70년 전 행방불명된 남편 흔적... 지구 반대편...",
    source: "조선일보",
    thumbnailUrl: "/placeholder-img.jpg",
  },
];

export default function LatestNews({ className }: { className?: string }) {
  const newsItems = mockNews;

  return (
    <aside className={`bg-zinc-900 p-4 rounded-lg ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-white">최신 뉴스</h2>
        <a href="#" className="text-xs text-zinc-400 hover:text-white">
          전체보기
        </a>
      </div>
      <div className="space-y-4">
        {newsItems.map((item) => (
          <div key={item.id} className="flex gap-3 items-start cursor-pointer group">
            {/* 썸네일 (지금은 색상으로 대체) */}
            <div className="w-24 h-16 bg-zinc-700 rounded-md shrink-0 group-hover:opacity-80">
              {/* 나중에 API 연동 시 <Image> 태그 사용 */}
              {/* <Image src={item.thumbnailUrl} alt={item.title} width={96} height={64} className="object-cover rounded-md" /> */}
            </div>

            {/* 제목 및 출처 */}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white mb-1 group-hover:underline">{item.title}</h3>
              <span className="text-xs text-zinc-500">{item.source}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
