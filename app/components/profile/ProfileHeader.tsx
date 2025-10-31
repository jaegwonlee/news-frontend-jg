'use client';

import Image from 'next/image';
import { User } from '@/types';

interface ProfileHeaderProps {
  profile: User;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
      <div className="relative w-32 h-32">
        <Image
          src={profile.profile_image_url || "/user-placeholder.svg"}
          alt="프로필 이미지"
          width={128}
          height={128}
          className="rounded-full object-cover border-4 border-zinc-700"
          unoptimized={!!profile.profile_image_url}
        />
      </div>
      <div className="text-center sm:text-left flex-1">
        <h1 className="text-3xl font-bold">{profile.nickname || profile.name}</h1>
        <p className="text-zinc-400">{profile.email}</p>
        {profile.phone && <p className="text-zinc-400">전화번호: {profile.phone}</p>}
        {profile.introduction && <p className="mt-2 text-zinc-300">{profile.introduction}</p>}
      </div>
    </div>
  );
}
