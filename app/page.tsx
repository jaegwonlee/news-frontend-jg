// app/page.tsx

/**
 * 메인 페이지 (경로: /)
 * - 사이트 접속 시 가장 먼저 보이는 페이지입니다.
 * - 상단: 3단 레이아웃(인기 토픽, 채팅방, 최신 뉴스)
 * - 하단: 카테고리별 뉴스 섹션 (정치, 경제 등)
 */

// 메인 페이지에서 사용될 컴포넌트들을 가져옵니다.
import ChatRoom from "./components/ChatRoom";
import LatestNews from "./components/LatestNews";
import TrendingTopics from "./components/TrendingTopics";
// 1. 새로 만든 CategoryNewsSection을 import 합니다.
import CategoryNewsSection from "./components/CategoryNewsSection";

export default function Home() {
  return (
    // 페이지 전체를 감싸는 div
    <div className="w-full mx-auto p-4 px-8">
      
      {/* --- 기존 3단 레이아웃 (상단) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 왼쪽 사이드바 (인기 토픽) */}
        <TrendingTopics className="lg:col-start-2 lg:col-span-2" />

        {/* 중앙 컨텐츠 (채팅방) */}
        <ChatRoom className="lg:col-start-5 lg:col-span-4" />

        {/* 오른쪽 사이드바 (최신 뉴스) */}
        <LatestNews className="lg:col-start-10 lg:col-span-2" />

        {/* --- 2. 새로 추가된 카테고리별 뉴스 (하단) --- */}
        <div className="lg:col-start-2 lg:col-span-10">
          {/* '정치' 섹션 */}
          <CategoryNewsSection
            title="정치"
            categoryName="정치"
            linkUrl="/politics" // '정치' 페이지로 이동
          />

          {/* '경제' 섹션 */}
          <CategoryNewsSection
            title="경제"
            categoryName="경제"
            linkUrl="/economy" // '경제' 페이지로 이동
          />

          {/* '사회' 섹션 (이미지에는 없지만 추가 가능) */}
          <CategoryNewsSection
            title="사회"
            categoryName="사회"
            linkUrl="/social"
          />



          {/* '문화' 섹션 (이미지에는 없지만 추가 가능) */}
          <CategoryNewsSection
            title="문화"
            categoryName="문화"
            linkUrl="/culture"
          />
        </div>
      </div>
      
    </div>
  );
}