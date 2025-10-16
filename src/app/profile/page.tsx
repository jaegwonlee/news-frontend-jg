'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-white">Loading user profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="w-full bg-gradient-to-br from-neutral-900 to-black rounded-2xl shadow-2xl overflow-hidden border-2 border-neutral-700 p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <Image
                src={user.profileImage || '/user-icon.svg'}
                alt="Profile"
                width={180}
                height={180}
                className="rounded-full border-4 border-red-500 object-cover shadow-lg"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-bold tracking-wide">{user.nickname}</h1>
              <p className="text-neutral-400 text-xl mt-2">{user.email}</p>
            </div>
            <div className="flex justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={logout}
                className="px-8 py-3 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                로그아웃
              </button>
            </div>
          </div>

          <div className="mt-10 border-t-2 border-neutral-700 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-neutral-800/50 p-6 rounded-xl shadow-lg">
              <p className="text-lg text-neutral-400">토론 참여</p>
              <p className="text-4xl font-bold text-white mt-2">12</p>
            </div>
            <div className="bg-neutral-800/50 p-6 rounded-xl shadow-lg">
              <p className="text-lg text-neutral-400">승리</p>
              <p className="text-4xl font-bold text-green-500 mt-2">8</p>
            </div>
            <div className="bg-neutral-800/50 p-6 rounded-xl shadow-lg">
              <p className="text-lg text-neutral-400">패배</p>
              <p className="text-4xl font-bold text-red-500 mt-2">4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
