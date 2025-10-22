'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchArticles } from '@/lib/api';
import NewsCard from '@/components/news/NewsCard';
import { Article } from '@/types/article';

function SearchPageComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('created_at'); // Default sort by created_at
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default sort order desc (latest)

  const performSearch = useCallback(async (searchQuery: string, newSearch: boolean = false) => {
    if (!searchQuery.trim()) {
      setArticles([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const currentPage = newSearch ? 1 : page;
    const fetchedArticles = await searchArticles(searchQuery, currentPage, 10, sortBy, sortOrder);
    
    if (newSearch) {
      setArticles(fetchedArticles);
    } else {
      setArticles(prev => [...prev, ...fetchedArticles]);
    }

    setHasMore(fetchedArticles.length === 10);
    setPage(currentPage + 1);
    setLoading(false);
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    performSearch(initialQuery, true);
  }, [initialQuery, sortBy, sortOrder, performSearch]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/search?query=${encodeURIComponent(query)}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder as 'asc' | 'desc');
    setPage(1); // Reset page when sort order changes
  };

  const loadMore = () => {
    performSearch(query);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="w-full pl-4 pr-12 py-3 rounded-full bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="absolute right-0 top-0 h-full w-12 flex items-center justify-center text-neutral-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          &quot;{initialQuery}&quot; 검색 결과
        </h1>
        <div className="relative">
          <select
            onChange={handleSortChange}
            value={`${sortBy}-${sortOrder}`}
            className="block appearance-none w-full bg-neutral-800 border border-neutral-700 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-neutral-700 focus:border-blue-500"
          >
            <option value="created_at-desc">최신순</option>
            <option value="created_at-asc">오래된순</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {loading && articles.length === 0 ? (
        <div className="text-center text-neutral-400 py-10">검색 결과를 불러오는 중...</div>
      ) : articles.length === 0 ? (
        <div className="text-center text-neutral-400 py-10">
          <p>&quot;{initialQuery}&quot;에 대한 검색 결과가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-neutral-600"
              >
                {loading ? '불러오는 중...' : '더 보기'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center text-neutral-400 py-10">페이지를 불러오는 중...</div>}>
      <SearchPageComponent />
    </Suspense>
  );
}