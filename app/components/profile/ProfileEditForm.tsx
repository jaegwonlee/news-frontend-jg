// app/components/profile/ProfileEditForm.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User } from '@/types';
import FormField from '@/app/components/auth/FormField';

interface ProfileEditFormProps {
  profile: User;
  avatars: string[];
  selectedAvatar: string | undefined;
  isUpdating: boolean;
  error: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onUpdateProfile: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
  onSetSelectedAvatar: (avatarUrl: string) => void;
}

export default function ProfileEditForm({
  profile,
  avatars,
  selectedAvatar,
  isUpdating,
  error,
  onInputChange,
  onUpdateProfile,
  onCancelEdit,
  onSetSelectedAvatar,
}: ProfileEditFormProps) {
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  return (
    <form onSubmit={onUpdateProfile} className="space-y-8">
      {error && (
        <div className="text-red-400 text-sm text-center p-2 bg-red-900/50 rounded-md mb-4">{error}</div>
      )}
      
      {/* Avatar Selection Section */}
      <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-700">
        <h3 className="text-2xl font-bold text-white mb-6">내 아바타</h3>
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-500">
            <Image
              src={selectedAvatar || profile.profile_image_url || "/user-placeholder.svg"}
              alt="Current Avatar"
              layout="fill"
              objectFit="cover"
              className="rounded-full"
              unoptimized={true}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAvatarOptions(!showAvatarOptions)}
          className="w-full px-4 py-2 mt-4 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          {showAvatarOptions ? '아바타 선택 닫기' : '아바타 수정하기'}
        </button>
        {showAvatarOptions && (
          <div className="mt-6">
            <div className="flex flex-wrap justify-center gap-5">
              {avatars.map((avatarUrl, index) => (
                <div
                key={index}
                className={`relative w-14 h-14 rounded-full cursor-pointer overflow-hidden transition-all duration-200 ease-in-out ${
                  selectedAvatar === avatarUrl ? 'ring-2 ring-red-500 scale-110' : 'ring-1 ring-zinc-600 hover:ring-blue-400'
                }`}
                onClick={() => onSetSelectedAvatar(avatarUrl)}
              >
                <Image
                  src={avatarUrl}
                  alt={`Avatar ${index}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                  unoptimized={true}
                />
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Profile Information Section */}
      <div className="bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-700 space-y-5">
        <h3 className="text-2xl font-bold text-white mb-6">프로필 정보</h3>
        <FormField
          id="nickname"
          label="닉네임"
          type="text"
          name="nickname"
          value={profile.nickname || ""}
          onChange={onInputChange}
        />
        <FormField
          id="phone"
          label="전화번호"
          type="tel"
          name="phone"
          value={profile.phone || ""}
          onChange={onInputChange}
        />
        <div>
          <label htmlFor="introduction" className="block text-sm font-medium text-zinc-400 mb-1">자기소개</label>
          <textarea
            id="introduction"
            name="introduction"
            value={profile.introduction || ""}
            onChange={onInputChange}
            rows={3}
            className="mt-1 block w-full bg-zinc-900 border border-zinc-600 rounded-md py-2 px-3 text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="자기소개를 입력하세요."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancelEdit}
          className="px-6 py-3 text-base font-semibold text-white bg-zinc-600 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isUpdating}
          className="px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-zinc-500 transition-colors"
        >
          {isUpdating ? "저장 중..." : "변경사항 저장"}
        </button>
      </div>
    </form>
  );
}