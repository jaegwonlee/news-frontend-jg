'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, Loader2, AlertTriangle, MessageSquareText, Trash2, Siren, Users, Search, MoreVertical, X, ChevronUp, ChevronDown, Paperclip, Download } from 'lucide-react';
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

type SearchResult = {
  messageId: number;
  matchIndex: number; // Index of the match within the message string
};

const getFullImageUrl = (url?: string): string => {
  if (!url) return '/user-placeholder.svg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_BASE_URL}${url}`;
};

const formatTimestamp = (dateString: string) => {
  try {
    return format(new Date(dateString), "a h:mm");
  } catch (_e) {
    return '--:--';
  }
};

const renderMessageWithHighlight = (message: string, query: string, activeResult: SearchResult | null, messageId: number) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const videoExtensions = ['.mp4', '.webm', '.ogg'];
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const renderMedia = (url: string, key: string | number) => {
    try {
      const urlObject = new URL(url);
      const extension = urlObject.pathname.substring(urlObject.pathname.lastIndexOf('.')).toLowerCase();
      const filename = urlObject.pathname.substring(urlObject.pathname.lastIndexOf('/') + 1);

      const mediaContainer = (children: React.ReactNode) => (
        <div key={key} className="relative group/media mt-2">
          {children}
          <a
            href={url}
            download={filename}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 group-hover/media:opacity-100 transition-opacity"
            title={`Download ${filename}`}
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      );

      if (imageExtensions.includes(extension)) {
        return mediaContainer(
          <Image src={url} alt="User uploaded content" width={300} height={200} className="rounded-lg object-cover max-w-full h-auto" unoptimized />
        );
      }
      if (videoExtensions.includes(extension)) {
        return mediaContainer(
          <video src={url} controls width="300" className="rounded-lg max-w-full" />
        );
      }
    } catch (e) {
      // Invalid URL, treat as plain text
    }
    return <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">{url}</a>;
  };

  if (!query) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    message.replace(urlRegex, (match, url, index) => {
      if (index > lastIndex) parts.push(message.substring(lastIndex, index));
      parts.push(renderMedia(url, index));
      lastIndex = index + match.length;
      return match;
    });
    if (lastIndex < message.length) parts.push(message.substring(lastIndex));
    return parts;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\\]/g, '\\$&');
  const combinedRegex = new RegExp(`(${escapedQuery})|(${urlRegex.source})`, 'gi');
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let matchCount = 0;

  message.replace(combinedRegex, (match, queryMatch, url, index) => {
    if (index > lastIndex) {
      parts.push(message.substring(lastIndex, index));
    }
    if (url) {
      parts.push(renderMedia(url, `url-${index}`));
    } else if (queryMatch) {
      const isCurrentActive = activeResult?.messageId === messageId && activeResult?.matchIndex === matchCount;
      parts.push(
        <mark key={`mark-${index}-${matchCount}`} className={`${isCurrentActive ? 'bg-orange-500' : 'bg-yellow-400'} text-black rounded px-0.5`}>
          {queryMatch}
        </mark>
      );
      matchCount++;
    }
    lastIndex = index + match.length;
    return match;
  });

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
  const [dialog, setDialog] = useState<{ type: 'delete' | 'report'; messageId: number; } | null>(null);
  
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);

  const room = topic?.id ? `topic-${topic.id}` : 'mainpage';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Selected file:", file);
    // TODO: Implement file upload logic here
    // 1. Show a preview of the image/video
    // 2. Create FormData
    // 3. POST to the (yet to be created) backend endpoint
    // 4. On success, get the URL and send it as a chat message
    alert(`File selected: ${file.name}. Upload functionality is not yet connected to the backend.`);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    if (!searchQuery || messages.length === 0) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }

    const results: SearchResult[] = [];
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Corrected regex
    const regex = new RegExp(escapedQuery, 'gi');

    messages.forEach(msg => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let match;
      while ((match = regex.exec(msg.message)) !== null) {
        results.push({ messageId: msg.id, matchIndex: results.filter(r => r.messageId === msg.id).length });
      }
    });

    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, messages]);

  const scrollToResult = useCallback((result: SearchResult | undefined) => {
    if (!result) return;
    const messageEl = messageRefs.current.get(result.messageId);
    messageEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  useEffect(() => {
    if (currentResultIndex >= 0 && searchResults[currentResultIndex]) {
      scrollToResult(searchResults[currentResultIndex]);
    }
  }, [currentResultIndex, searchResults, scrollToResult]);

  const handleNavigateResult = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;
    const nextIndex = direction === 'next'
      ? (currentResultIndex + 1) % searchResults.length
      : (currentResultIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentResultIndex(nextIndex);
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
    if (!isLoadingHistory && !searchQuery) scrollToBottom();
  }, [messages, isLoadingHistory, searchQuery]);

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
    setDialog({
      type,
      messageId,
    });
  };

  const confirmAction = async () => {
    if (!dialog || !token) return;
    const { type, messageId } = dialog;
    setDialog(null);

    try {
      if (type === 'delete') {
        await deleteChatMessage(messageId, token);
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
    <div ref={chatContainerRef} className="chat-background-boxing flex flex-col h-full relative rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-zinc-700/80 h-16 shrink-0 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white truncate">
                {topic?.id === 1 ? "Round 1" : (topic ? topic.display_name : "실시간 채팅")}
              </h2>
              <div className="flex items-center text-sm text-zinc-400">
                <Users className="w-4 h-4 mr-1" />
                <span>{topic ? '12' : '...'}</span> 
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSearchVisible(true)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
    
          {isSearchVisible && (
            <div className="absolute top-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-sm z-20 h-16 flex items-center px-3 border-b border-zinc-700 animate-fade-in-down">
              <div className="flex items-center flex-1">
                <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                <input type="text" placeholder="채팅 내용 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleNavigateResult('next'); } }} autoFocus className="flex-1 bg-transparent px-3 text-white placeholder-zinc-500 focus:outline-none" />
              </div>
              {searchQuery && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400 w-20 text-center">{searchResults.length > 0 ? `${currentResultIndex + 1} / ${searchResults.length}` : '0 / 0'}</span>
                  <button onClick={(e) => { e.preventDefault(); handleNavigateResult('prev'); }} disabled={searchResults.length === 0} className="p-2 text-zinc-400 hover:text-white disabled:text-zinc-600 disabled:cursor-not-allowed"><ChevronUp className="w-5 h-5" /></button>
                  <button onClick={(e) => { e.preventDefault(); handleNavigateResult('next'); }} disabled={searchResults.length === 0} className="p-2 text-zinc-400 hover:text-white disabled:text-zinc-600 disabled:cursor-not-allowed"><ChevronDown className="w-5 h-5" /></button>
                </div>
              )}
              <button onClick={() => { setIsSearchVisible(false); setSearchQuery(''); }} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-full transition-colors ml-2"><X className="w-5 h-5" /></button>
            </div>
          )}
    
          {dialog && <ConfirmationPopover title={dialog.type === 'delete' ? '메시지 삭제' : '메시지 신고'} message={dialog.type === 'delete' ? '이 메시지를 삭제하시겠습니까?' : '이 메시지를 신고하시겠습니까?'} confirmText={dialog.type === 'delete' ? '삭제' : '신고'} cancelText="취소" onConfirm={confirmAction} onCancel={cancelAction} />}
          
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 bg-transparent">
            {isLoadingHistory ? (
              <div className="flex justify-center items-center h-full text-zinc-400"><Loader2 className="w-8 h-8 animate-spin" /><p className="ml-3 text-lg">이전 대화 기록을 불러오는 중...</p></div>
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
                  const activeResult = searchResults[currentResultIndex];
                  return (
                    <div key={msg.id} ref={(el) => { if (el) messageRefs.current.set(msg.id, el); else messageRefs.current.delete(msg.id); }} data-message-id={msg.id}>
                      {isMyMessage ? (
                        <div className="group flex justify-end animate-fade-in-up">
                          <div className="flex flex-col gap-1 items-end">
                            <div className="flex gap-1 items-end flex-row-reverse">
                              <div className="px-3 py-2 rounded-2xl max-w-xs lg:max-w-md wrap-break-word bg-blue-600 text-white">
                                <p className="text-sm">{renderMessageWithHighlight(msg.message, searchQuery, activeResult, msg.id)}</p>
                              </div>
                              <span className="text-[10px] text-zinc-500 whitespace-nowrap">{formatTimestamp(msg.created_at)}</span>
                              {msg.message !== "메시지가 삭제되었습니다." && (
                                <div className="flex items-center self-end shrink-0"><button onClick={(e) => openConfirmation(e, 'delete', msg.id)} className="text-zinc-400 hover:text-red-500 transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100" title="메시지 삭제"><Trash2 className="w-4 h-4" /></button></div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="group flex gap-2.5 animate-fade-in-up">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-700 mt-1"><Image src={msg.profile_image_url!} alt={`${msg.author}'s profile`} fill className="rounded-full object-cover" unoptimized /></div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm text-zinc-400 font-medium">{msg.author}</span>
                            <div className="flex gap-1 items-end">
                              <div className="px-3 py-2 rounded-2xl max-w-xs lg:max-w-md wrap-break-word bg-zinc-700 text-white">
                                <p className="text-sm">{renderMessageWithHighlight(msg.message, searchQuery, activeResult, msg.id)}</p>
                              </div>
                              <span className="text-[10px] text-zinc-500 whitespace-nowrap">{formatTimestamp(msg.created_at)}</span>
                              {msg.message !== "메시지가 삭제되었습니다." && (
                                <div className="flex items-center self-end shrink-0"><button onClick={(e) => openConfirmation(e, 'report', msg.id)} className="text-zinc-500 hover:text-yellow-500 transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100" title="메시지 신고"><Siren className="w-4 h-4" /></button></div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
    
          <div className="shrink-0 px-4 py-4 bg-zinc-900/50 backdrop-blur-sm">
            {socketError && (<div className="flex items-center text-red-500 text-xs mb-2"><AlertTriangle className="w-4 h-4 mr-1" />{socketError}</div>)}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept="image/*,video/*" />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="p-2 h-10 w-10 flex justify-center items-center bg-zinc-700 hover:bg-zinc-600 rounded-md text-zinc-300 transition-colors disabled:bg-zinc-800 disabled:cursor-not-allowed" 
                disabled={!isConnected || !user || !!socketError || isSending || !topic}
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input type="text" placeholder={getPlaceholderText()} disabled={!isConnected || !user || !!socketError || isSending || !topic} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder-zinc-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              <button type="submit" disabled={!isConnected || !user || !!socketError || !newMessage.trim() || isSending || !topic} className={`p-2 h-10 w-10 flex justify-center items-center bg-blue-600 rounded-md text-white transition-all duration-200 ease-in-out disabled:bg-zinc-700 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${!(!isConnected || !user || !!socketError || !newMessage.trim() || isSending || !topic) ? 'scale-110' : ''}`}>
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
          <style jsx>{`
            .chat-background-boxing {
              /* 복싱 링 로프 효과 */
              box-shadow:
                /* 안쪽 밝은 로프 */
                0 0 0 1px rgba(255, 100, 100, 0.8),
                /* 중간 두께 로프 */
                0 0 0 3px rgba(200, 0, 0, 0.6),
                /* 바깥쪽 네온 효과 */
                0 0 15px 5px rgba(255, 0, 0, 0.4);
              
              /* --- 기존 내부 배경 스타일 --- */
              background-color: transparent;
              position: relative;
              z-index: 0;
            }
            .chat-background-boxing::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: -2;
              background-image: url('/360_F_948079407_7qSn6DZAT9njgxFGhumiviPQyur2ThqV.jpg');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
              opacity: 0.25;
              filter: blur(1px);
              border-radius: 1rem; /* 부모와 동일한 radius 적용 */
            }
            .chat-background-boxing::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: -1;
              background-color: rgba(0, 0, 0, 0.3);
              border-radius: 1rem; /* 부모와 동일한 radius 적용 */
            }
          `}</style>
        </div>
      );
    }