"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSearchArticles } from "@/lib/api";
import { Article, Topic } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/context/AuthContext";
import { AlertTriangle, SearchX } from "lucide-react";

// Import new components
import SearchInput from "@/app/components/search/SearchInput";
import RecentSearches, { addRecentSearch } from "@/app/components/search/RecentSearches";
import TrendingSearches from "@/app/components/search/TrendingSearches";
import SearchResultCard from "@/app/components/search/SearchResultCard";
import { EmptyState } from "@/app/components/common/EmptyState";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";

// Mock data for trending topics
const mockTrendingTopics: Topic[] = [
  { id: 1, display_name: '인공지능', view_count: 1200, published_at: new Date().toISOString(), summary: '인공지능 관련 최신 동향 및 뉴스' },
  { id: 2, display_name: '부동산 정책', view_count: 980, published_at: new Date().toISOString(), summary: '새로운 부동산 규제와 시장 분석' },
  { id: 3, display_name: '전기차 보조금', view_count: 850, published_at: new Date().toISOString(), summary: '정부의 전기차 구매 보조금 정책' },
  { id: 4, display_name: '코스피', view_count: 760, published_at: new Date().toISOString(), summary: '국내 주식 시장 코스피 지수 정보' },
  { id: 5, display_name: 'CES 2025', view_count: 600, published_at: new Date().toISOString(), summary: '세계 최대 가전 박람회 CES 2025 주요 소식' },
];

function SearchClientPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q");
  const { token } = useAuth();

  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const results = await getSearchArticles(searchQuery, token || undefined);
        setSearchResults(results);
      } catch (err: any) {
        setError(err.message || "검색 결과를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery, token]);

  useEffect(() => {
    setTrendingTopics(mockTrendingTopics);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const renderLoading = () => (
    <div className="flex flex-col justify-center items-center h-full mt-12">
      <LoadingSpinner size="large" />
      <p className="mt-4 text-zinc-400">검색 결과를 불러오는 중...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-white px-4 sm:px-6 lg:px-8">
      <AnimatePresence mode="wait">
        {!searchQuery ? (
          <motion.div
            key="initial"
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto pt-24 pb-16 text-center"
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-400 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              무엇을 찾고 계신가요?
            </motion.h1>
            <p className="text-zinc-400 mb-10 text-lg">뉴스 기사, 토론, 키워드를 검색해 보세요.</p>
            <SearchInput onSearch={handleSearch} />
            <RecentSearches onSearch={handleSearch} />
            <TrendingSearches topics={trendingTopics} onSearch={handleSearch} />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            variants={pageVariants}
            initial="initial"
            animate="in"
            exit="out"
            transition={{ duration: 0.5 }}
            className="w-full max-w-7xl mx-auto pt-10 pb-16"
          >
            <SearchInput onSearch={handleSearch} initialQuery={searchQuery} />
            
            {isLoading ? (
              renderLoading()
            ) : error ? (
               <div className="mt-12">
                 <EmptyState
                    Icon={AlertTriangle}
                    title="오류 발생"
                    description={`검색 중 오류가 발생했습니다: ${error}`}
                  />
               </div>
            ) : (
              <>
                <h2 className="text-xl text-zinc-300 font-semibold mt-10 mb-6">
                  <span className="font-bold text-red-500">'{searchQuery}'</span>
                  <span className="text-zinc-400">에 대한 {searchResults.length}개의 검색 결과</span>
                </h2>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {searchResults.map((article, index) => (
                      <SearchResultCard key={article.id} article={article} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-12">
                    <EmptyState 
                      Icon={SearchX}
                      title="검색 결과 없음"
                      description={`'${searchQuery}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해 보세요.`}
                    />
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


export default function SearchClientPage() {
    return (
        <Suspense fallback={
          <div className="bg-zinc-900 min-h-screen flex flex-col justify-center items-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-zinc-400">페이지 로딩 중...</p>
          </div>
        }>
            <SearchClientPageContent />
        </Suspense>
    )
}
