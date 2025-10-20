"use client";

import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client"; // Import io and Socket type
import { useAuth } from "@/context/AuthContext"; // Import useAuth

interface ChatRoomProps {
  title: string;
  roomId: string; // roomId를 필수로 변경
}

interface ChatMessage {
  message: string;
  author: string;
}

export default function ChatRoom({ title, roomId }: ChatRoomProps) { // roomId 기본값 제거
  const { isAuthenticated, user } = useAuth(); // Use auth context
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Store ChatMessage objects
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null); // Ref to store socket instance

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, skipping socket connection.");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Auth token not found, skipping socket connection.");
      return;
    }

    const socket = io('https://news-buds.onrender.com', {
      auth: {
        token: token,
      },
      transports: ['websocket']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socket.emit('join_room', roomId);
    });

    socket.on('receive_message', (data: ChatMessage) => {
      console.log('Received message:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, roomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socketRef.current && isAuthenticated && user) {
      const messageData: ChatMessage = {
        message: newMessage,
        author: user.nickname,
      };
      socketRef.current.emit('send_message', { room: roomId, message: messageData.message });
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setNewMessage("");
    } else if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl">
      <h2 className="text-xl font-bold text-white px-5 pt-4 pb-1 border-b border-neutral-800">
        {title} <span className="text-sm text-neutral-400"> (Room ID: {roomId})</span>
      </h2>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="text-neutral-200 mb-3 p-3 rounded-lg text-sm w-fit"
          >
            <span className="font-bold text-blue-400">{msg.author}:</span> {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="flex items-center p-3 border-t border-neutral-800"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow bg-neutral-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent
       focus:border-blue-500 transition-all duration-300"
          placeholder={isAuthenticated ? "메시지를 입력하세요..." : "로그인 후 메시지를 입력할 수 있습니다."}
          disabled={!isAuthenticated}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-5 py-2.5 ml-2 rounded-lg hover:bg-blue-500 transition-colors duration-200 disabled:bg-neutral-700
       disabled:cursor-not-allowed"
          disabled={!newMessage.trim() || !isAuthenticated}
        >
          전송
        </button>
      </form>
    </div>
  );
}
