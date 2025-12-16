import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { NotificationType } from "@/lib/types/shared";
import ErrorMessage from "../common/ErrorMessage";
import LoadingSpinner from "../common/LoadingSpinner";

const NOTIFICATION_DETAILS: Record<NotificationType, { name: string; description: string }> = {
  NEW_TOPIC: {
    name: "새 토픽 알림",
    description: "새로운 토론 주제가 생성되었을 때 알림을 받습니다.",
  },
  BREAKING_NEWS: {
    name: "속보 알림",
    description: "중요한 속보 뉴스가 발생했을 때 알림을 받습니다.",
  },
  EXCLUSIVE_NEWS: {
    name: "단독 뉴스 알림",
    description: "저희 플랫폼에서만 볼 수 있는 단독 뉴스가 발행될 때 알림을 받습니다.",
  },
  VOTE_REMINDER: {
    name: "투표 알림",
    description: "참여했던 토론의 투표 마감 시간이 다가올 때 알림을 받습니다.",
  },
  ADMIN_NOTICE: {
    name: "관리자 공지",
    description: "서비스 관련 중요 공지사항이 있을 때 알림을 받습니다.",
  },
  FRIEND_REQUEST: {
    name: "친구 요청",
    description: "다른 사용자로부터 친구 요청을 받았을 때 알림을 받습니다.",
  },
};

export default function NotificationSettings() {
  const { settings, isLoading, error, handleToggle } = useNotificationSettings();

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12.02 2.90991C8.70997 2.90991 6.01997 5.59991 6.01997 8.90991V11.7999C6.01997 12.4099 5.75997 13.3399 5.44997 13.8599L4.29997 15.7699C3.58997 16.9499 4.07997 18.2599 5.37997 18.2599H18.66C19.96 18.2599 20.45 16.9499 19.74 15.7699L18.59 13.8599C18.28 13.3399 18.02 12.4099 18.02 11.7999V8.90991C18.02 5.60991 15.32 2.90991 12.02 2.90991Z"
            opacity="0.4"
          />
          <path d="M13.87 3.20009C13.26 3.10009 12.64 3.10009 12.02 3.20009C11.36 3.14009 10.63 3.39009 10.15 3.91009C10.03 4.04009 9.99995 4.23009 10.0699 4.39009C10.1399 4.54009 10.29 4.65009 10.46 4.65009H13.59C13.76 4.65009 13.91 4.54009 13.98 4.39009C14.05 4.23009 14.01 4.04009 13.89 3.91009C13.41 3.39009 12.68 3.14009 12 3.20009H13.87Z" />
          <path d="M15.02 19.0601C15.02 20.7101 13.67 22.0601 12.02 22.0601C11.2007 22.0566 10.4162 21.7283 9.83786 21.1471C9.2595 20.5658 8.9348 19.7797 8.9348 18.9601V18.2601H15.02V19.0601Z" />
        </svg>
      </div>

      <div className="relative z-10 mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white mb-2">
          Ringside <span className="text-blue-600">Comms</span>
        </h2>
        <p className="text-zinc-500 font-medium">Configure how your cornermen reach you.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <LoadingSpinner size="large" />
        </div>
      )}

      {error && (
        <div className="my-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-4">
          {settings.map((setting) => (
            <div
              key={setting.notificationType}
              className="flex items-center justify-between p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex flex-col pr-4">
                <span className="font-bold text-zinc-900 dark:text-white text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {(() => {
                    const name = NOTIFICATION_DETAILS[setting.notificationType].name;
                    const words = name.split(" ");
                    if (words[0] === "속보") {
                      return (
                        <>
                          <span className="text-red-600 font-black italic uppercase">BREAKING</span> NEWS
                        </>
                      );
                    }
                    if (words[0] === "단독") {
                      return (
                        <>
                          <span className="text-blue-600 font-black italic uppercase">EXCLUSIVE</span> NEWS
                        </>
                      );
                    }
                    if (words[0] === "관리자") {
                      return (
                        <>
                          <span className="text-zinc-900 dark:text-white font-black uppercase">OFFICIAL</span> NOTICE
                        </>
                      );
                    }
                    return name;
                  })()}
                </span>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                  {NOTIFICATION_DETAILS[setting.notificationType].description}
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={setting.isEnabled}
                  onChange={() => handleToggle(setting.notificationType)}
                />
                <div className="w-14 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full peer-focus:outline-none ring-offset-2 ring-offset-white dark:ring-offset-black peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-300 peer-checked:bg-blue-600 peer-checked:shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
