import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { getBreakingNews, getExclusiveNews } from "@/lib/api";
import HorizontalNewsScroller from "@/components/common/HorizontalNewsScroller";

export const metadata: Metadata = {
  title: "NewsRound1",
  description: "Your favorite news portal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [breakingNews, exclusiveNews] = await Promise.all([
    getBreakingNews(),
    getExclusiveNews(),
  ]);

  return (
    <html lang="ko">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
                                <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-neutral-900">
                                  <Header />
                                  {/* Scroller Container */}
                                  <div className="sticky top-[81px] z-40 shadow-md">
                                    {/* Breaking News Scroller */}
                                    <div className="w-full bg-neutral-200 overflow-hidden border-b border-black/20 py-2 dark:bg-neutral-800">
                                      <HorizontalNewsScroller news={breakingNews} />
                                    </div>
                                    {/* Exclusive News Scroller */}
                                    <div className="w-full bg-neutral-200 overflow-hidden border-b border-black/20 py-2 dark:bg-neutral-800">
                                      <HorizontalNewsScroller news={exclusiveNews} />
                                    </div>
                                  </div>
                                  <main className="flex-grow w-full">{children}</main>
                                  <Footer />
                                </div>          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
