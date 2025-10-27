/**
 * 사회 카테고리 페이지 (경로: /social)
 * - '사회' 뉴스를 보여주는 페이지입니다.
 */

// 사회 뉴스 목록을 표시할 컴포넌트를 가져옵니다.
import CategoryNewsList from "../components/CategoryNewsList";

export default function SocialPage() {
  return (
    // 페이지 전체를 감싸는 div. 최대 너비와 좌우 여백(mx-auto), 상하좌우 패딩(p-*)을 설정합니다.
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* CategoryNewsList 컴포넌트를 렌더링하고, categoryName으로 "사회"를 전달합니다. */}
      <CategoryNewsList categoryName="사회" />
    </div>
  );
}
