/**
 * 정치 카테고리 페이지 (경로: /politics)
 */

import CategoryNewsList from "../components/CategoryNewsList";
// 만약 나중에 사이드바를 다시 추가한다면 import합니다.
// import TrendingTopics from "../components/TrendingTopics";
// import LatestNews from "../components/LatestNews";

export default function PoliticsPage() {
  return (
    // 👇 이 div에 배경색 클래스(예: bg-white)가 없는지 확인합니다.
    // layout.tsx의 body 배경색(bg-black)이 적용되어야 합니다.
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* 현재는 CategoryNewsList만 표시 */}
      <CategoryNewsList categoryName="정치" />

      {/* 나중에 그리드 레이아웃을 다시 적용한다면 아래 구조 사용 */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <TrendingTopics className="lg:col-span-1" />
        <CategoryNewsList categoryName="정치" className="lg:col-span-2" />
        <LatestNews className="lg:col-span-1" />
      </div> */}
    </div>
  );
}
