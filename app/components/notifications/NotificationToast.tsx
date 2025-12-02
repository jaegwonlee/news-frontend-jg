"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useNotifications } from "@/app/context/NotificationContext"; // Import useNotifications
import { Notification } from "@/lib/types/notification"; // Import Notification type
import { markAsRead } from "@/lib/api/notifications";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Clock, Star, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react"; // Added useRef

export default function NotificationToast() {
  const [activeToasts, setActiveToasts] = useState<Notification[]>([]); // Renamed for clarity
  const { notifications: allNotifications } = useNotifications(); // Get all notifications from context
  const lastNotificationId = useRef<number | null>(null); // To track last toastable notification
  const router = useRouter();
  const { token } = useAuth();

  // Effect to add new notifications to active toasts
  useEffect(() => {
    if (allNotifications.length > 0) {
      const latestNotification = allNotifications[0]; // Assuming new notifications are added to the beginning
      // Ensure we only toast new, previously unseen notifications
      if (latestNotification.id !== lastNotificationId.current && !latestNotification.is_read) {
        setActiveToasts((prev) => [...prev, latestNotification]);
        lastNotificationId.current = latestNotification.id;

        // 5초 후 자동 제거
        const timer = setTimeout(() => {
          setActiveToasts((prev) => prev.filter((n) => n.id !== latestNotification.id));
        }, 5000);

        return () => clearTimeout(timer); // Cleanup timeout if component unmounts or notification is dismissed
      }
    }
  }, [allNotifications]); // Depend on allNotifications from context

  const handleClose = (id: number) => {
    setActiveToasts((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClick = async (notification: Notification) => { // Use Notification type
    if (token) {
      try {
        await markAsRead(token, notification.id);
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
    handleClose(notification.id);
    if (notification.url) {
      router.push(notification.url);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "BREAKING_NEWS":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "EXCLUSIVE_NEWS":
        return <Star className="w-5 h-5 text-yellow-500" />;
      case "VOTE_REMINDER":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "NEW_TOPIC":
        return <Zap className="w-5 h-5 text-purple-500" />;
      case "ADMIN_NOTICE": // Added ADMIN_NOTICE icon
        return <Bell className="w-5 h-5 text-zinc-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {activeToasts.map((notification) => ( // Use activeToasts
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            layout
            className="pointer-events-auto w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleClick(notification)}
          >
            <div className="p-4 flex gap-3">
              {/* 썸네일 또는 아이콘 */}
              {notification.metadata?.thumbnail_url ? (
                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={notification.metadata.thumbnail_url}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  {getIcon(notification.type)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      notification.type === "BREAKING_NEWS"
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : notification.type === "EXCLUSIVE_NEWS"
                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {notification.type === "BREAKING_NEWS"
                      ? "속보"
                      : notification.type === "EXCLUSIVE_NEWS"
                      ? "단독"
                      : notification.type === "NEW_TOPIC"
                      ? "새 토픽"
                      : "알림"}
                  </span>
                  <span className="text-xs text-zinc-400">방금 전</span>
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                  {notification.message}
                </p>
                {notification.metadata?.source && (
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    {notification.metadata.source_domain && (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${notification.metadata.source_domain}&sz=16`}
                        alt=""
                        className="w-3 h-3"
                      />
                    )}
                    {notification.metadata.source}
                  </p>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose(notification.id);
                }}
                className="flex-shrink-0 -mr-2 -mt-2 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
