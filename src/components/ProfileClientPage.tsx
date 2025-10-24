"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const ProfileClientPage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile States
  const [nickname, setNickname] = useState(user?.nickname || "사용자");
  const [email, setEmail] = useState(user?.email || "user@example.com");
  const [profileImage, setProfileImage] = useState(
    user?.profileImage || "/user-placeholder.svg"
  );
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification States
  const [breakingNews, setBreakingNews] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(true);
  const [latestNews, setLatestNews] = useState(false);
  const [popularTopics, setPopularTopics] = useState(true);
  const [latestTopics, setLatestTopics] = useState(false);

  // Dummy data for activity
  const savedItems = [
    { id: 1, title: "저장된 기사 1", date: "2023-01-15" },
    { id: 2, title: "저장된 기사 2", date: "2023-02-20" },
  ];
  const likedItems = [
    { id: 1, title: "좋아요 누른 게시물 1", date: "2023-03-10" },
    { id: 2, title: "좋아요 누른 게시물 2", date: "2023-04-05" },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = () => {
    setIsEditingNickname(false);
    setIsEditingEmail(false);
    console.log("Saving profile:", { nickname, email, profileImage });
    // API call to save profile data
  };

  const handleNotificationsSave = () => {
    console.log("Saving notifications:", { breakingNews, newsAlerts, latestNews, popularTopics, latestTopics });
    // API call to save notification settings
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const Toggle = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="flex items-center justify-between p-3 bg-[#333] rounded-md">
      <span className="text-gray-300">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#212121] text-gray-100 p-4 sm:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto bg-[#212121] rounded-xl shadow-2xl overflow-hidden md:flex">
        {/* Sidebar Navigation */}
        <div className="md:w-1/4 bg-[#212121] p-6 space-y-4 border-r border-gray-700">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                activeTab === "profile" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              프로필
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                activeTab === "activity" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              내 활동
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                activeTab === "notifications" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              알림
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                activeTab === "settings" ? "bg-indigo-600 text-white shadow-md" : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              계정 설정
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 bg-red-600 hover:bg-red-700 text-white shadow-md mt-4"
            >
              로그아웃
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="md:w-3/4 p-6 lg:p-8">
          {activeTab === "profile" && (
            <>
              <h1 className="text-3xl font-extrabold text-white mb-8">프로필 설정</h1>
              <div className="space-y-8">
                <div className="flex flex-col items-center space-y-4">
                  <Image
                    className="rounded-full object-cover border-4 border-indigo-500"
                    src={profileImage}
                    alt="프로필 이미지"
                    width={128}
                    height={128}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors duration-200"
                  >
                    이미지 변경
                  </button>
                </div>
                <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-lg border border-gray-700">
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-2">
                    닉네임
                  </label>
                  <div className="flex items-center space-x-4">
                    {isEditingNickname ? (
                      <input
                        type="text"
                        id="nickname"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="grow p-3 rounded-md bg-gray-800 border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                      />
                    ) : (
                      <p className="grow text-white text-lg">{nickname}</p>
                    )}
                    <button
                      onClick={() => setIsEditingNickname(!isEditingNickname)}
                      className="py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors duration-200"
                    >
                      {isEditingNickname ? "완료" : "수정"}
                    </button>
                  </div>
                </div>
                <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-lg border border-gray-700">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    이메일
                  </label>
                  <div className="flex items-center space-x-4">
                    {isEditingEmail ? (
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="grow p-3 rounded-md bg-gray-800 border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                      />
                    ) : (
                      <p className="grow text-white text-lg">{email}</p>
                    )}
                    <button
                      onClick={() => setIsEditingEmail(!isEditingEmail)}
                      className="py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors duration-200"
                    >
                      {isEditingEmail ? "완료" : "수정"}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleProfileSave}
                  className="mt-6 w-full py-3 px-4 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors duration-200"
                >
                  전체 변경사항 저장
                </button>
              </div>
            </>
          )}

          {activeTab === "activity" && (
            <>
              <h1 className="text-3xl font-extrabold text-white mb-6">내 활동 내역</h1>
              <div className="bg-[#212121] p-6 rounded-lg shadow-lg border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-3">저장한 게시물</h3>
                    {savedItems.length > 0 ? (
                      <ul className="space-y-2">
                        {savedItems.map((item) => (
                          <li
                            key={item.id}
                            className="bg-[#2c2c2c] p-3 rounded-md flex justify-between items-center border border-gray-700"
                          >
                            <span className="text-gray-300">{item.title}</span>
                            <span className="text-gray-500 text-sm">{item.date}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">아직 저장한 게시물이 없습니다.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-3">좋아요 누른 게시물</h3>
                    {likedItems.length > 0 ? (
                      <ul className="space-y-2">
                        {likedItems.map((item) => (
                          <li
                            key={item.id}
                            className="bg-[#2c2c2c] p-3 rounded-md flex justify-between items-center border border-gray-700"
                          >
                            <span className="text-gray-300">{item.title}</span>
                            <span className="text-gray-500 text-sm">{item.date}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">아직 좋아요를 누른 게시물이 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <h1 className="text-3xl font-extrabold text-white mb-6">알림 설정</h1>
              <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-lg border border-gray-700 space-y-4">
                <Toggle
                  label="긴급뉴스 알림"
                  checked={breakingNews}
                  onChange={(e) => setBreakingNews(e.target.checked)}
                />
                <Toggle label="속보뉴스 알림" checked={newsAlerts} onChange={(e) => setNewsAlerts(e.target.checked)} />
                <Toggle label="최신뉴스 알림" checked={latestNews} onChange={(e) => setLatestNews(e.target.checked)} />
                <Toggle
                  label="인기 토픽 알림"
                  checked={popularTopics}
                  onChange={(e) => setPopularTopics(e.target.checked)}
                />
                <Toggle
                  label="최신토픽 알림"
                  checked={latestTopics}
                  onChange={(e) => setLatestTopics(e.target.checked)}
                />
                <button
                  onClick={handleNotificationsSave}
                  className="mt-6 w-full py-3 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors duration-200"
                >
                  알림 설정 저장
                </button>
              </div>
            </>
          )}

          {activeTab === "settings" && (
            <>
              <h1 className="text-3xl font-extrabold text-white mb-6">계정 설정</h1>
              <div className="space-y-6">
                <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-lg border border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-200 mb-3">비밀번호 변경</h3>
                  <p className="text-gray-300 mb-4">새 비밀번호를 설정합니다. (기능 예정)</p>
                  <button
                    className="py-2 px-4 rounded-md bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition-colors duration-200 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    비밀번호 변경
                  </button>
                </div>
                <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-lg border border-red-700">
                  <h3 className="text-xl font-semibold text-gray-200 mb-3">계정 삭제</h3>
                  <p className="text-gray-300 mb-4">
                    계정과 모든 콘텐츠를 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                  <button
                    className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors duration-200 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    계정 삭제
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileClientPage;
