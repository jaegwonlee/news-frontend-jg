'use client';

import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthStatus() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return <div className="h-8 w-24" />; // Placeholder
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/profile" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8">
            <Image
              key={user.profile_image_url}
              src={user.profile_image_url || '/user-placeholder.svg'}
              alt="프로필"
              width={32}
              height={32}
              className="rounded-full object-cover border-2 border-zinc-600 group-hover:border-red-500 transition-colors"
              unoptimized={!!user.profile_image_url}
            />
          </div>
          <span className="text-sm font-medium text-white group-hover:text-red-500 transition-colors">
            {user.nickname || user.name}
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-semibold text-white bg-transparent border border-red-600 rounded-md hover:bg-red-700 hover:border-red-700 transition-colors"
      >
        로그인
      </Link>
      <Link
        href="/register"
        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
      >
        회원가입
      </Link>
    </>
  );
}
