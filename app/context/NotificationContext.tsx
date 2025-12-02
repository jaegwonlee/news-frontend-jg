// app/context/NotificationContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Notification, NotificationType } from "@/lib/types/notification";

// 1. Define the context type
interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void; // Added for initial fetch
  isSidePanelOpen: boolean;
  toggleSidePanel: (isOpen?: boolean) => void;
}

// 2. Create the context with default values
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// 3. Create the provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Placeholder for adding a new notification (e.g., from Socket.IO)
  const addNotification = (newNotification: Notification) => {
    setNotifications((prev) => [newNotification, ...prev]);
    if (!newNotification.is_read) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Placeholder for marking a single notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
    );
    // Potentially decrement unreadCount if the notification was unread
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Placeholder for marking all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
    setUnreadCount(0);
  };

  const toggleSidePanel = (isOpen?: boolean) => {
    setIsSidePanelOpen((prev) => (isOpen !== undefined ? isOpen : !prev));
  };

  const value = {
    unreadCount,
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    setUnreadCount,
    isSidePanelOpen,
    toggleSidePanel,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// 4. Create a custom hook to use the context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
