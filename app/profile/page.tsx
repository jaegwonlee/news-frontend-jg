'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileTabs from '@/app/components/profile/ProfileTabs';

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

  if (error && !profile) { // Show error only if profile fails to load
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center py-10 text-white">프로필 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
      <ProfileTabs
        profile={profile}
        isEditing={isEditing}
        avatars={avatars}
        selectedAvatar={selectedAvatar}
        isUpdating={isUpdating}
        error={error}
        handleInputChange={handleInputChange}
        handleUpdateProfile={handleUpdateProfile}
        setIsEditing={setIsEditing}
        setSelectedAvatar={setSelectedAvatar}
      />
    </div>
  );
}