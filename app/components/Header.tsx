'use client';

import Link from 'next/link';
import SearchBar from './header/SearchBar';
import AuthStatus from './header/AuthStatus';

const navLinks = [
  { title: '정치', href: '/politics' },
  { title: '경제', href: '/economy' },
  { title: '사회', href: '/social' },
  { title: '문화', href: '/culture' },
  { title: '토픽', href: '/debate' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-700 bg-black/80 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section: Logo */}
          <div className="flex-1">
            <Link href="/" className="text-2xl font-bold text-white cursor-pointer">
              NEWSROUND1
            </Link>
          </div>

          {/* Center Section: Navigation */}
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

          {/* Right Section: Search and Auth */}
          <div className="flex-1 flex justify-end items-center gap-4">
            <SearchBar />
            <AuthStatus />
          </div>
        </div>
      </div>
    </header>
  );
}
