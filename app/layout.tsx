import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Header 컴포넌트를 가져옵니다.
import Header from "./components/Header";

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

/**
 * RootLayout (최상위 레이아웃)
 * - 모든 페이지에 공통으로 적용되는 <html>, <body> 태그를 정의합니다.
 * - 폰트, 기본 배경색, <Header> 등 공통 UI를 포함합니다.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Header를 {children} 바깥에 두어 모든 페이지에 공통으로 표시되도록 합니다. */}
        <Header />

        {/* {children}은 각 페이지의 page.tsx 파일을 의미합니다. 
          flex-1을 가진 main 태그로 감싸 헤더/푸터를 제외한 영역을 채우도록 합니다.
        */}
        <main className="flex-1 w-full">{children}</main>

        {/* 나중에 푸터를 추가한다면 이 위치에 넣으면 됩니다. */}
        {/* <footer> ... </footer> */}
      </body>
    </html>
  );
}
