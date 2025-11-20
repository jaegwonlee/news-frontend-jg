'use client';

import Link from 'next/link';
import { Bell, HelpCircle } from 'lucide-react';
import SearchBar from './header/SearchBar';
import AuthStatus from './header/AuthStatus';
import { usePathname } from 'next/navigation'; // Import usePathname

const navLinks = [
  { title: '정치', href: '/politics' },
  { title: '경제', href: '/economy' },
  { title: '사회', href: '/social' },
  { title: '문화', href: '/culture' },
  { title: '라운드톡', href: '/debate' },
];

export default function Header() {
  const pathname = usePathname(); // Get the current path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-700 bg-black">
      <div className="max-w-[1920px] mx-auto px-12 md:px-16 lg:px-20">
        <div className="flex justify-between items-center h-16">
          {/* Left Section: Logo */}
          <div className="flex-1">
            <Link href="/" className="pl-4 text-xl md:text-2xl font-bold text-white cursor-pointer">
              NEWSROUND1
            </Link>
          </div>

          {/* Center Section: Navigation */}
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className={`text-sm font-medium hover:text-red-500 ${isActive ? 'text-red-500' : 'text-white'}`}>
                  {link.title}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Icons and Auth */}
          <div className="flex-1 flex justify-end items-center gap-4 pr-4">
            <Link href="/inquiry" className="p-1 rounded-full hover:bg-zinc-700 transition-colors">
                <HelpCircle className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white" />
            </Link>
            <Link href="/notifications" className="p-1 rounded-full hover:bg-zinc-700 transition-colors">
                <Bell className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-white" />
            </Link>
            <SearchBar />
            <AuthStatus />
          </div>
        </div>
      </div>
    </header>
  );
}