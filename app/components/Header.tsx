// app/components/Header.tsx

"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react"; // Only useState needed
import { BACKEND_BASE_URL } from "@/lib/constants";
// Removed: import { getSearchArticles } from "@/lib/api";
// Removed: import { Article } from "@/types";

const navLinks = [
  { title: "정치", href: "/politics" },
  { title: "경제", href: "/economy" },
  { title: "사회", href: "/social" },
  { title: "문화", href: "/culture" },
  { title: "논쟁", href: "/debate" },
];

export default function Header() {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Removed: const [searchResults, setSearchResults] = useState<Article[]>([]);
  // Removed: const [isSearching, setIsSearching] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery("");
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e?: React.SyntheticEvent) => { // Make event optional or more generic
    e?.preventDefault(); // Conditionally prevent default
    if (searchQuery.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false); // Close search bar after submitting
      setSearchQuery(""); // Clear search query
    }
  };

  // Removed: useEffect for search

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-700 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 및 네비게이션 */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-white cursor-pointer">
              NEWSROUND1
            </Link>
            <nav className="hidden md:flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="text-sm font-medium text-white hover:text-red-500"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* 오른쪽 영역: 검색 및 인증 상태 UI */}
          <div className="flex items-center gap-4">
            {isSearchOpen && (
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  className="w-64 p-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e);
                    }
                  }}
                />
                <Search 
                  className="absolute left-3 w-4 h-4 text-zinc-400 cursor-pointer"
                  onClick={() => handleSearchSubmit()} // Call without event, or pass a generic event
                />
                {/* Removed: isSearching */} 
              </div>
            )}
            <button onClick={handleSearchIconClick} className="p-1 rounded-full hover:bg-zinc-700 transition-colors">
              {isSearchOpen ? (
                <X className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white" />
              ) : (
                <Search className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white" />
              )}
            </button>

            {isAuthLoading ? (
              // Render a placeholder or nothing while auth is loading
              <div className="h-8 w-24" /> // Placeholder with similar height
            ) : user ? (
              // --- 로그인 상태 UI ---
              <div className="flex items-center gap-4">
                {/* 프로필 이미지와 닉네임 (프로필 페이지 링크) */}
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="relative w-8 h-8">
                    <Image
                      key={user.profile_image_url}
                      src={user.profile_image_url ? user.profile_image_url : "/user-placeholder.svg"}
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
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-300 bg-zinc-700 rounded-md hover:bg-zinc-600 hover:text-white transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              // --- 로그아웃 상태 UI ---
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-white bg-transparent border border-zinc-600 rounded-md hover:bg-zinc-800 transition-colors"
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
            )}
          </div>
        </div>
        {/* Removed: Search Results Dropdown */}
      </div>
    </header>
  );
}