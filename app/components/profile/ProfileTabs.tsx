
'use client';

import { useState } from 'react';
import ProfileHeader from '@/app/components/profile/ProfileHeader';
import ProfileEditForm from '@/app/components/profile/ProfileEditForm';
import LikedArticles from '@/app/components/profile/LikedArticles';
import SavedArticles from '@/app/components/profile/SavedArticles';
import NotificationSettings from '@/app/components/profile/NotificationSettings';
import InquiryForm from '@/app/components/profile/InquiryForm';
import ChangePasswordForm from '@/app/components/profile/ChangePasswordForm'; // Add this
import DeleteAccountSection from '@/app/components/profile/DeleteAccountSection'; // Add this
import { User } from '@/types';

type Tab = 'profile' | 'liked' | 'saved' | 'notifications' | 'inquiry' | 'changePassword' | 'deleteAccount';

interface ProfileTabsProps {
  profile: User;
  isEditing: boolean;
  avatars: string[];
  selectedAvatar: string | undefined;
  isUpdating: boolean;
  error: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleUpdateProfile: (e: React.FormEvent<HTMLFormElement>) => void;
  setIsEditing: (isEditing: boolean) => void;
  setSelectedAvatar: (avatar: string) => void;
}

export default function ProfileTabs({
  profile,
  isEditing,
  avatars,
  selectedAvatar,
  isUpdating,
  error,
  handleInputChange,
  handleUpdateProfile,
  setIsEditing,
  setSelectedAvatar,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: '프로필' },
    { id: 'liked', label: '좋아요한 기사' },
    { id: 'saved', label: '저장된 기사' },
    { id: 'notifications', label: '알림 설정' },
    { id: 'inquiry', label: '문의하기' },
    { id: 'changePassword', label: '비밀번호 변경' },
    { id: 'deleteAccount', label: '계정 삭제' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
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
            <div className="border-t border-zinc-700 pt-8 mt-8">
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
          </>
        );
      case 'liked':
        return <LikedArticles />;
      case 'saved':
        return <SavedArticles />;
      case 'notifications':
        return <NotificationSettings />;
      case 'inquiry':
        return <InquiryForm />;
      case 'changePassword':
        return <ChangePasswordForm />;
      case 'deleteAccount':
        return <DeleteAccountSection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-1/4">
        <nav className="flex flex-col space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-md text-left font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-700">
        {renderContent()}
      </main>
    </div>
  );
}
