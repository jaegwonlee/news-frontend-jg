
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { getNotificationSettings, updateNotificationSettings } from '@/lib/api';

export const useNotificationSettings = () => {
  const { token } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
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
        const settings = await getNotificationSettings(token);
        setIsEnabled(settings.enabled);
      } catch (err: any) {
        setError(err.message || "알림 설정을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  const handleToggle = useCallback(async () => {
    if (!token) return;
    
    const originalState = isEnabled;
    const newState = !isEnabled;
    
    // Optimistic update
    setIsEnabled(newState);
    setError(null);

    try {
      await updateNotificationSettings(token, newState);
    } catch (err: any) {
      // Revert on error
      setIsEnabled(originalState);
      setError(err.message || "알림 설정 업데이트에 실패했습니다.");
    }
  }, [token, isEnabled]);

  return {
    isEnabled,
    isLoading,
    error,
    handleToggle,
  };
};
