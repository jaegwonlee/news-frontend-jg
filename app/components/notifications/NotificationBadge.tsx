"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useNotifications } from "@/app/context/NotificationContext"; // Import useNotifications
import { getUnreadCount } from "@/lib/api/notifications";
import { Bell } from "lucide-react";
import { useEffect } from "react";

interface NotificationBadgeProps {
  // onClick?: () => void; // Removed onClick prop
}

export default function NotificationBadge() { // Removed onClick from props
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
    <div // Changed from button to div
      className="relative" // Simplified class, parent button will handle interactivity styling
    >
      <Bell className="w-5 h-5 text-[var(--icon-adaptive)] hover:text-foreground transition-transform group-hover:scale-125" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse" />
      )}
    </div>
  );
}
