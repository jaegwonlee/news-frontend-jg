'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, Loader2, AlertTriangle, Trash2, Siren } from 'lucide-react';
import { useSocket } from '@/app/context/SocketContext';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import { getChatHistory, ApiChatMessage, sendChatMessage, deleteChatMessage, reportChatMessage } from '@/lib/api/topics';
import ConfirmationPopover from './common/ConfirmationPopover';

type Message = {
  id: number;
  author: string;
  message: string;
  profile_image_url?: string;
  created_at: string;
};

interface DialogState {
  type: 'delete' | 'report';
  messageId: number;
  top: number;
  left: number;
}

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
  const [isSending, setIsSending] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const room = topicId ? `topic-${topicId}` : 'mainpage';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRoomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'nearest' });
  };

  useEffect(() => {
    if (topicId) {
      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        const history: ApiChatMessage[] = await getChatHistory(topicId, 100);
        const reversedHistory = [...history].reverse();
        const formattedHistory: Message[] = reversedHistory.map((msg) => ({
          id: msg.id,
          author: msg.author,
          message: msg.message,
          profile_image_url: msg.profile_image_url,
          created_at: msg.created_at,
        }));
        setMessages(formattedHistory);
        setIsLoadingHistory(false);
        setTimeout(() => scrollToBottom('auto'), 100);
      };
      fetchHistory();
    }
  }, [topicId]);

  useEffect(() => {
    if (socket) {
      socket.emit('join_room', room);
      const messageListener = (data: ApiChatMessage) => {
        setMessages((prev) => [...prev, { ...data }]);
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
    if (topicId && isConnected && newMessage.trim() && user && token && !isSending) {
      const messageToSend = newMessage;
      setNewMessage('');
      setIsSending(true);
      try {
        await sendChatMessage(topicId, messageToSend, token);
      } catch (error) {
        console.error("Failed to send message:", error);
        setNewMessage(messageToSend);
        alert("메시지 전송에 실패했습니다.");
      } finally {
        setIsSending(false);
      }
    }
  };

  const openConfirmation = (e: React.MouseEvent<HTMLButtonElement>, type: 'delete' | 'report', messageId: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const chatRoomRect = chatRoomRef.current?.getBoundingClientRect();
    if (!chatRoomRect) return;

    setDialog({
      type,
      messageId,
      top: rect.top - chatRoomRect.top - 120,
      left: rect.left - chatRoomRect.left - 280,
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
    if (socketError) return '실시간 채팅 서버에 연결할 수 없습니다.';
    if (!isConnected) return '실시간 채팅 서버에 연결 중...';
    if (!user) return '로그인 후 이용 가능합니다.';
    return '메시지를 입력하세요...';
  };

  return (
    <div ref={chatRoomRef} className="flex flex-col h-[600px] bg-zinc-900 p-4 rounded-lg relative">
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
      <div className="grow min-h-0 overflow-y-auto space-y-4 pr-2">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
            <p className="ml-2">대화 기록을 불러오는 중...</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isMyMessage = user ? msg.author === (user.nickname || user.name) : false;
              return (
                <div key={msg.id} className={`group flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  {!isMyMessage && <Image src={msg.profile_image_url || '/user-placeholder.svg'} alt={`${msg.author}'s profile`} width={32} height={32} className="rounded-full object-cover self-start" />}
                  <div className={`flex flex-col gap-1 ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    {!isMyMessage && <span className="text-xs text-zinc-400 ml-1">{msg.author}</span>}
                    <div className={`flex gap-2 items-end ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`p-3 rounded-lg max-w-xs lg:max-w-md break-words ${isMyMessage ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-white'}`}><p>{msg.message}</p></div>
                      <div className="flex items-center self-end shrink-0">
                        {isMyMessage && msg.message !== "메시지가 삭제되었습니다." && (
                          <button onClick={(e) => openConfirmation(e, 'delete', msg.id)} className="text-zinc-400 hover:text-red-500 transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100" title="메시지 삭제">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {!isMyMessage && (
                          <button onClick={(e) => openConfirmation(e, 'report', msg.id)} className="text-zinc-500 hover:text-yellow-500 transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100" title="메시지 신고">
                            <Siren className="w-4 h-4" />
                          </button>
                        )}
                        <span className="text-xs text-zinc-500 whitespace-nowrap w-12 text-center">{formatTimestamp(msg.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <div className="mt-4 shrink-0">
        {socketError && <div className="flex items-center text-red-500 text-xs mb-2"><AlertTriangle className="w-4 h-4 mr-1" />{socketError}</div>}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input type="text" placeholder={getPlaceholderText()} disabled={!isConnected || !user || !!socketError || isSending} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-400 disabled:cursor-not-allowed" />
          <button type="submit" disabled={!isConnected || !user || !!socketError || !newMessage.trim() || isSending} className="p-2 bg-blue-600 rounded-md text-white disabled:bg-zinc-700 disabled:cursor-not-allowed">
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}