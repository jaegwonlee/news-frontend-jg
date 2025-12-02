// app/notifications/page.tsx
"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useNotifications } from "@/app/context/NotificationContext";
import { getNotifications, markAllAsRead, markAsRead } from "@/lib/api/notifications";
import { Notification, NotificationType } from "@/lib/types/notification";
import { formatRelativeTime } from "@/lib/utils";
import { Bell, AlertCircle, Star, Clock, Zap, MessageSquare, Megaphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image"; // For Image component

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: number) => void;
  token: string | null;
}

const NotificationItem = ({ notification, onRead, token }: NotificationItemProps) => {
  const router = useRouter();

  const handleNotificationClick = async () => {
    if (!notification.is_read && token) {
      await markAsRead(token, notification.id);
      onRead(notification.id);
    }
    router.push(notification.url);
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_TOPIC:
        return <Zap className="w-5 h-5 text-purple-500" />; // 투표함 icon is not in lucide-react, using Zap
      case NotificationType.BREAKING_NEWS:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case NotificationType.EXCLUSIVE_NEWS:
        return <Star className="w-5 h-5 text-yellow-500" />;
      case NotificationType.VOTE_REMINDER:
        return <Clock className="w-5 h-5 text-blue-500" />;
      case NotificationType.ADMIN_NOTICE:
        return <Megaphone className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-500" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
        notification.is_read ? "bg-zinc-50 dark:bg-zinc-800" : "bg-blue-50 dark:bg-blue-900/20"
      } hover:bg-zinc-100 dark:hover:bg-zinc-700`}
      onClick={handleNotificationClick}
    >
      {notification.metadata?.thumbnail_url ? (
        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden relative">
          <Image
            src={notification.metadata.thumbnail_url}
            alt="Thumbnail"
            fill
            sizes="64px"
            style={{ objectFit: "cover" }}
            className="rounded-md"
          />
        </div>
      ) : (
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
          {getIcon(notification.type)}
        </div>
      )}

      <div className="flex-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {notification.metadata?.source_domain && (
            <img
              src={`https://www.google.com/s2/favicons?domain=${notification.metadata.source_domain}&sz=16`}
              alt=""
              className="w-4 h-4"
            />
          )}
          {notification.metadata?.source && <span>{notification.metadata.source}</span>}
          <span>{formatRelativeTime(notification.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default function NotificationsPage() {
  const { token } = useAuth();
  const { notifications: contextNotifications, markAsRead, markAllAsRead, setUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedNotifications = await getNotifications(token);
      setNotifications(Array.isArray(fetchedNotifications) ? fetchedNotifications : []);
    } catch (err: any) {
      setError(err.message || "알림을 불러오는데 실패했습니다.");
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await markAllAsRead(token);
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
      markAllAsRead(); // Update context
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
    );
    markAsRead(id); // Update context
  };

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">알림</h1>

      {loading && <p className="text-center text-zinc-500">알림을 불러오는 중...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && notifications.length === 0 && (
        <div className="text-center p-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
          <p className="text-zinc-500">새로운 알림이 없습니다.</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-zinc-600 dark:text-zinc-300">
              읽지 않은 알림: <span className="font-bold">{unreadCount}</span>개
            </p>
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={unreadCount === 0}
            >
              모두 읽음으로 표시
            </button>
          </div>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleNotificationRead}
                token={token}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}