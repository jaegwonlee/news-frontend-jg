'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import LikedArticles from '@/app/components/profile/LikedArticles';
import NotificationSettings from '@/app/components/profile/NotificationSettings';
import ProfileHeader from '@/app/components/profile/ProfileHeader';
import ProfileEditForm from '@/app/components/profile/ProfileEditForm';

import SavedArticles from '@/app/components/profile/SavedArticles';

export default function ProfilePage() {
  const {
    profile,
    isEditing,
    isLoading,
    error,
    avatars,
    selectedAvatar,
    isUpdating,
    handleInputChange,
    handleUpdateProfile,
    setIsEditing,
    setSelectedAvatar,
  } = useUserProfile();

  if (isLoading) {
    return <div className="text-center py-10 text-white">프로필 로딩 중...</div>;
  }

  if (error && !isEditing) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center py-10 text-white">프로필 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
      <NotificationSettings />

      <div className="bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-700">
        {!isEditing ? (
          <ProfileHeader profile={profile} />
        ) : (
          <ProfileEditForm
            profile={profile}
            avatars={avatars}
            selectedAvatar={selectedAvatar}
            isUpdating={isUpdating}
            error={error}
            onInputChange={handleInputChange}
            onUpdateProfile={handleUpdateProfile}
            onCancelEdit={() => setIsEditing(false)}
            onSetSelectedAvatar={setSelectedAvatar}
          />
        )}
        <div className="border-t border-zinc-700 pt-8">
          {!isEditing && (
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

      <LikedArticles />
      <SavedArticles />
    </div>
  );
}