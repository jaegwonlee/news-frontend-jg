import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { NotificationType } from '@/types';

const NOTIFICATION_TYPE_NAMES: Record<NotificationType, string> = {
  NEW_TOPIC: "새 토픽 알림",
  BREAKING_NEWS: "속보 알림",
  EXCLUSIVE_NEWS: "단독 뉴스 알림",
};

export default function NotificationSettings() {
  const { settings, isLoading, error, handleToggle } = useNotificationSettings();

  if (isLoading) {
    return (
      <>
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-700 pb-3">알림 설정</h2>
        <p className="text-zinc-400">로딩 중...</p>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-700 pb-3">알림 설정</h2>
      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.notification_type} className="flex items-center justify-between p-3 bg-zinc-800 rounded-md border border-zinc-700">
            <span className="text-lg text-white">{NOTIFICATION_TYPE_NAMES[setting.notification_type]}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={setting.is_enabled}
                onChange={() => handleToggle(setting.notification_type)}
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-500 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-4">{error}</p>
      )}
    </>
  );
}
