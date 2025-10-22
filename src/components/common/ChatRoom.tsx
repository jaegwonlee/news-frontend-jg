'use client';

import { useState, useRef, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) {
      setMessages([{ author: "System", message: "토론방 ID가 없습니다.", timestamp: "" }]);
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessages([{ author: "System", message: "채팅에 참여하려면 로그인이 필요합니다.", timestamp: "" }]);
      return;
    }

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit('join_room', roomId);
      setMessages(prev => [...prev, { author: "System", message: `토론방 '${title}'에 연결되었습니다.`, timestamp: "" }]);
    });

    socket.on("receive_message", (data: Message) => {
      // Assuming server sends timestamp, otherwise this needs adjustment
      const messageData = {
        ...data,
        timestamp: data.timestamp || new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
      };
      setMessages(prev => [...prev, messageData]);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setMessages(prev => [...prev, { author: "System", message: `연결 오류: ${err.message}`, timestamp: "" }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, title]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current && roomId && user) {
      socketRef.current.emit("send_message", {
        room: roomId,
        message: newMessage,
      });

      const sentMessage: Message = {
        author: user.nickname || 'Unknown',
        message: newMessage,
        profileImage: user.profileImage,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
      };
      setMessages(prev => [...prev, sentMessage]);

      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
      <h2 className="text-2xl font-bold text-white px-6 py-4 border-b-2 border-neutral-800">
        {title}
      </h2>
      <div ref={messageContainerRef} className="flex-grow min-h-0 overflow-y-auto p-6 custom-scrollbar space-y-6">
        {messages.map((msg, index) => {
          const isMyMessage = msg.author === user?.nickname;
          if (msg.author === "System") {
            return (
              <div key={index} className="text-center text-sm text-gray-400 py-2">
                <p className="bg-neutral-900 inline-block px-3 py-1 rounded-full">{msg.message}</p>
              </div>
            )
          }
          return (
            <div key={index} className={`flex items-start gap-3 ${isMyMessage ? "justify-end" : "justify-start"}`}>
              {!isMyMessage && (
                <img
                  src={msg.profileImage || '/placeholder-image.svg'}
                  alt={msg.author}
                  className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700"
                />
              )}

              <div className={`flex flex-col max-w-sm ${isMyMessage ? "items-end" : "items-start"}`}>
                {!isMyMessage && (
                  <span className="text-sm text-gray-300 mb-1.5 mx-2">{msg.author}</span>
                )}
                <div className={`flex items-end gap-2 ${isMyMessage ? "flex-row-reverse" : ""}`}>
                  <div className={`px-4 py-3 rounded-2xl break-words shadow-md text-sm ${isMyMessage
                      ? 'bg-blue-700 text-white rounded-br-none border border-blue-600'
                      : 'bg-neutral-800 text-neutral-100 rounded-bl-none border-neutral-700'
                    }`}>
                    {msg.message}
                  </div>
                  <span className="text-xs text-gray-500 pb-1 whitespace-nowrap">{msg.timestamp}</span>
                </div>
              </div>

              {isMyMessage && (
                <img
                  src={user?.profileImage || '/placeholder-image.svg'}
                  alt={msg.author}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
              )}
            </div>
          )
        })}
      </div>
      <form
        onSubmit={handleSendMessage}
        className="flex items-center p-4 border-t-2 border-neutral-800 bg-neutral-950"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow bg-neutral-800 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-neutral-700 focus:border-blue-500 transition-all duration-300 shadow-inner"
          placeholder={user && roomId ? "메시지를 입력하세요..." : "로그인 후 이용 가능합니다."}
          disabled={!user || !roomId}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold p-4 ml-3 rounded-xl hover:bg-blue-500 transition-colors duration-200 disabled:bg-neutral-700 disabled:cursor-not-allowed flex-shrink-0"
          disabled={!newMessage.trim() || !user || !roomId}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </form>
    </div>
  );
}