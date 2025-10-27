import { Send } from "lucide-react";

// 채팅 메시지 목업 데이터
type Message = {
  id: number;
  user: string;
  text: string;
  time: string;
};

const mockMessages: Message[] = [
  { id: 1, user: "사용자", text: "채팅방에 환영합니다.", time: "17:33" },
  { id: 2, user: "길순", text: "네네", time: "17:35" },
  { id: 3, user: "test", text: "sdfsdfsdfsd", time: "17:46" },
  { id: 4, user: "사용자", text: "sdfsdfsdfsdf", time: "17:46" },
  { id: 5, user: "sfsffff", text: "test", time: "17:47" },
  { id: 6, user: "sfsffff", text: "sdfsdfsdfsd", time: "17:47" },
];

export default function ChatRoom({ className }: { className?: string }) {
  const messages = mockMessages;

  return (
    <section className={`bg-zinc-900 p-4 rounded-lg flex flex-col ${className}`}>
      <h2 className="text-lg font-bold text-white mb-4">메인 페이지 채팅방</h2>

      {/* 메시지 목록 (flex-1로 남은 공간 채우기) */}
      <div className="flex-1 h-96 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-semibold text-white">{msg.user}</span>
              <span className="text-xs text-zinc-500">{msg.time}</span>
            </div>
            <p className="text-sm text-white bg-zinc-800 p-2 rounded-md w-fit max-w-full wrap-break-word">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* 입력창 */}
      <div className="mt-4">
        <p className="text-xs text-zinc-500 text-center mb-2">채팅에 참여하려면 로그인이 필요합니다.</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="로그인 후 이용 가능합니다."
            disabled
            className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-zinc-400 disabled:cursor-not-allowed"
          />
          <button
            disabled
            className="p-2 bg-blue-600 rounded-md text-white disabled:bg-zinc-700 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
