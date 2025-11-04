'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, Loader2, AlertTriangle } from 'lucide-react';
import { useSocket } from '@/app/context/SocketContext';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import { getChatHistory, ApiChatMessage } from '@/lib/api/topics';

// Unified message type for the component
type Message = {
  author: string;
  message: string;
  profile_image_url?: string;
  timestamp: string;
};

// Helper to format date string into HH:MM
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
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(!!topicId);
  const room = topicId ? `topic-${topicId}` : 'mainpage';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch chat history on mount
  useEffect(() => {
    if (topicId) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        const history = await getChatHistory(topicId, 100);
        const formattedHistory = history.map((msg: ApiChatMessage) => ({
          author: msg.nickname,
          message: msg.content,
          profile_image_url: msg.profile_image_url,
          timestamp: formatTimestamp(msg.created_at),
        }));
        setMessages(formattedHistory);
        setIsLoadingHistory(false);
        setTimeout(() => scrollToBottom('auto'), 100);
      };
      fetchHistory();
    }
  }, [topicId]);

  // Setup socket listeners
  useEffect(() => {
    if (socket) {
      socket.emit('join_room', room);
      const messageListener = (data: Omit<Message, 'timestamp' | 'profile_image_url'> & { profile_image_url?: string }) => {
        const messageWithTimestamp: Message = {
          ...data,
          profile_image_url: data.profile_image_url,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prevMessages) => [...prevMessages, messageWithTimestamp]);
      };
      socket.on('receive_message', messageListener);
      return () => {
        socket.off('receive_message', messageListener);
      };
    }
  }, [socket, room]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (!isLoadingHistory) {
      scrollToBottom();
    }
  }, [messages, isLoadingHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && isConnected && newMessage.trim() && user) {
      socket.emit('send_message', {
        room: room,
        message: newMessage,
      });
      setNewMessage('');
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
                  key={index}
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
                        className={`p-3 rounded-lg max-w-xs lg:max-w-md wrap-break-word ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-white'}`}>
                        <p>{msg.message}</p>
                      </div>
                      <span className="text-xs text-zinc-500 whitespace-nowrap">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}<div ref={messagesEndRef} /> {/* Added newline before this div */} 
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
            disabled={!isConnected || !user || !!socketError}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-400 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!isConnected || !user || !!socketError || !newMessage.trim()}
            className="p-2 bg-blue-600 rounded-md text-white disabled:bg-zinc-700 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}