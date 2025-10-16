"use client";

import { useState, useRef, useEffect } from "react";

interface ChatRoomProps {
  title: string;
}

export default function ChatRoom({ title }: ChatRoomProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, newMessage]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl">
      <h2 className="text-xl font-bold text-white px-5 pt-4 pb-3 border-b border-neutral-800">
        {title}
      </h2>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="text-neutral-200 mb-3 bg-neutral-800 p-3 rounded-lg text-sm w-fit"
          >
            {msg}
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
          className="flex-grow bg-neutral-800 text-white rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-all duration-300"
          placeholder="메시지를 입력하세요..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-5 py-2.5 ml-2 rounded-lg hover:bg-blue-500 transition-colors duration-200 disabled:bg-neutral-700 disabled:cursor-not-allowed"
          disabled={!newMessage.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
}