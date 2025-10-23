"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Image from "next/image";
import { fetchChatHistory } from "@/lib/api";

interface ChatRoomProps {
  title: string;
  roomId?: string;
}

interface Message {
  author: string;
  message: string;
  profileImage?: string;
  timestamp: string;
}

const SOCKET_URL = "https://news02.onrender.com";

export default function ChatRoom({ title, roomId }: ChatRoomProps) {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) {
      setMessages([{ author: "System", message: "토론방 ID가 없습니다.", timestamp: "" }]);
      return;
    }

    // Disconnect and clean up existing socket connection if it exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    setMessages([]); // Clear messages when room or user changes

    const loadChatHistoryAndConnectSocket = async () => {
      // 1. Load chat history
      try {
        const history = await fetchChatHistory(roomId);
        const formattedHistory: Message[] = history.map(msg => ({
          author: msg.nickname,
          message: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }),
        }));
        setMessages(formattedHistory);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        setMessages((prev) => [...prev, { author: "System", message: "채팅 기록을 불러오지 못했습니다.", timestamp: "" }]);
      }

      // 2. Connect Socket.IO
      if (!token) {
        setMessages((prev) => [...prev, { author: "System", message: "채팅에 참여하려면 로그인이 필요합니다.", timestamp: "" }]);
        return;
      }

      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        socket.emit("join_room", roomId);
      });

      socket.on("receive_message", (data: Message) => {
        // Ignore messages from the current user (identified by name) to prevent duplication from server echo
        if (data.author === user?.name) {
          return;
        }

        console.log("Received message:", data);
        const messageData = {
          ...data,
          timestamp:
            data.timestamp ||
            new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }),
        };
        setMessages((prev) => [...prev, messageData]);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setMessages((prev) => [...prev, { author: "System", message: `연결 오류: ${err.message}`, timestamp: "" }]);
      });
    };

    loadChatHistoryAndConnectSocket();

    // Cleanup function to disconnect socket on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, title, user, token]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current && roomId && user) {
      const messageToSend = { room: roomId, message: newMessage };
      socketRef.current.emit("send_message", messageToSend);

      // Optimistic UI update using nickname for display
      const sentMessage: Message = {
        author: user.nickname || user.name || "Unknown", // Use nickname, fallback to name
        message: newMessage,
        profileImage: user.profileImage,
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }),
      };
      setMessages((prev) => [...prev, sentMessage]);

      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-neutral-200 rounded-2xl shadow-sm shadow-neutral-200/50 overflow-hidden dark:bg-neutral-950 dark:border-neutral-800 dark:shadow-2xl dark:shadow-black/50">
      <h2 className="text-2xl font-bold text-neutral-900 px-4 py-2 border-b-2 border-neutral-200 dark:text-white dark:border-neutral-800">{title}</h2>
      <div ref={messageContainerRef} className="flex-grow min-h-0 overflow-y-auto p-3 custom-scrollbar space-y-3">
        {messages.map((msg, index) => {
          // A user's own message is identified by matching either name or nickname.
          const isMyMessage = msg.author === user?.name || msg.author === user?.nickname;
          if (msg.author === "System") {
            return (
              <div key={index} className="text-center text-sm text-gray-400 py-1">
                <p className="bg-neutral-200 inline-block px-2 py-0.5 rounded-full text-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">{msg.message}</p>
              </div>
            );
          }
          return (
            <div key={index} className={`flex items-start gap-2 ${isMyMessage ? "justify-end" : "justify-start"}`}>
              {!isMyMessage && (
                <Image
                  src={msg.profileImage || "/placeholder-image.svg"}
                  alt={msg.author}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border-2 border-neutral-300 dark:border-neutral-700"
                />
              )}

              <div className={`flex flex-col max-w-sm ${isMyMessage ? "items-end" : "items-start"}`}>
                {!isMyMessage && <span className="text-xs text-neutral-700 mb-0.5 mx-1 dark:text-gray-300">{msg.author}</span>}
                <div className={`flex items-end gap-1 ${isMyMessage ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl break-words shadow-md text-sm ${
                      isMyMessage
                        ? "bg-blue-500 text-white rounded-br-none border border-blue-400 dark:bg-blue-700 dark:border-blue-600"
                        : "bg-neutral-200 text-neutral-900 rounded-bl-none border-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span className="text-xs text-neutral-500 pb-0.5 whitespace-nowrap dark:text-gray-500">{msg.timestamp}</span>
                </div>
              </div>

              {/* Removed profile image for current user's messages */}
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSendMessage} className="flex items-center p-2 border-t-2 border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow bg-neutral-200 text-neutral-900 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-neutral-300 focus:border-blue-500 transition-all duration-300 shadow-inner dark:bg-neutral-800 dark:text-white dark:border-neutral-700 dark:focus:border-blue-500"
          placeholder={user && roomId ? "메시지를 입력하세요..." : "로그인 후 이용 가능합니다."}
          disabled={!user || !roomId}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold p-2 ml-2 rounded-xl hover:bg-blue-700 transition-colors duration-200 disabled:bg-neutral-300 disabled:cursor-not-allowed flex-shrink-0 dark:bg-blue-600 dark:hover:bg-blue-500 dark:disabled:bg-neutral-700"
          disabled={!newMessage.trim() || !user || !roomId}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </form>
    </div>
  );
}