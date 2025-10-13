"use client";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-[#1c1c1c] border-gray-200 dark:border-neutral-700">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black tracking-tighter text-black dark:text-white">
              NEWSROUND1
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link href="/politics" className="transition-colors hover:text-red-500">
                정치
              </Link>
              <Link href="/economy" className="transition-colors hover:text-red-500">
                경제
              </Link>
              <Link href="/society" className="transition-colors hover:text-red-500">
                사회
              </Link>
              <Link href="/sports" className="transition-colors hover:text-red-500">
                스포츠
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400 dark:text-gray-500"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                placeholder="검색어를 입력하세요."
                className="w-full rounded-md border bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 px-3 py-2 pl-10 text-sm text-black dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white">
              로그인
            </button>
            <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
              회원가입
            </button>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
