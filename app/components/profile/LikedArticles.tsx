'use client';

import { useLikedArticles } from '@/hooks/useLikedArticles';
import ArticleCard from '@/app/components/ArticleCard';

export default function LikedArticles() {
  const { articles, isLoading, error, handleUnlike } = useLikedArticles();

  return (
    <section className="mt-12 bg-zinc-900 rounded-lg shadow-lg p-8 border border-zinc-700">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-zinc-700 pb-3">좋아요한 기사</h2>
      {isLoading ? (
        <div className="text-center py-10 text-zinc-400">좋아요한 기사 로딩 중...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">오류: {error}</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-10 text-zinc-400">아직 좋아요한 기사가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} onLikeToggle={handleUnlike} onSaveToggle={undefined} />
          ))}
        </div>
      )}
    </section>
  );
}
