'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, Loader2, AlertTriangle } from 'lucide-react';
import { useSocket } from '@/app/context/SocketContext';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import { getChatHistory, ApiChatMessage, sendChatMessage } from '@/lib/api/topics';

// 1. API 응답과 UI에서 사용할 메시지 타입을 통일합니다.
// (lib/api/topics.ts의 ApiChatMessage와 UI용 Message를 합침)
type Message = {
  id: number;
  author: string;
  message: string;
  profile_image_url?: string;
  created_at: string; // ISO 문자열 원본을 저장
};

// 2. 시간 포맷 헬퍼 함수
const formatTimestamp = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_e) {
    return '--:--';
  }
};

interface ChatRoomProps {
  topicId?: number;
}

export default function ChatRoom({ topicId }: ChatRoomProps) {
  const { socket, isConnected, error: socketError } = useSocket();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(!!topicId);
  const [isSending, setIsSending] = useState(false); // 3. 메시지 전송 중 상태 추가
  const room = topicId ? `topic-${topicId}` : 'mainpage';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 4. [수정] 과거 기록(History) 불러오기
  // (백엔드 GET /chat의 응답 형식 { id, content, created_at, nickname }에 맞춤)
  useEffect(() => {
    if (topicId) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        // lib/api/topics.ts의 getChatHistory가 백엔드 응답을 변환해줍니다.
        const history: ApiChatMessage[] = await getChatHistory(topicId, 100);
        
        // 5. 프론트엔드 Message 타입으로 완전 변환
        const formattedHistory: Message[] = history.map((msg) => ({
          id: msg.id,
          author: msg.author,
          message: msg.message,
          profile_image_url: msg.profile_image_url,
          created_at: msg.created_at, // 원본 ISO 문자열 저장
        }));
        
        setMessages(formattedHistory);
        setIsLoadingHistory(false);
        setTimeout(() => scrollToBottom('auto'), 100);
      };
      fetchHistory();
    }
  }, [topicId]);

  // 6. 소켓 리스너 설정
  // (백엔드 POST /chat -> emit "receive_message" 이벤트 수신)
  useEffect(() => {
    if (socket) {
      // 6-1. 백엔드 socket.ts의 "join_room" 이벤트에 연결
      socket.emit('join_room', room);

      // 6-2. 백엔드 chat.ts의 "receive_message" 이벤트 수신
      const messageListener = (data: ApiChatMessage) => {
        // 6-3. 백엔드 POST 응답 페이로드 { id, message, created_at, author, profile_image_url } 수신
        const receivedMessage: Message = {
          id: data.id,
          author: data.author,
          message: data.message,
          profile_image_url: data.profile_image_url,
          created_at: data.created_at,
        };
        // 6-4. 새 메시지를 상태에 추가
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      };
      socket.on('receive_message', messageListener);

      return () => {
        socket.off('receive_message', messageListener);
      };
    }
  }, [socket, room]);

  // 7. 새 메시지 추가 시 스크롤
  useEffect(() => {
    if (!isLoadingHistory) {
      scrollToBottom();
    }
  }, [messages, isLoadingHistory]);

  // 8. [수정] 메시지 전송 핸들러
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topicId && isConnected && newMessage.trim() && user && token && !isSending) {
      const messageToSend = newMessage;
      setNewMessage(''); // 9. 입력창 즉시 비우기
      setIsSending(true); // 10. 전송 중 상태로 변경

      try {
        // 11. [수정] Optimistic Update(setMessages) 제거!
        // 서버에 POST 요청만 보냅니다. (lib/api/topics.ts)
        await sendChatMessage(topicId, messageToSend, token);
        // 12. 성공! 메시지는 백엔드가 "receive_message" 소켓으로 다시 보내줄 것임.
      } catch (error) {
        console.error("Failed to send message:", error);
        // 13. 실패 시, 입력했던 메시지를 다시 입력창에 복원
        setNewMessage(messageToSend);
        alert("메시지 전송에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setIsSending(false); // 14. 전송 중 상태 해제
      }
    }
  };

  const getPlaceholderText = () => {
    if (socketError) return '실시간 채팅 서버에 연결할 수 없습니다.';
    if (!isConnected) return '실시간 채팅 서버에 연결 중...';
    if (!user) return '로그인 후 이용 가능합니다.';
    return '메시지를 입력하세요...';
  };

  return (
    <div className="flex flex-col h-[600px] bg-zinc-900 p-4 rounded-lg">
      {/* Message List */}
      <div className="grow overflow-y-auto space-y-4 pr-2">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
            <p className="ml-2 text-zinc-400">이전 대화 기록을 불러오는 중...</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isMyMessage = user ? msg.author === (user.nickname || user.name) : false;
              return (
                <div
                  key={msg.id || `msg-${index}`} // 15. DB ID 사용
                  className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  {!isMyMessage && (
                    <Image
                      src={msg.profile_image_url || '/user-placeholder.svg'}
                      alt={`${msg.author}'s profile`}
                      width={32}
                      height={32}
                      className="rounded-full object-cover self-start"
                    />
                  )}
                  <div className={`flex flex-col gap-1 ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    {!isMyMessage && (
                      <span className="text-xs text-zinc-400 ml-1">{msg.author}</span>
                    )}
                    <div className={`flex gap-2 items-end ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className={`p-3 rounded-lg max-w-xs lg:max-w-md break-words ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-white'}`}>
                        <p>{msg.message}</p>
                      </div>
                      {/* 16. 포맷팅된 시간 사용 */}
                      <span className="text-xs text-zinc-500 whitespace-nowrap">{formatTimestamp(msg.created_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-4 shrink-0">
        {socketError && (
          <div className="flex items-center text-red-500 text-xs mb-2">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {socketError}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            placeholder={getPlaceholderText()}
            disabled={!isConnected || !user || !!socketError || isSending} // 17. 전송 중(isSending)일 때 비활성화
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-400 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConnected || !user || !!socketError || !newMessage.trim() || isSending} // 18. 전송 중(isSending)일 때 비활성화
            className="p-2 bg-blue-600 rounded-md text-white disabled:bg-zinc-700 disabled:cursor-not-allowed"
          >
            {/* 19. 전송 중일 때 로딩 스피너 표시 */}
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
