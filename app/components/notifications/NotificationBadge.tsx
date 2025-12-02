"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useNotifications } from "@/app/context/NotificationContext"; // Import useNotifications
import { getUnreadCount } from "@/lib/api/notifications";
import { Bell } from "lucide-react";
import { useEffect } from "react";

interface NotificationBadgeProps {
  onClick?: () => void;
}

export default function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const { unreadCount, setUnreadCount } = useNotifications(); // Use useNotifications
  const { token } = useAuth();

  // 초기 로드 시 읽지 않은 알림 개수 조회
  useEffect(() => {
    if (token) {
      getUnreadCount(token).then((count) => {
        setUnreadCount(count); // Update NotificationContext's unreadCount
      });
    }
  }, [token, setUnreadCount]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="알림"
    >
      <Bell className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse" />
      )}
    </button>
  );
}
