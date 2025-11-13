'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileSidebar from '@/app/components/profile/ProfileSidebar';
import ProfileHeader from '@/app/components/profile/ProfileHeader';
import ProfileEditForm from '@/app/components/profile/ProfileEditForm';
import LikedArticles from '@/app/components/profile/LikedArticles';
import SavedArticles from '@/app/components/profile/SavedArticles';
import NotificationSettings from '@/app/components/profile/NotificationSettings';
import InquiryForm from '@/app/components/profile/InquiryForm';
import ChangePasswordForm from '@/app/components/profile/ChangePasswordForm';
import DeleteAccountSection from '@/app/components/profile/DeleteAccountSection';
import InquiryHistory from '@/app/components/profile/InquiryHistory';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';

function ProfilePageContent() {
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

  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !profile) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center py-10 text-white">프로필 정보를 불러올 수 없습니다.</div>;
  }

  const renderContent = () => {
    if (isEditing && activeTab === 'profile') {
      return (
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
      );
    }

    switch (activeTab) {
      case 'profile':
        return <ProfileHeader profile={profile} onEditClick={() => setIsEditing(true)} />;
      case 'liked':
        return <LikedArticles />;
      case 'saved':
        return <SavedArticles />;
      case 'notifications':
        return <NotificationSettings />;
      case 'inquiry':
        return <InquiryForm />;
      case 'inquiryHistory':
        return <InquiryHistory />;
      case 'changePassword':
        return <ChangePasswordForm />;
      case 'deleteAccount':
        return <DeleteAccountSection />;
      default:
        return <div className="text-white">선택된 탭이 없습니다.</div>;
    }
  };

  return (
    <div className="flex-grow p-6 md:p-8 lg:p-10">
      {renderContent()}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Suspense fallback={<div className="w-64 flex-shrink-0 bg-zinc-900 p-4 border-r border-zinc-800"><h2 className="text-lg font-semibold text-white mb-6 px-2">마이페이지</h2></div>}>
        <ProfileSidebar />
      </Suspense>
      <main className="flex-grow">
        <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner /></div>}>
          <ProfilePageContent />
        </Suspense>
      </main>
    </div>
  );
}