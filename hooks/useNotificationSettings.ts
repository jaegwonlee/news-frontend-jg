
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getNotificationSettings, updateNotificationSettings } from '@/lib/api';
import { NotificationSetting, NotificationType } from '@/types';

const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  "NEW_TOPIC",
  "BREAKING_NEWS",
  "EXCLUSIVE_NEWS",
];

export const useNotificationSettings = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedSettings = await getNotificationSettings(token);
        // Merge fetched settings with default types to ensure all types are present
        const mergedSettings = ALL_NOTIFICATION_TYPES.map(type => {
          const existingSetting = fetchedSettings.find(s => s.notification_type === type);
          return existingSetting || { notification_type: type, is_enabled: true }; // Default to true if not set
        });
        setSettings(mergedSettings);
      } catch (err: any) {
        setError(err.message || "알림 설정을 불러오는데 실패했습니다.");
        // If error, initialize with all types enabled by default
        setSettings(ALL_NOTIFICATION_TYPES.map(type => ({ notification_type: type, is_enabled: true })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  const handleToggle = useCallback(async (notificationType: NotificationType) => {
    if (!token) return;
    
    const originalSettings = [...settings];
    const newSettings = settings.map(setting => 
      setting.notification_type === notificationType
        ? { ...setting, is_enabled: !setting.is_enabled }
        : setting
    );
    
    // Optimistic update
    setSettings(newSettings);
    setError(null);

    try {
      await updateNotificationSettings(token, newSettings);
    } catch (err: any) {
      // Revert on error
      setSettings(originalSettings);
      setError(err.message || "알림 설정 업데이트에 실패했습니다.");
    }
  }, [token, settings]);

  return {
    settings,
    isLoading,
    error,
    handleToggle,
  };
};
