import { getSearchArticles } from '@/lib/api';
import KeywordClientPage from '../KeywordClientPage';
import { Suspense } from 'react';
import LoadingSpinner from '@/app/components/common/LoadingSpinner';

export default async function KeywordPage({ params }: { params: { slug: string } }) {
  const keyword = decodeURIComponent(params.slug);
  
  // A simple suspense boundary for the data fetching
  const PageContent = async () => {
    const articles = await getSearchArticles(keyword);
    return <KeywordClientPage articles={articles} keyword={keyword} />;
  }

  return (
    <Suspense fallback={
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground">'{keyword}' 관련 기사를 불러오는 중...</p>
        </div>
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
