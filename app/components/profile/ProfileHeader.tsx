"use client";

import { useSavedArticlesManager } from "@/hooks/useSavedArticles";
import { User } from "@/lib/types/user";
import Image from "next/image";

interface ProfileHeaderProps {
  profile: User;
  onEditClick: () => void;
}

export default function ProfileHeader({ profile, onEditClick }: ProfileHeaderProps) {
  const { articles: savedArticles } = useSavedArticlesManager();

  return (
    <div className="p-6 sm:p-8">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-900/5 dark:bg-zinc-100/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        {/* Avatar Ring */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-red-600 rounded-full animate-spin-slow opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
          <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full p-1 bg-white dark:bg-zinc-900">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-zinc-100 dark:border-zinc-800 relative">
              <Image
                src={profile.profile_image_url || "/user-placeholder.svg"}
                alt="Current Avatar"
                fill
                className="object-cover"
                unoptimized={true}
              />
            </div>
          </div>
          <div className="absolute -bottom-2 inset-x-0 flex justify-center">
            <button
              onClick={onEditClick}
              className="bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase px-3 py-1 rounded-full border-2 border-white dark:border-zinc-900 hover:scale-105 transition-transform shadow-lg"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-grow text-center md:text-left space-y-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-zinc-900 dark:text-white">
              {profile.name}
            </h2>
            <p className="text-zinc-500 font-medium">{profile.email}</p>
          </div>

          {profile.introduction ? (
            <div className="relative inline-block max-w-xl">
              <div className="absolute -top-2 -left-2 text-4xl text-zinc-200 dark:text-zinc-800 font-serif">“</div>
              <p className="text-lg text-zinc-700 dark:text-zinc-300 italic font-serif leading-relaxed px-4 relative z-10">
                {profile.introduction}
              </p>
              <div className="absolute -bottom-4 -right-2 text-4xl text-zinc-200 dark:text-zinc-800 font-serif rotate-180">
                “
              </div>
            </div>
          ) : (
            <p className="text-zinc-400 italic text-sm">No introduction yet.</p>
          )}
        </div>

        {/* Stats Card */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-6 rounded-2xl md:min-w-[200px]">
            <div className="flex flex-col items-center">
              <span className="text-xs font-black uppercase text-zinc-400 tracking-widest mb-2">Saved Articles</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{savedArticles.length}</span>
                <span className="text-zinc-400 font-bold text-sm">BOXES</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats Row if needed later */}
    </div>
  );
}
