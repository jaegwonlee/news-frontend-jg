'use client';

import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

const Footer = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && theme === 'dark';
  const footerBgColor = isDarkMode ? '#000000' : '#ffffff';
  const footerTextColor = isDarkMode ? '#ffffff' : '#000000';
  const footerBorderColor = isDarkMode ? '#27272a' : '#e5e5e5'; // neutral-800 vs neutral-200

  return (
    <footer className="w-full mt-24" style={{backgroundColor: footerBgColor, color: footerTextColor}}>
      <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">뉴스</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/politics" className="hover:text-primary">
                  정치
                </Link>
              </li>
              <li>
                <Link href="/economy" className="hover:text-primary">
                  경제
                </Link>
              </li>
              <li>
                <Link href="/social" className="hover:text-primary">
                  사회
                </Link>
              </li>
              <li>
                <Link href="/culture" className="hover:text-primary">
                  문화
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">토론</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/debate" className="hover:text-primary">
                  토론 목록
                </Link>
              </li>
              <li>
                <Link href="/debate/new" className="hover:text-primary">
                  토론 시작하기
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">소셜</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-primary">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Gemini News</h3>
            <p className="text-muted-foreground">최신 뉴스와 심도 있는 토론을 한 곳에서 만나보세요.</p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t text-center" style={{borderColor: footerBorderColor}}>
          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} Gemini News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
