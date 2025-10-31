'use client';

import { useNotificationSettings } from '@/hooks/useNotificationSettings';

export default function NotificationSettings() {
  const { isEnabled, isLoading, error, handleToggle } = useNotificationSettings();

  if (isLoading) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-700 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-700 pb-3">알림 설정</h2>
        <p className="text-zinc-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-700 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-700 pb-3">알림 설정</h2>
      <div className="flex items-center justify-between">
        <span className="text-lg">알림 받기</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isEnabled}
            onChange={handleToggle}
          />
          <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-500 peer-checked:bg-blue-600"></div>
        </label>
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
