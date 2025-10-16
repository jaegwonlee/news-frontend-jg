"use client";

import ChatRoom from "@/components/common/ChatRoom";
import { useParams } from "next/navigation";

export default function DebateRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  return (
    <div className="container mx-auto px-4 mt-8">
      <h1 className="text-3xl font-bold mb-4">논쟁방: {roomId}</h1>
      {/* 따옴표 문제를 해결하기 위해 백틱(`)을 사용했습니다.
       */}
      <p className="mb-8">{`주제: "${roomId}"에 대한 실시간 논쟁방입니다.`}</p>

      {/* ChatRoom 컴포넌트에 필수 속성인 title을 추가했습니다.
       */}
      <ChatRoom title="실시간 토론" />
    </div>
  );
}
