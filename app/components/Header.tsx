/**
 * Header 컴포넌트
 * - 사이트의 최상단에 위치하며 로고, 네비게이션, 검색, 로그인/회원가입 버튼을 포함합니다.
 */

import { Search } from "lucide-react";
import Link from "next/link";

// 네비게이션 링크 데이터
const navLinks = [
  { title: "정치", href: "/politics" },
  { title: "경제", href: "/economy" },
  { title: "사회", href: "/social" },
  { title: "문화", href: "/culture" },
  { title: "논쟁", href: "/debate" },
];

export default function Header() {
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
                  className="text-sm font-medium text-white hover:text-red-500" // Hover 색상 변경 (선택 사항)
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* 검색, 로그인, 회원가입 버튼 */}
          <div className="flex items-center gap-4">
            {/* 검색 아이콘 */}
            <Search className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white" />

            {/* 로그인 버튼 (Link 컴포넌트로 변경) */}
            <Link
              href="/login" // 로그인 페이지 경로
              className="px-4 py-2 text-sm font-semibold text-white bg-transparent border border-zinc-600 rounded-md hover:bg-zinc-800 transition-colors" // 스타일 변경 (선택 사항)
            >
              로그인
            </Link>

            {/* 회원가입 버튼 (새로 추가) */}
            <Link
              href="/register" // 회원가입 페이지 경로
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors" // 파란색 배경 적용
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
