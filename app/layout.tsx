import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { SocketProvider } from "@/app/context/SocketContext";
import Header from "./components/Header";
import Footer from "./components/Footer";

// 1. 추가: API 함수 및 새 컴포넌트 import
import { getBreakingNews, getExclusiveNews } from "@/lib/api";
import HorizontalNewsScroller from "./components/common/HorizontalNewsScroller";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEWSROUND1",
  description: "뉴스라운드 메인 페이지",
};

// 2. 수정: RootLayout을 async 함수로 변경
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // 3. 추가: 서버에서 스크롤러용 데이터 미리 가져오기
  const [breakingNews, exclusiveNews] = await Promise.all([
    getBreakingNews(),
    getExclusiveNews(),
  ]);

  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <SocketProvider>
            <Header />
            
            {/* 4. 추가: HorizontalNewsScroller 컴포넌트 2개 배치 */}
            {/* 스크롤러 컨테이너 (헤더 아래에 고정) */}
            <div className="sticky top-16 z-40 shadow-md">
              
              {/* 속보 뉴스 스크롤러 (배경색 bg-zinc-900, 경계선 border-zinc-700으로 수정) */}
              <div className="w-full bg-zinc-900 overflow-hidden border-b border-zinc-700 py-2">
                <HorizontalNewsScroller news={breakingNews} />
              </div>

              {/* 단독 뉴스 스크롤러 (배경색 bg-zinc-900, 경계선 border-zinc-700으로 수정) */}
              <div className="w-full bg-zinc-900 overflow-hidden border-b border-zinc-700 py-2">
                <HorizontalNewsScroller news={exclusiveNews} />
              </div>
              
            </div>
            
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}