'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User } from '@/types';
import { useSavedArticlesManager } from '@/hooks/useSavedArticles';
import { useLikedArticles } from '@/hooks/useLikedArticles';
import { Bookmark, Heart, User as UserIcon, Phone, Info } from 'lucide-react';

interface ProfileHeaderProps {
  profile: User;
}

type InnerTab = 'info' | 'activity';

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [innerTab, setInnerTab] = useState<InnerTab>('info');
  const { articles: savedArticles } = useSavedArticlesManager();
  const { articles: likedArticles } = useLikedArticles();

  const TabButton = ({ tab, label }: { tab: InnerTab; label: string }) => (
    <button
      type="button"
      onClick={() => setInnerTab(tab)}
      className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${
        innerTab === tab ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      {label}
    </button>
  );

  const infoItems = [
    { icon: <UserIcon className="w-5 h-5 text-zinc-400" />, label: '닉네임', value: profile.nickname },
    { icon: <Phone className="w-5 h-5 text-zinc-400" />, label: '전화번호', value: profile.phone },
  ];

  return (
    <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl shadow-2xl p-6 md:p-8">
      {/* Centered Header */}
      <div className="flex flex-col items-center text-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-offset-4 ring-offset-zinc-900 ring-blue-500">
          <Image
            src={profile.profile_image_url || "/user-placeholder.svg"}
            alt="Current Avatar"
            layout="fill"
            objectFit="cover"
            className="rounded-full"
            unoptimized={true}
          />
        </div>
        <h2 className="mt-4 text-3xl font-bold text-white">{profile.name}</h2>
        <p className="text-md text-zinc-400">{profile.email}</p>
      </div>

      {/* Inner Tab Switcher */}
      <div className="flex justify-center my-8 p-1 bg-zinc-900 rounded-full">
        <TabButton tab="info" label="프로필 정보" />
        <TabButton tab="activity" label="나의 활동" />
      </div>

      {/* Tab Content */}
      <div className="min-h-[250px]">
        {innerTab === 'info' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-4">
              {infoItems.map((item, index) => (
                item.value ? (
                  <div key={index} className="flex items-start gap-4 p-4 bg-zinc-800/70 rounded-lg border border-zinc-700">
                    <div className="flex-shrink-0 mt-1">{item.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-400">{item.label}</p>
                      <p className="text-base font-semibold text-white">{item.value}</p>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
            {profile.introduction && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Info className="w-5 h-5 text-zinc-400" />
                  <h4 className="text-sm font-semibold text-zinc-300">자기소개</h4>
                </div>
                <p className="text-base text-zinc-200 bg-zinc-800/70 border border-zinc-700 p-4 rounded-lg whitespace-pre-wrap">
                  {profile.introduction}
                </p>
              </div>
            )}
          </div>
        )}

        {innerTab === 'activity' && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between p-4 bg-zinc-800/70 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-4">
                <Bookmark className="w-6 h-6 text-blue-400" />
                <span className="font-semibold text-white text-lg">저장한 기사</span>
              </div>
              <span className="font-bold text-2xl text-blue-400">{savedArticles.length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-zinc-800/70 rounded-lg border border-zinc-700">
              <div className="flex items-center gap-4">
                <Heart className="w-6 h-6 text-red-400" />
                <span className="font-semibold text-white text-lg">좋아요한 기사</span>
              </div>
              <span className="font-bold text-2xl text-red-400">{likedArticles.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
