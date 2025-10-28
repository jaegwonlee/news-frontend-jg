// app/components/Header.tsx

"use client";

import { useAuth } from "@/app/context/AuthContext";
import { Search, UserCircle } from "lucide-react"; // UserCircle 아이콘 추가
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BACKEND_BASE_URL } from "@/lib/constants"; // Import BACKEND_BASE_URL

const navLinks = [
  { title: "정치", href: "/politics" },
  { title: "경제", href: "/economy" },
  { title: "사회", href: "/social" },
  { title: "문화", href: "/culture" },
  { title: "논쟁", href: "/debate" },
];

export default function Header() {
  // 👇 token 대신 isAuthenticated 사용 (또는 token 직접 사용 유지 가능)
  const { user, logout } = useAuth(); 
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/"); 
  };

  return (
    // 헤더 스타일 유지 (bg-black/80, backdrop-blur-md 등)
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
            <Search className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white" />

            {/* 👇 로그인 상태 확인 (user 객체 존재 여부로 판단) */}
            {user ? (
              // --- 로그인 상태 UI ---
              <div className="flex items-center gap-4">
                {/* 프로필 이미지와 닉네임 (프로필 페이지 링크) */}
                <Link href="/profile" className="flex items-center gap-2 group">
                  <div className="relative w-8 h-8">
                    <Image
                      src={user.profile_image_url ? `${BACKEND_BASE_URL}${user.profile_image_url}` : "/user-placeholder.svg"} 
                      alt="프로필"
                      width={32}
                      height={32}
                      className="rounded-full object-cover border-2 border-zinc-600 group-hover:border-red-500 transition-colors"
                      unoptimized={!!user.profile_image_url}
                    />
                  </div>
                  {/* 닉네임 표시, 없으면 name 표시 */}
                  <span className="text-sm font-medium text-white group-hover:text-red-500 transition-colors">
                    {user.nickname || user.name}
                  </span>
                </Link>
                {/* 로그아웃 버튼 */}
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
      </div>
    </header>
  );
}