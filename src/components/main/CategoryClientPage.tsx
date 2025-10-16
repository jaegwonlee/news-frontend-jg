"use client";

import NewsCard from "@/components/news/NewsCard";
import ChatRoom from "@/components/common/ChatRoom";
import { Article } from "@/types/article";

interface CategoryClientPageProps {
  categoryName: string;
  chatRoomTitle: string;
}

// 임시 데이터
const placeholderArticles: Article[] = [
  {
    id: "1",
    link: "#",
    title: "임시 뉴스 제목 1: 카테고리 소식",
    description: "이것은 임시 뉴스 내용의 일부입니다. 전체 내용을 보려면 클릭하세요.",
    source: "임시 언론사",
    date: "2025-10-15",
    imageUrl: "/placeholder-image.png",
    category: "temp",
  },
  {
    id: "2",
    link: "#",
    title: "임시 뉴스 제목 2: 주요 업데이트",
    description: "두 번째 임시 뉴스입니다. 다양한 소식을 전달합니다.",
    source: "뉴스 네트워크",
    date: "2025-10-15",
    imageUrl: "/placeholder-image.png",
    category: "temp",
  },
  {
    id: "3",
    link: "#",
    title: "임시 뉴스 제목 3: 심층 분석",
    description: "세 번째 뉴스는 심층 분석 기사입니다. 많은 관심 바랍니다.",
    source: "데일리 리포트",
    date: "2025-10-14",
    imageUrl: "/placeholder-image.png",
    category: "temp",
  },
    {
    id: "4",
    link: "#",
    title: "임시 뉴스 제목 4: 현장 스케치",
    description: "네 번째 뉴스는 현장 스케치입니다. 생생한 소식을 전합니다.",
    source: "현장 뉴스",
    date: "2025-10-14",
    imageUrl: "/placeholder-image.png",
    category: "temp",
  },
    {
    id: "5",
    link: "#",
    title: "임시 뉴스 제목 5: 추가 소식",
    description: "다섯 번째 뉴스입니다. 계속해서 업데이트 됩니다.",
    source: "정보 센터",
    date: "2025-10-13",
    imageUrl: "/placeholder-image.png",
    category: "temp",
  },
];

export default function CategoryClientPage({ categoryName, chatRoomTitle }: CategoryClientPageProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4 pt-6">
      <div className="lg:col-span-2">
        <div className="flex items-center mb-6">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
          <h1 className="text-4xl font-extrabold text-white">{categoryName}</h1>
        </div>
        <div>
          {placeholderArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </div>
      <div className="lg:col-span-1 lg:sticky lg:top-24 h-[calc(100vh-150px)]">
        <ChatRoom title={chatRoomTitle} />
      </div>
    </div>
  );
}
