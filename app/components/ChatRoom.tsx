'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, Loader2, AlertTriangle, MessageSquareText, Trash2, Siren } from 'lucide-react';
import { useSocket } from '@/app/context/SocketContext';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import { getChatHistory, ApiChatMessage, sendChatMessage, deleteChatMessage, reportChatMessage } from '@/lib/api/topics';
import ConfirmationPopover from './common/ConfirmationPopover';
import { BACKEND_BASE_URL } from '@/lib/constants';
import { Topic } from '@/types';
import { format } from 'date-fns';

type Message = {
  id: number;
  author: string;
  message: string;
  profile_image_url?: string;
  created_at: string;
};

const getFullImageUrl = (url?: string): string => {
  if (!url) {
    return '/user-placeholder.svg';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BACKEND_BASE_URL}${url}`;
};

const formatTimestamp = (dateString: string) => {
  try {
    return format(new Date(dateString), "a h:mm");
  } catch (_e) {
    return '--:--';
  }
};

const renderMessageWithLinks = (message: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  message.replace(urlRegex, (match, url, index) => {
    // Add preceding text
    if (index > lastIndex) {
      parts.push(message.substring(lastIndex, index));
    }
    // Add the link
    parts.push(
      <a
        key={index} // Use index as key, or a more robust key if messages can reorder
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-300 hover:underline" // Style the link
      >
        {url}
      </a>
    );
    lastIndex = index + match.length;
    return match; // Return match to continue replacement
  });

  // Add any remaining text
  if (lastIndex < message.length) {
    parts.push(message.substring(lastIndex));
  }

  return parts;
};

interface ChatRoomProps {
  topic?: Topic;
}

export default function ChatRoom({ topic }: ChatRoomProps) {
  const { socket, isConnected, error: socketError } = useSocket();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(!!topic?.id);
  const [isSending, setIsSending] = useState(false);
  const [dialog, setDialog] = useState<{ type: 'delete' | 'report'; messageId: number; top: number; left: number; } | null>(null);
  const room = topic?.id ? `topic-${topic.id}` : 'mainpage';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    if (topic?.id) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const history: ApiChatMessage[] = await getChatHistory(topic.id, 100);
          const reversedHistory = [...history].reverse();
          const formattedHistory: Message[] = reversedHistory.map((msg) => ({
            id: msg.id,
            author: msg.author,
            message: msg.message,
            profile_image_url: getFullImageUrl(msg.profile_image_url),
            created_at: msg.created_at,
          }));
          setMessages(formattedHistory);
          setTimeout(() => scrollToBottom('auto'), 100);
        } catch (err) {
          console.error("Failed to fetch chat history:", err);
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [topic?.id]);

  useEffect(() => {
    if (socket && room) {
      socket.emit('join_room', room);
      const messageListener = (data: ApiChatMessage) => {
        const receivedMessage: Message = {
          id: data.id,
          author: data.author,
          message: data.message,
          profile_image_url: getFullImageUrl(data.profile_image_url),
          created_at: data.created_at,
        };
        setMessages((prev) => [...prev, receivedMessage]);
      };
      socket.on('receive_message', messageListener);

      const deleteListener = (data: { messageId: number }) => {
        setMessages((prev) => prev.map((m) => m.id === data.messageId ? { ...m, message: '메시지가 삭제되었습니다.' } : m));
      };
      socket.on('message_deleted', deleteListener);

      return () => {
        socket.off('receive_message', messageListener);
        socket.off('message_deleted', deleteListener);
      };
    }
  }, [socket, room]);

  useEffect(() => {
    if (!isLoadingHistory) scrollToBottom();
  }, [messages, isLoadingHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topic?.id && isConnected && newMessage.trim() && user && token && !isSending) {
      const messageToSend = newMessage;
      setNewMessage('');
      setIsSending(true);
      try {
        await sendChatMessage(topic.id, messageToSend, token);
      } catch (error) {
        console.error("Failed to send message:", error);
        setNewMessage(messageToSend);
        alert("메시지 전송에 실패했습니다. 다시 시도해주세요.");
      } finally {
        setIsSending(false);
      }
    }
  };

  const openConfirmation = (e: React.MouseEvent<HTMLButtonElement>, type: 'delete' | 'report', messageId: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const chatContainerCurrent = chatContainerRef.current;
    if (!chatContainerCurrent) return;
    const chatContainerRect = chatContainerCurrent.getBoundingClientRect();

    setDialog({
      type,
      messageId,
      top: rect.top - chatContainerRect.top,
      left: rect.left - chatContainerRect.left - 280,
    });
  };

  const confirmAction = async () => {
    if (!dialog || !token) return;
    const { type, messageId } = dialog;
    setDialog(null);

    try {
      if (type === 'delete') {
        await deleteChatMessage(messageId, token);
        setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, message: '메시지가 삭제되었습니다.' } : m));
      } else if (type === 'report') {
        await reportChatMessage(messageId, token);
        alert('메시지가 성공적으로 신고되었습니다.');
      }
    } catch (error) {
      console.error(`Failed to ${type} message:`, error);
      alert((error as Error).message || `${type === 'delete' ? '삭제' : '신고'}에 실패했습니다.`);
    }
  };

  const cancelAction = () => setDialog(null);

  const getPlaceholderText = () => {
    if (!topic) return '토픽 정보를 불러오는 중입니다...';
    if (socketError) return '실시간 채팅 서버에 연결할 수 없습니다.';
    if (!isConnected) return '실시간 채팅 서버에 연결 중...';
    if (!user) return '로그인 후 이용 가능합니다.';
    return '메시지를 입력하세요...';
  };

  return (
    <div ref={chatContainerRef} className="flex flex-col h-full relative border border-zinc-700 rounded-lg">
      {dialog && (
        <ConfirmationPopover
          top={dialog.top}
          left={dialog.left}
          title={dialog.type === 'delete' ? '메시지 삭제' : '메시지 신고'}
          message={dialog.type === 'delete' ? '이 메시지를 삭제하시겠습니까?' : '이 메시지를 신고하시겠습니까?'}
          confirmText={dialog.type === 'delete' ? '삭제' : '신고'}
          cancelText="취소"
          onConfirm={confirmAction}
          onCancel={cancelAction}
        />
      )}
      
      {/* Message List: This is the scrollable area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-full text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="ml-3 text-lg">이전 대화 기록을 불러오는 중...</p>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="flex flex-col justify-center items-center h-full text-zinc-500">
                <MessageSquareText size={48} />
                <p className="mt-4 text-lg font-semibold">지금 첫 번째 메시지를 보내</p>
                <p>토론을 시작해 보세요!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMyMessage = user ? msg.author === (user.nickname || user.name) : false;
              return (
                <div
                  key={msg.id}
                  className={`group flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                  {!isMyMessage && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-zinc-700">
                      <Image
                        src={msg.profile_image_url!}
                        alt={`${msg.author}'s profile`}
                        fill
                        className="rounded-full object-cover"
                        unoptimized={true}
                      />
                    </div>
                  )}
                  <div className={`flex flex-col gap-1 ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    {!isMyMessage && (
                      <span className="text-xs text-zinc-400 ml-1">{msg.author}</span>
                    )}
                    <div className={`flex gap-1 items-end ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div
                                              className={`px-3 py-2 rounded-2xl max-w-xs lg:max-w-md break-words ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-white'}`}>
                                              <p className="text-sm">{renderMessageWithLinks(msg.message)}</p>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 whitespace-nowrap">{formatTimestamp(msg.created_at)}</span>
                                            {(isMyMessage && msg.message !== "메시지가 삭제되었습니다.") || (!isMyMessage && msg.message !== "메시지가 삭제되었습니다.") ? (
                                              <div className="flex items-center self-end shrink-0">
                                                {isMyMessage && msg.message !== "메시지가 삭제되었습니다." && (
                                                  <button onClick={(e) => openConfirmation(e, 'delete', msg.id)} className="text-zinc-400 hover:text-red-500 transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100" title="메시지 삭제">
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                                )}
                                                {!isMyMessage && msg.message !== "메시지가 삭제되었습니다." && (
                                                  <button onClick={(e) => openConfirmation(e, 'report', msg.id)} className="text-zinc-500 hover:text-yellow-500 transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100" title="메시지 신고">
                                                    <Siren className="w-4 h-4" />
                                                  </button>
                                                )}
                                              </div>
                                            ) : null}
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
      <div className="shrink-0 px-4 py-4">
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
            disabled={!isConnected || !user || !!socketError || isSending || !topic}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!isConnected || !user || !!socketError || !newMessage.trim() || isSending || !topic}
            className={`p-2 h-10 w-10 flex justify-center items-center bg-blue-600 rounded-md text-white transition-all duration-200 ease-in-out disabled:bg-zinc-700 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!(!isConnected || !user || !!socketError || !newMessage.trim() || isSending || !topic) ? 'scale-110' : ''}`}
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}