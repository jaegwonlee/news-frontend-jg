// src/components/Header.tsx

"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <svg width="280" height="60" viewBox="0 0 280 60" xmlns="http://www.w3.org/2000/svg">
                <path id="curve" d="M10,50 Q140,5 270,50" fill="transparent" />
                <text style={{ fill: 'white', fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.05em', textAnchor: 'middle' }}>
                  <textPath href="#curve" startOffset="50%">
                    NEWSROUND1
                  </textPath>
                </text>
              </svg>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-base font-medium text-gray-300">
              <Link href="/politics" className="transition-colors hover:text-red-500">
                정치
              </Link>
              <Link href="/economy" className="transition-colors hover:text-red-500">
                경제
              </Link>
              <Link href="/society" className="transition-colors hover:text-red-500">
                사회
              </Link>
              <Link href="/culture" className="transition-colors hover:text-red-500">
                문화
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">{/* Search Input - kept as is */}</div>
            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full bg-neutral-800 py-1 px-3 text-sm font-semibold text-gray-200 transition-colors hover:bg-neutral-700"
                >
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
    </header>
  );
}
