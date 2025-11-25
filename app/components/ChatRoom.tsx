"use client";

import ReportModal from "@/app/components/common/ReportModal";
import { useAuth } from "@/app/context/AuthContext";
import { useSocket } from "@/app/context/SocketContext";
import {
  ApiChatMessage,
  deleteChatMessage,
  getChatHistory,
  getPresignedUrlForChat,
  sendChatMessage,
} from "@/lib/api/topics";
import { BACKEND_BASE_URL } from "@/lib/constants";
import { Article, Topic } from "@/types";
import { format } from "date-fns";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Download,
  Flag,
  Loader2,
  MessageSquareText,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "next-themes"; // Added this import
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ChatArticleCard from "./ChatArticleCard";
import ConfirmationPopover from "./common/ConfirmationPopover";
import ToastNotification, { ToastType } from "./common/ToastNotification";

type Message = {
  id: number;
  author: string;
  message: string;
  profile_image_url?: string;
  created_at: string;
  isHidden?: boolean; // Added for hiding messages
};

type SearchResult = {
  messageId: number;
  matchIndex: number;
};

type ToastState = {
  message: string;
  type: ToastType;
  top: number;
  left: number;
  alignment: "left" | "right";
} | null;

const getFullImageUrl = (url?: string): string => {
  if (!url) return "/user-placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BACKEND_BASE_URL}${url}`;
};

const formatTimestamp = (dateString: string) => {
  try {
    return format(new Date(dateString), "a h:mm");
  } catch (_e) {
    return "--:--";
  }
};

interface ChatRoomProps {
  topic?: Topic;
  articles?: Article[];
}

export default function ChatRoom({ topic, articles = [] }: ChatRoomProps) {
  const { socket, isConnected, error: socketError } = useSocket();
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  // ... (rest of the state declarations are the same)
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(!!topic?.id);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dialog, setDialog] = useState<{ type: "delete"; messageId: number } | null>(null); // Only for delete now

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);

  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetMessageId, setReportTargetMessageId] = useState<number | null>(null);
  const [reportedMessageIds, setReportedMessageIds] = useState<Set<number>>(new Set()); // To disable button after reporting

  const room = topic?.id ? `topic-${topic.id}` : "mainpage";
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... (all effects and handlers are the same)
  // Effect for lightbox (image zoom)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoomedImageUrl(null);
      }
    };

    if (zoomedImageUrl) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomedImageUrl]);

  const handleDownload = async (url: string, filename: string) => {
    if (isDownloading === url) return;
    setIsDownloading(url);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        window.open(url, "_blank");
        throw new Error("Response not OK, opening in new tab.");
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download error:", error);
      if (!`${error}`.includes("new tab")) {
        alert("파일을 다운로드하는 데 실패했습니다. 새 탭에서 이미지를 열어 수동으로 저장해주세요.");
        window.open(url, "_blank");
      }
    } finally {
      setIsDownloading(null);
    }
  };

  const renderMessageContent = (msg: Message, activeResult: SearchResult | null) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const videoExtensions = [".mp4", ".webm", ".ogg"];
    const s3UrlPrefix = "https://news-upload-rsteam.s3.ap-northeast-2.amazonaws.com/chats/";
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    const renderMedia = (url: string, key: string | number) => {
      try {
        const pathname = url.split("?")[0];
        const extension = pathname.substring(pathname.lastIndexOf(".")).toLowerCase();
        const filename = decodeURIComponent(pathname.substring(pathname.lastIndexOf("/") + 1));

        const mediaContainer = (children: React.ReactNode) => (
          <div key={key} className="relative group/media mt-2">
            {children}
            <button
              onClick={() => handleDownload(url, filename)}
              className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 group-hover/media:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-wait"
              title={`Download ${filename}`}
              disabled={isDownloading === url}
            >
              {isDownloading === url ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </button>
          </div>
        );

        if (imageExtensions.includes(extension)) {
          return mediaContainer(
            <Image
              src={url}
              alt="User uploaded content"
              width={300}
              height={200}
              className="rounded-lg object-cover max-w-full h-auto cursor-pointer"
              unoptimized
              onClick={() => setZoomedImageUrl(url)}
            />
          );
        }
        if (videoExtensions.includes(extension)) {
          return mediaContainer(<video src={url} controls width="300" className="rounded-lg max-w-full" />);
        }
      } catch (e) {
        // Fallback for safety
      }
      return (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {url}
        </a>
      );
    };

    if (msg.message.startsWith(s3UrlPrefix)) {
      return renderMedia(msg.message, `s3-media-${msg.id}`);
    }

    const articleMatches = [...msg.message.matchAll(urlRegex)];
    if (articles.length > 0 && articleMatches.length > 0) {
      let lastIndex = 0;
      const parts: React.ReactNode[] = [];
      let hasArticleCard = false;
      for (const match of articleMatches) {
        const url = match[0];
        const index = match.index!;
        const matchedArticle = articles.find((a) => a.url === url);
        if (matchedArticle) {
          hasArticleCard = true;
          if (index > lastIndex) parts.push(msg.message.substring(lastIndex, index));
          parts.push(<ChatArticleCard key={`article-${matchedArticle.id}-${index}`} article={matchedArticle} />);
          lastIndex = index + url.length;
        }
      }
      if (hasArticleCard) {
        if (lastIndex < msg.message.length) parts.push(msg.message.substring(lastIndex));
        return <>{parts}</>;
      }
    }

    if (!searchQuery) {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      msg.message.replace(urlRegex, (match, url, index) => {
        if (index > lastIndex) parts.push(msg.message.substring(lastIndex, index));
        parts.push(renderMedia(url, index));
        lastIndex = index + match.length;
        return match;
      });
      if (lastIndex < msg.message.length) parts.push(msg.message.substring(lastIndex));
      return <>{parts}</>;
    }

    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\\]/g, "\\$&");
    const combinedRegex = new RegExp(`(${escapedQuery})|(${urlRegex.source})`, "gi");
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let matchCount = 0;
    msg.message.replace(combinedRegex, (match, queryMatch, url, index) => {
      if (index > lastIndex) parts.push(msg.message.substring(lastIndex, index));
      if (url) {
        parts.push(renderMedia(url, `url-${index}`));
      } else if (queryMatch) {
        const isCurrentActive = activeResult?.messageId === msg.id && activeResult?.matchIndex === matchCount;
        parts.push(
          <mark
            key={`mark-${index}-${matchCount}`}
            className={`${isCurrentActive ? "bg-orange-500" : "bg-yellow-400"} text-black rounded px-0.5`}
          >
            {queryMatch}
          </mark>
        );
        matchCount++;
      }
      lastIndex = index + match.length;
      return match;
    });
    if (lastIndex < msg.message.length) parts.push(msg.message.substring(lastIndex));
    return <>{parts}</>;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !topic?.id) return;

    setIsUploading(true);
    try {
      const { uploadUrl, fileUrl } = await getPresignedUrlForChat(token, file.name, file.type);
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("S3 업로드에 실패했습니다.");
      await sendChatMessage(topic.id, fileUrl, token);
    } catch (error) {
      console.error("File upload failed:", error);
      alert(`파일 업로드 중 오류가 발생했습니다: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  useEffect(() => {
    if (!searchQuery || messages.length === 0) {
      setSearchResults([]);
      setCurrentResultIndex(-1);
      return;
    }
    const results: SearchResult[] = [];
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "gi");
    messages.forEach((msg) => {
      let match;
      while ((match = regex.exec(msg.message)) !== null) {
        results.push({ messageId: msg.id, matchIndex: results.filter((r) => r.messageId === msg.id).length });
      }
    });
    setSearchResults(results);
    setCurrentResultIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, messages]);

  const scrollToResult = useCallback((result: SearchResult | undefined) => {
    if (!result) return;
    const messageEl = messageRefs.current.get(result.messageId);
    messageEl?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  useEffect(() => {
    if (currentResultIndex >= 0 && searchResults[currentResultIndex]) {
      scrollToResult(searchResults[currentResultIndex]);
    }
  }, [currentResultIndex, searchResults, scrollToResult]);

  const handleNavigateResult = (direction: "next" | "prev") => {
    if (searchResults.length === 0) return;
    const nextIndex =
      direction === "next"
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
          setTimeout(() => scrollToBottom("auto"), 100);
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
      socket.emit("join_room", room);
      const messageListener = (data: ApiChatMessage) => {
        setMessages((prev) => [
          ...prev,
          {
            id: data.id,
            author: data.author,
            message: data.message,
            profile_image_url: getFullImageUrl(data.profile_image_url),
            created_at: data.created_at,
          },
        ]);
      };
      socket.on("receive_message", messageListener);
      const deleteListener = (data: { messageId: number }) => {
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      };
      socket.on("message_deleted", deleteListener);

      const messageHiddenListener = (data: { messageId: number }) => {
        setMessages((prev) => prev.map((msg) => (msg.id === data.messageId ? { ...msg, isHidden: true } : msg)));
      };
      socket.on("message_hidden", messageHiddenListener);

      return () => {
        socket.off("receive_message", messageListener);
        socket.off("message_deleted", deleteListener);
        socket.off("message_hidden", messageHiddenListener);
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
      setNewMessage("");
      setIsSending(true);
      try {
        await sendChatMessage(topic.id, messageToSend, token);
      } catch (error) {
        console.error("Failed to send message:", error);
        alert("메시지 전송에 실패했습니다. 다시 시도해주세요.");
        setNewMessage(messageToSend);
      } finally {
        setIsSending(false);
      }
    }
  };

  const openConfirmation = (e: React.MouseEvent<HTMLButtonElement>, messageId: number) => {
    setDialog({ type: "delete", messageId }); // Only for delete now
  };

  const openReportModal = (e: React.MouseEvent<HTMLButtonElement>, messageId: number) => {
    e.stopPropagation(); // Prevent triggering other click handlers
    setReportTargetMessageId(messageId);
    setIsReportModalOpen(true);
  };

  const showToast = (messageId: number, message: string, type: ToastType) => {
    const messageEl = messageRefs.current.get(messageId);
    if (messageEl && chatContainerRef.current) {
      const messageRect = messageEl.getBoundingClientRect();
      const containerRect = chatContainerRef.current.getBoundingClientRect();

      const msg = messages.find((m) => m.id === messageId);
      const isMyMessage = user ? msg?.author === (user.nickname || user.name) : false;

      let top = messageRect.top - 8; // 8px margin above the message
      let left;
      let alignment: "left" | "right";

      if (isMyMessage) {
        left = messageRect.right;
        alignment = "right";
      } else {
        left = messageRect.left;
        alignment = "left";
      }

      const estimatedToastWidth = 320; 
      const toastMargin = 16; 

      if (alignment === "left") {
        if (left + estimatedToastWidth > containerRect.right - toastMargin) {
          left = containerRect.right - estimatedToastWidth - toastMargin;
        }
        if (left < containerRect.left + toastMargin) {
          left = containerRect.left + toastMargin;
        }
      } else {
        if (left - estimatedToastWidth < containerRect.left + toastMargin) {
          left = containerRect.left + estimatedToastWidth + toastMargin;
        }
        if (left > containerRect.right - toastMargin) {
          left = containerRect.right - toastMargin;
        }
      }

      if (top < containerRect.top + toastMargin) {
        top = containerRect.top + toastMargin; 
      }

      setToast({
        message,
        type,
        top,
        left,
        alignment,
      });
      setTimeout(() => {
        setToast(null);
      }, 4000);
    }
  };

  const handleReportSuccess = (message: string, type: ToastType, reportedId: number) => {
    setToast({
      message,
      type,
      top: 50,
      left: (chatContainerRef.current?.getBoundingClientRect()?.right ?? window.innerWidth) - 350,
      alignment: "right",
    });
    if (type === "success" || message.includes("이미 신고")) {
      setReportedMessageIds((prev) => new Set(prev).add(reportedId));
    }
    setTimeout(() => setToast(null), 3000);
  };

  const confirmAction = async () => {
    if (!dialog || !token) return;
    const { type, messageId } = dialog;
    setDialog(null);
    try {
      if (type === "delete") {
        await deleteChatMessage(messageId, token);
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } catch (error) {
      const errorMessage = (error as Error).message || `삭제에 실패했습니다.`;
      showToast(messageId, errorMessage, "error");
    }
  };

  const cancelAction = () => setDialog(null);

  const getPlaceholderText = () => {
    if (!topic) return "토픽 정보를 불러오는 중입니다...";
    if (socketError) return "실시간 채팅 서버에 연결할 수 없습니다.";
    if (!isConnected) return "실시간 채팅 서버에 연결 중...";
    if (!user) return "로그인 후 이용 가능합니다.";
    return "메시지를 입력하세요...";
  };

  const isDarkMode = theme === 'dark';

  const containerClasses = isDarkMode
    ? "relative flex flex-col h-full rounded-2xl overflow-hidden border border-white/10 bg-card/60 backdrop-blur-xl shadow-2xl"
    : "relative flex flex-col h-full rounded-2xl overflow-hidden border border-border bg-card shadow-lg";

  return (
    <div ref={chatContainerRef} className={containerClasses}>
      <div className="absolute top-0 left-0 w-full h-full z-[-2] overflow-hidden rounded-2xl">
        <div
          className={`w-full h-full bg-cover bg-center transition-all duration-300 ${isDarkMode ? 'opacity-25' : 'opacity-10 grayscale brightness-75'}`}
          style={{ backgroundImage: `url('/360_F_948079407_7qSn6DZAT9njgxFGhumiviPQyur2ThqV.jpg')` }}
        ></div>
      </div>
      {/* Aurora Background Blobs removed to fix Hydration Error */}
      {/*
      <div className="absolute top-0 left-0 w-full h-full z-[-1] overflow-hidden">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-radial from-red-500/20 via-transparent to-transparent animate-aurora-1"></div>
          <div className="absolute bottom-[-50%] right-[-50%] w-[200%] h-[200%] bg-gradient-radial from-blue-500/20 via-transparent to-transparent animate-aurora-2"></div>
          <div className="absolute top-[20%] right-[-30%] w-[150%] h-[150%] bg-gradient-radial from-purple-500/15 via-transparent to-transparent animate-aurora-3"></div>
      </div>
      */}

      <div className={`flex justify-between items-center p-3 h-16 shrink-0 ${isDarkMode ? 'border-b border-white/10' : 'border-b border-border bg-background/50 backdrop-blur-sm'}`}>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-foreground truncate">
            {topic?.id === 1 ? "Round 1" : topic ? topic.display_name : "실시간 채팅"}
          </h2>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            <span>{topic ? "12" : "..."}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchVisible(true)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isSearchVisible && (
        <div className="absolute top-0 left-0 right-0 bg-card/80 backdrop-blur-sm z-20 h-16 flex items-center px-3 border-b border-border animate-fade-in-down">
          <div className="flex items-center flex-1">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="채팅 내용 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleNavigateResult("next");
                }
              }}
              autoFocus
              className="flex-1 bg-transparent px-3 text-foreground placeholder-muted-foreground focus:outline-none"
            />
          </div>
          {searchQuery && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-20 text-center">
                {searchResults.length > 0 ? `${currentResultIndex + 1} / ${searchResults.length}` : "0 / 0"}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateResult("prev");
                }}
                disabled={searchResults.length === 0}
                className="p-2 text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigateResult("next");
                }}
                disabled={searchResults.length === 0}
                className="p-2 text-muted-foreground hover:text-foreground disabled:text-muted-foreground/50 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          )}
          <button
            onClick={() => {
              setIsSearchVisible(false);
              setSearchQuery("");
            }}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {dialog && (
        <ConfirmationPopover
          title={"메시지 삭제"}
          message={"이 메시지를 삭제하시겠습니까?"}
          confirmText={"삭제"}
          cancelText="취소"
          onConfirm={confirmAction}
          onCancel={cancelAction}
        />
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {isLoadingHistory ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="ml-3 text-lg">이전 대화 기록을 불러오는 중...</p>
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <div className="flex flex-col justify-center items-center h-full text-muted-foreground">
                <MessageSquareText size={48} />
                <p className="mt-4 text-lg font-semibold">지금 첫 번째 메시지를 보내</p>
                <p>토론을 시작해 보세요!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMyMessage = user ? msg.author === (user.nickname || user.name) : false;
              const activeResult = searchResults[currentResultIndex];
              const isMessageReported = reportedMessageIds.has(msg.id);

              return (
                <div
                  key={msg.id}
                  ref={(el) => {
                    if (el) messageRefs.current.set(msg.id, el);
                    else messageRefs.current.delete(msg.id);
                  }}
                  data-message-id={msg.id}
                >
                  {isMyMessage ? (
                    <div className="group flex justify-end animate-fade-in-up">
                      <div className="flex flex-col gap-1 items-end">
                        <div className="flex gap-1 items-end flex-row-reverse">
                          <div className="px-3 py-2 rounded-2xl max-w-xs lg:max-w-md wrap-break-word bg-primary text-primary-foreground">
                            <div className="text-sm">
                              {msg.isHidden ? (
                                <span className="italic text-primary-foreground/70">가려진 메시지입니다.</span>
                              ) : (
                                renderMessageContent(msg, activeResult)
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(msg.created_at)}
                          </span>
                          {msg.message !== "메시지가 삭제되었습니다." && (
                            <div className="flex items-center self-end shrink-0">
                              <button
                                onClick={(e) => openConfirmation(e, msg.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100"
                                title="메시지 삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="group flex gap-2.5 animate-fade-in-up">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border mt-1">
                        <Image
                          src={msg.profile_image_url!}
                          alt={`${msg.author}'s profile`}
                          fill
                          className="rounded-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-muted-foreground font-medium">{msg.author}</span>
                        <div className="flex gap-1 items-end">
                          <div className="px-3 py-2 rounded-2xl max-w-xs lg:max-w-md wrap-break-word bg-secondary text-secondary-foreground">
                            <div className="text-sm">
                              {msg.isHidden ? (
                                <span className="italic text-muted-foreground">가려진 메시지입니다.</span>
                              ) : (
                                renderMessageContent(msg, activeResult)
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(msg.created_at)}
                          </span>
                          {msg.message !== "메시지가 삭제되었습니다." && (
                            <div className="flex items-center self-end shrink-0">
                              <button
                                onClick={(e) => openReportModal(e, msg.id)}
                                className="text-muted-foreground hover:text-yellow-500 transition-colors p-1 rounded-full opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="메시지 신고"
                                disabled={isMessageReported}
                              >
                                <Flag className="w-4 h-4" />
                              </button>
                            </div>
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

      {toast &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: toast.top,
              left: toast.left,
              transform: `translateY(-100%) ${toast.alignment === "right" ? "translateX(-100%)" : ""}`,
              zIndex: 9999,
            }}
          >
            <ToastNotification
              id="portal-toast"
              message={toast.message}
              type={toast.type}
              onDismiss={() => setToast(null)}
              duration={3500}
            />
          </div>,
          document.body
        )}

      {isReportModalOpen && reportTargetMessageId && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setReportTargetMessageId(null);
          }}
          reportType="chat"
          targetId={reportTargetMessageId}
          onReportSuccess={(message, type, reportedId) => handleReportSuccess(message, type, reportedId)}
        />
      )}

      <div className={`shrink-0 px-4 py-4 ${isDarkMode ? 'border-t border-white/10' : 'border-t border-border bg-background/50'}`}>
        {socketError && (
          <div className="flex items-center text-destructive text-xs mb-2">
            <AlertTriangle className="w-4 h-4 mr-1" />
            {socketError}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
            accept="image/*,video/*"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 h-10 w-10 flex justify-center items-center bg-secondary hover:bg-accent rounded-md text-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isConnected || !user || !!socketError || isSending || isUploading || !topic}
            title="Attach file"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
          </button>
          <input
            type="text"
            placeholder={getPlaceholderText()}
            disabled={!isConnected || !user || !!socketError || isSending || isUploading || !topic}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 bg-input border border-border rounded-md text-sm text-foreground placeholder-muted-foreground disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <button
            type="submit"
            disabled={
              !isConnected || !user || !!socketError || !newMessage.trim() || isSending || isUploading || !topic
            }
            className={`p-2 h-10 w-10 flex justify-center items-center bg-primary rounded-md text-primary-foreground transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary ${
              !(!isConnected || !user || !!socketError || !newMessage.trim() || isSending || !topic) ? "scale-110" : ""
            }`}
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {zoomedImageUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 sm:p-8 z-[9999] animate-fade-in-fast"
          onClick={() => setZoomedImageUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white opacity-80 hover:opacity-100 transition-opacity z-[10001]"
            title="Close (Esc)"
            onClick={() => setZoomedImageUrl(null)}
          >
            <X size={32} />
          </button>
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomedImageUrl}
              alt="Zoomed content"
              className="block max-w-full max-h-full object-contain animate-zoom-in opacity-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}

