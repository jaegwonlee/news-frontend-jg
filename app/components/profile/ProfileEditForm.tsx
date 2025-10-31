'use client';

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
  return (
    <form onSubmit={onUpdateProfile} className="space-y-6">
      {error && (
        <div className="text-red-400 text-sm text-center p-2 bg-red-900/50 rounded-md mb-4">{error}</div>
      )}
      
      {/* Avatar Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-400 mb-2">아바타 선택</label>
        <div className="flex flex-wrap gap-3 p-3 bg-zinc-800 rounded-md border border-zinc-700">
          {avatars.map((avatarUrl, index) => (
            <div
              key={index}
              className={`relative w-16 h-16 rounded-full cursor-pointer overflow-hidden ${
                selectedAvatar === avatarUrl ? 'ring-2 ring-blue-500' : 'ring-1 ring-zinc-600'
              } hover:ring-blue-400 transition-all`}
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

      {/* Profile Fields */}
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
          className="mt-1 block w-full bg-zinc-800 border border-zinc-600 rounded-md py-2 px-3 text-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="자기소개를 입력하세요."
        />
      </div>

      {/* Save/Cancel buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancelEdit}
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
  );
}
