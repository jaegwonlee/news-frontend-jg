"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { User, UserUpdate, Article } from "@/types"; // UserUpdate is now available, Article added for liked articles
import { getUserProfile, getAvatars, updateUserProfile, getLikedArticles } from "@/lib/api"; // getAvatars, updateUserProfile, getLikedArticles are now available
import FormField from "@/app/components/auth/FormField"; // Re-using FormField for consistency and easy input
import { BACKEND_BASE_URL } from "@/lib/constants"; // Import BACKEND_BASE_URL
import ArticleCard from "@/app/components/ArticleCard"; // Import ArticleCard

export default function ProfilePage() {
  const { token, logout, login } = useAuth(); // Added login to update context user
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentProfileData, setCurrentProfileData] = useState<User | null>(null); // To hold original data when entering edit mode
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(undefined);
  const [isUpdating, setIsUpdating] = useState(false); // For update button loading state

  // State for liked articles
  const [likedArticles, setLikedArticles] = useState<Article[]>([]);
  const [isLoadingLikedArticles, setIsLoadingLikedArticles] = useState(true);
  const [likedArticlesError, setLikedArticlesError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfileAndAvatars = async () => {
      setError(null);
      try {
        setIsLoading(true);
        const userProfile = await getUserProfile(token);
        console.log("getUserProfile response profile_image_url:", userProfile.profile_image_url);
        setProfile(userProfile);
        setCurrentProfileData(userProfile); // Store original data
        // Construct full URL for selected avatar
        setSelectedAvatar(userProfile.profile_image_url ? userProfile.profile_image_url : undefined);

                const avatarList = await getAvatars();

                setAvatars(avatarList);

      } catch (err: any) {
        setError(err.message || "프로필 정보를 불러오는데 실패했습니다.");
        if (String(err.message).includes("401")) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndAvatars();
  }, [token, router, logout]);

  // Effect to fetch liked articles
  useEffect(() => {
    if (!token) {
      setLikedArticles([]);
      setIsLoadingLikedArticles(false);
      return;
    }

    const fetchLiked = async () => {
      setIsLoadingLikedArticles(true);
      setLikedArticlesError(null);
      try {
        const articles = await getLikedArticles(token);
        setLikedArticles(articles);
      } catch (err: any) {
        setLikedArticlesError(err.message || "좋아요한 기사를 불러오는데 실패했습니다.");
      } finally {
        setIsLoadingLikedArticles(false);
      }
    };
    fetchLiked();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleArticleUnlike = (articleId: number) => {
    setLikedArticles((prevArticles) =>
      prevArticles.filter((article) => article.id !== articleId)
    );
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !profile) return;
    setError(null);

    const relativeAvatarUrl = selectedAvatar ? selectedAvatar.replace(BACKEND_BASE_URL, "") : undefined;

    const updatedData: UserUpdate = {
      nickname: profile.nickname,
      introduction: profile.introduction,
      profile_image_url: relativeAvatarUrl, // 상대 경로 전송
      phone: profile.phone, // Include phone for update
    };

    try {
      setIsUpdating(true); // Set updating state
      const updatedUser = await updateUserProfile(token, updatedData);
      console.log("updateUserProfile response profile_image_url:", updatedUser.profile_image_url);
      setProfile(updatedUser);
      setCurrentProfileData(updatedUser); // Update original data
      // 👇 선택된 아바타 상태도 업데이트 (전체 URL로)
      setSelectedAvatar(updatedUser.profile_image_url ? updatedUser.profile_image_url : undefined);
      login(token, updatedUser); // Context 업데이트
      setIsEditing(false); // Exit edit mode
      // alert("프로필이 성공적으로 업데이트되었습니다."); // Too intrusive
    } catch (err: any) {
      setError(err.message || "프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false); // Reset updating state
    }
  };

  const handleCancelEdit = () => {
    setProfile(currentProfileData); // Revert changes
    //  취소 시에도 전체 URL로 복구
    setSelectedAvatar(currentProfileData?.profile_image_url ? currentProfileData.profile_image_url : undefined);
    setIsEditing(false);
    setError(null); // Clear any edit errors
  };

  if (isLoading) {
    return <div className="text-center py-10 text-white">프로필 로딩 중...</div>;
  }

  if (error && !isEditing) { // Only show fetch error if not in editing mode
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center py-10 text-white">프로필 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
      <div className="bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-700">
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
          {/* Profile Image Display / Selection */}
          <div className="relative w-32 h-32">
            <Image
              // 👇 전체 URL 사용 (selectedAvatar 또는 profile에서 가져옴)
              src={isEditing ? (selectedAvatar || "/user-placeholder.svg") : (profile.profile_image_url || "/user-placeholder.svg")}
              alt="프로필 이미지"
              width={128}
              height={128}
              className="rounded-full object-cover border-4 border-zinc-700"
              // 외부 URL이므로 unoptimized 추가
              unoptimized={!!(isEditing ? selectedAvatar : profile.profile_image_url)}
            />
          </div>
          {/* Profile Details */}
          <div className="text-center sm:text-left flex-1">
            {isEditing ? (
              <input
                type="text"
                name="nickname"
                value={profile.nickname || ""}
                onChange={handleInputChange}
                className="text-3xl font-bold bg-zinc-800 border border-zinc-600 rounded-md py-1 px-2 mb-1 w-full"
              />
            ) : (
              <h1 className="text-3xl font-bold">{profile.nickname || profile.name}</h1>
            )}
            <p className="text-zinc-400">{profile.email}</p>
            {isEditing ? (
              <FormField
                id="phone"
                label="전화번호"
                type="tel"
                name="phone"
                value={profile.phone || ""}
                onChange={handleInputChange}
              />
            ) : (
              profile.phone && <p className="text-zinc-400">전화번호: {profile.phone}</p>
            )}
            {isEditing ? (
              <textarea
                name="introduction"
                value={profile.introduction || ""}
                onChange={handleInputChange}
                rows={3}
                className="mt-2 text-zinc-300 bg-zinc-800 border border-zinc-600 rounded-md py-1 px-2 w-full"
                placeholder="자기소개를 입력하세요."
              />
            ) : (
              profile.introduction && <p className="mt-2 text-zinc-300">{profile.introduction}</p>
            )}
          </div>
        </div>

        {/* Edit / Save / Cancel Buttons */}
        <div className="border-t border-zinc-700 pt-8">
          {error && isEditing && ( // Show edit error only in editing mode
            <div className="text-red-400 text-sm text-center p-2 bg-red-900/50 rounded-md mb-4">{error}</div>
          )}

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Avatar Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">아바타 선택</label>
                <div className="flex flex-wrap gap-3 p-3 bg-zinc-800 rounded-md border border-zinc-700">
                  {avatars.map((avatarUrl, index) => (
                    <div
                      key={index}
                      className={`relative w-16 h-16 rounded-full cursor-pointer overflow-hidden \ 
                                  ${selectedAvatar === avatarUrl ? 'ring-2 ring-blue-500' : 'ring-1 ring-zinc-600'} \ 
                                  hover:ring-blue-400 transition-all`}
                      onClick={() => setSelectedAvatar(avatarUrl)}
                    >
                      <Image
                        // 👇 src에는 전체 URL (avatarUrl) 사용
                        src={avatarUrl}
                        alt={`Avatar ${index}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-full"
                         // 외부 URL이므로 unoptimized 추가
                        unoptimized={true}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save/Cancel buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-semibold text-white bg-zinc-600 rounded-md hover:bg-zinc-700"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-zinc-500"
                >
                  {isUpdating ? "저장 중..." : "변경사항 저장"}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                프로필 수정
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Liked Articles Section */}
      <section className="mt-12 bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-700">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-700 pb-3">좋아요한 기사</h2>
        {isLoadingLikedArticles ? (
          <div className="text-center py-10 text-zinc-400">좋아요한 기사 로딩 중...</div>
        ) : likedArticlesError ? (
          <div className="text-center py-10 text-red-500">오류: {likedArticlesError}</div>
        ) : likedArticles.length === 0 ? (
          <div className="text-center py-10 text-zinc-400">아직 좋아요한 기사가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} onLikeToggle={handleArticleUnlike} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
