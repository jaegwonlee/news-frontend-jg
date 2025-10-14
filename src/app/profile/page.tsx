'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    // This can be a loading spinner as well
    return <div className="text-center text-white p-8">Loading user profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="max-w-2xl mx-auto bg-[#1c1c1c] rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-white mb-6 border-b border-neutral-700 pb-4">프로필</h1>
        <div className="space-y-4 text-lg">
          <div className="flex">
            <p className="w-32 text-neutral-400 font-semibold">닉네임</p>
            <p className="text-white">{user.nickname}</p>
          </div>
          <div className="flex">
            <p className="w-32 text-neutral-400 font-semibold">이메일</p>
            <p className="text-white">{user.email}</p>
          </div>
          {/* Add other user details here as they become available */}
        </div>
        <div className="mt-8 border-t border-neutral-700 pt-6">
            <button 
                onClick={logout}
                className="w-full px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
            >
                로그아웃
            </button>
        </div>
      </div>
    </div>
  );
}
