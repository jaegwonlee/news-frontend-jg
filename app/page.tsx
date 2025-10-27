/**
 * 메인 페이지 (경로: /)
 * - 사이트 접속 시 가장 먼저 보이는 페이지입니다.
 * - 3단 레이아웃(인기 토픽, 채팅방, 최신 뉴스)을 표시합니다.
 */

// 메인 페이지에서 사용될 컴포넌트들을 가져옵니다.
import ChatRoom from "./components/ChatRoom";
import LatestNews from "./components/LatestNews";
import TrendingTopics from "./components/TrendingTopics";

export default function Home() {
  return (
    // 👇 이 div에 배경색 클래스(예: bg-white)가 없는지 확인합니다.
    // layout.tsx의 body 배경색(bg-black)이 적용되어야 합니다.
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 왼쪽 사이드바 (인기 토픽) */}
        <TrendingTopics className="lg:col-span-1" />

        {/* 중앙 컨텐츠 (채팅방) */}
        <ChatRoom className="lg:col-span-2" />

        {/* 오른쪽 사이드바 (최신 뉴스) */}
        <LatestNews className="lg:col-span-1" />
      </div>
    </div>
  );
}
