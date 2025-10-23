// src/components/Header.tsx

"use client";

import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/common/ThemeToggle";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search input after search
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white border-neutral-200 shadow-sm dark:bg-neutral-900 dark:border-neutral-800 dark:shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center">
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center">
              <div className="text-neutral-900 text-3xl font-extrabold tracking-tighter dark:text-white">
                NEWSROUND1
              </div>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-base font-medium text-neutral-600 dark:text-neutral-300">
            <Link href="/politics" className={pathname === '/politics' ? 'text-red-600' : 'transition-colors hover:text-red-600 dark:hover:text-red-500'}>
              정치
            </Link>
            <Link href="/economy" className={pathname === '/economy' ? 'text-red-600' : 'transition-colors hover:text-red-600 dark:hover:text-red-500'}>
              경제
            </Link>
            <Link href="/society" className={pathname === '/society' ? 'text-red-600' : 'transition-colors hover:text-red-600 dark:hover:text-red-500'}>
              사회
            </Link>
            <Link href="/culture" className={pathname === '/culture' ? 'text-red-600' : 'transition-colors hover:text-red-600 dark:hover:text-red-500'}>
              문화
            </Link>
            <Link href="/discussion" className={pathname === '/discussion' ? 'text-red-600' : 'transition-colors hover:text-red-600 dark:hover:text-red-500'}>
              토론
            </Link>
          </nav>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="검색..."
                  className="pl-3 pr-10 py-2 rounded-full bg-neutral-200 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all duration-300 border-neutral-300 dark:bg-neutral-700 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-neutral-500 hover:text-neutral-700 transition-colors dark:text-neutral-400 dark:hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
              <ThemeToggle />
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex flex-col items-center gap-1 text-xs font-semibold text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white"
                  >
                    <Image 
                      src={user.profileImage || "/placeholder-image.svg"} 
                      alt="프로필" 
                      width={32}
                      height={32}
                      className="rounded-full object-cover border-2 border-neutral-300 dark:border-neutral-600"
                    />
                    <span>{user.nickname}</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-md shadow-lg py-1 z-10 dark:bg-neutral-800 dark:border-neutral-700">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-600">
                        프로필
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 dark:text-red-400 dark:hover:bg-neutral-600"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white">
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}