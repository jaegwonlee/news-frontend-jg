// src/components/Header.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
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
    <header className="sticky top-0 z-50 w-full border-b bg-[#1c1c1c] border-neutral-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center">
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center">
              <div className="text-white text-3xl font-extrabold tracking-tighter">
                NEWSROUND1
              </div>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-base font-medium text-gray-300">
            <Link href="/politics" className={pathname === '/politics' ? 'text-red-500' : 'transition-colors hover:text-red-500'}>
              정치
            </Link>
            <Link href="/economy" className={pathname === '/economy' ? 'text-red-500' : 'transition-colors hover:text-red-500'}>
              경제
            </Link>
            <Link href="/society" className={pathname === '/society' ? 'text-red-500' : 'transition-colors hover:text-red-500'}>
              사회
            </Link>
            <Link href="/culture" className={pathname === '/culture' ? 'text-red-500' : 'transition-colors hover:text-red-500'}>
              문화
            </Link>
          </nav>
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="검색..."
                  className="pl-3 pr-10 py-2 rounded-full bg-neutral-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all duration-300"
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
                  className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
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
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex flex-col items-center gap-1 text-xs font-semibold text-gray-200 transition-colors hover:text-white"
                  >
                    <Image 
                      src={user.profileImage || "https://via.placeholder.com/150/000000/FFFFFF?text=U"} 
                      alt="프로필" 
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border-2 border-neutral-600"
                      unoptimized
                    />
                    <span>{user.nickname}</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#2e2e2e] border border-neutral-700 rounded-md shadow-lg py-1 z-10">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-neutral-600">
                        프로필
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-neutral-600"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-semibold text-gray-200 hover:text-white">
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
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